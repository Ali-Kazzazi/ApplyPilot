const test = require("node:test");
const assert = require("node:assert/strict");
const { defaults, buildEntries, filterEntries } = require("./history");

function fixture() {
    return {
        universities: [{ id: "u1", name: "North University" }],
        professors: [
            { id: "p1", name: "Ada Smith", universityId: "u1", email: "ada@example.com", lastContact: "2026-10-10", status: "Contacted" },
            { id: "p2", name: "Ben Jones", lastContact: "", status: "Not contacted" },
        ],
        positions: [{ id: "pos1", title: "Robotics PhD", professorId: "p1", universityId: "u1" }],
        letters: [
            { id: "l1", title: "Research introduction", professorId: "p1", sentDate: "2026-10-11", status: "Sent" },
            { id: "l2", title: "Follow-up draft", positionId: "pos1", status: "Draft" },
            { id: "l3", title: "Unassigned draft", status: "Draft" },
        ],
        correspondence: [
            { id: "e1", subject: "Meeting invitation", professorId: "p1", date: "2026-10-12", direction: "Incoming", outcome: "Interested", notes: "Discuss funding" },
            { id: "e2", subject: "Introduction", professorId: "p2", date: "2026-10-09", direction: "Outgoing" },
        ],
    };
}

test("combines all three record types, orders newest first and puts undated records last", () => {
    const db = fixture();
    const before = JSON.stringify(db);
    const rows = filterEntries(buildEntries(db));
    assert.deepEqual(rows.map((x) => x.id), ["e1", "l1", "p1", "e2", "p2", "l2", "l3"]);
    assert.equal(rows[0].direction, "Incoming");
    assert.equal(rows[0].status, "Interested");
    assert.equal(JSON.stringify(db), before, "building a timeline must not change stored records");
});

test("professor filter includes letters and emails linked through a position", () => {
    const db = fixture();
    db.correspondence.push({ id: "e3", positionId: "pos1", subject: "Position reply" });
    const rows = filterEntries(buildEntries(db), { ...defaults(), professorId: "p1" });
    assert.deepEqual(rows.map((x) => x.id), ["e1", "l1", "p1", "l2", "e3"]);
    assert.equal(rows.find((x) => x.id === "l2").professorName, "Ada Smith");
});

test("combines professor, type, inclusive date range and case-insensitive search", () => {
    const entries = buildEntries(fixture());
    const filters = { professorId: "p1", kind: "correspondence", from: "2026-10-12", to: "2026-10-12" };
    assert.deepEqual(filterEntries(entries, filters, "  FUNDING  ").map((x) => x.id), ["e1"]);
    assert.equal(filterEntries(entries, { ...filters, professorId: "p2" }).length, 0);
    assert.equal(filterEntries(entries, { ...filters, kind: "letters" }).length, 0);
    assert.equal(filterEntries(entries, filters, "unmatched").length, 0);
});

test("date filters exclude undated rows and respect one-sided and reversed ranges", () => {
    const entries = buildEntries(fixture());
    assert.deepEqual(filterEntries(entries, { ...defaults(), from: "2026-10-11" }).map((x) => x.id), ["e1", "l1"]);
    assert.deepEqual(filterEntries(entries, { ...defaults(), to: "2026-10-10" }).map((x) => x.id), ["p1", "e2"]);
    assert.equal(filterEntries(entries, { ...defaults(), from: "2026-10-12", to: "2026-10-10" }).length, 0);
    assert.equal(filterEntries(entries, defaults()).length, entries.length);
});

test("search finds professor names, emails, university and position labels", () => {
    const entries = buildEntries(fixture());
    for (const search of ["Ada Smith", "ada@example.com", "North University", "Robotics PhD"]) {
        assert.ok(filterEntries(entries, defaults(), search).some((x) => x.id === "l2"), search);
    }
});

test("explicit recipient takes precedence over the position supervisor", () => {
    const db = fixture();
    db.letters.push({ id: "l4", professorId: "p2", positionId: "pos1" });
    const entry = buildEntries(db).find((x) => x.id === "l4");
    assert.equal(entry.professorId, "p2");
    assert.equal(entry.professorName, "Ben Jones");
});

test("handles empty collections, deleted links and invalid dates without inventing dates", () => {
    assert.deepEqual(buildEntries({}), []);
    const db = fixture();
    db.letters.push({ id: "invalid", professorId: "deleted", sentDate: "2026-02-30" });
    db.correspondence.push({ id: "invalid-email", date: "not-a-date" });
    const entries = buildEntries(db);
    assert.equal(entries.find((x) => x.id === "invalid").date, "");
    assert.equal(entries.find((x) => x.id === "invalid-email").date, "");
    assert.equal(entries.find((x) => x.id === "invalid").professorName, "Unknown professor");
    assert.equal(entries.find((x) => x.id === "l3").professorName, "No professor linked");
});
