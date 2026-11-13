"use strict";
const crypto = require("crypto");
const COLLECTIONS = [
  "universities",
  "professors",
  "positions",
  "letters",
  "events",
  "tasks",
  "correspondence",
  "documents",
  "checklistItems",
];
const REFS = {
  professors: { universityId: "universities" },
  positions: { universityId: "universities", professorId: "professors" },
  letters: { professorId: "professors", positionId: "positions" },
  correspondence: { professorId: "professors", positionId: "positions" },
  documents: { positionId: "positions" },
  checklistItems: { positionId: "positions" },
  tasks: {
    positionId: "positions",
    professorId: "professors",
    universityId: "universities",
  },
  events: {
    positionId: "positions",
    professorId: "professors",
    universityId: "universities",
  },
};
const normalize = (x) =>
  String(x ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");
const cleanId = (x) => (typeof x === "string" ? x.trim() : "");
function valid(data) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw Error("The JSON root must be an object.");
  if (!COLLECTIONS.some((k) => Array.isArray(data[k])))
    throw Error(
      "Not an ApplyPilot database: no recognized record collections.",
    );
  for (const k of COLLECTIONS) {
    if (
      k in data &&
      (!Array.isArray(data[k]) ||
        data[k].some((r) => !r || typeof r !== "object" || Array.isArray(r)))
    )
      throw Error("Invalid records in " + k);
  }
}
const newId = () => crypto.randomUUID();
function merge(current, incoming) {
  valid(incoming);
  const output = structuredClone(current),
    maps = {},
    stats = {},
    occupied = new Set();
  for (const k of COLLECTIONS) {
    output[k] = Array.isArray(output[k]) ? output[k] : [];
    for (const r of output[k]) if (cleanId(r.id)) occupied.add(r.id);
    maps[k] = new Map();
    stats[k] = { added: 0, matched: 0, renamed: 0 };
  }
  const incomingIDs = {};
  for (const k of COLLECTIONS) {
    incomingIDs[k] = new Set();
    for (const r of incoming[k] || []) {
      const id = cleanId(r.id);
      if (id) {
        if (incomingIDs[k].has(id))
          throw Error("Duplicate ID in imported " + k + ": " + id);
        incomingIDs[k].add(id);
      }
    }
  }
  for (const k of COLLECTIONS) {
    const input = incoming[k] || [],
      dest = output[k],
      idMap = maps[k];
    for (const record of input) {
      const old = cleanId(record.id);
      let existing = old ? dest.find((x) => x.id === old) : null;
      if (
        existing &&
        ["universities", "professors"].includes(k) &&
        normalize(existing.name) !== normalize(record.name)
      )
        existing = null;
      // Match actual institutions and academics by normalized names, only when unambiguous.
      if (!existing && k === "universities" && normalize(record.name)) {
        const found = dest.filter(
          (x) =>
            normalize(x.name) === normalize(record.name) &&
            normalize(x.country) === normalize(record.country),
        );
        if (found.length === 1) existing = found[0];
      }
      if (!existing && k === "professors" && normalize(record.name)) {
        const parent =
          maps.universities.get(cleanId(record.universityId)) ||
          cleanId(record.universityId);
        const found = dest.filter(
          (x) =>
            normalize(x.name) === normalize(record.name) &&
            cleanId(x.universityId) === parent,
        );
        if (found.length === 1) existing = found[0];
      }
      if (existing) {
        stats[k].matched++;
        if (old) idMap.set(old, existing.id);
        continue;
      }
      let id = old;
      if (!id || occupied.has(id)) {
        id = newId();
        stats[k].renamed++;
      }
      occupied.add(id);
      if (old) idMap.set(old, id);
      const copy = structuredClone(record);
      copy.id = id;
      for (const [field, collection] of Object.entries(REFS[k] || {})) {
        const ref = cleanId(copy[field]);
        if (ref && maps[collection].has(ref))
          copy[field] = maps[collection].get(ref);
      }
      dest.push(copy);
      stats[k].added++;
    }
  }
  return {
    data: output,
    stats,
    totals: {
      added: Object.values(stats).reduce((s, x) => s + x.added, 0),
      matched: Object.values(stats).reduce((s, x) => s + x.matched, 0),
      renamed: Object.values(stats).reduce((s, x) => s + x.renamed, 0),
    },
  };
}
module.exports = { merge, valid, COLLECTIONS };
