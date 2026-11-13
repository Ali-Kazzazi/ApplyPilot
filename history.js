(function (root) {
    const defaults = () => ({ professorId: "", kind: "", from: "", to: "" });

    function recordedDate(value) {
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
        const date = new Date(value + "T00:00:00Z");
        return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
            ? value : "";
    }

    function buildEntries(db) {
        const professors = new Map((db.professors || []).map((x) => [x.id, x]));
        const positions = new Map((db.positions || []).map((x) => [x.id, x]));
        const universities = new Map((db.universities || []).map((x) => [x.id, x]));
        return ["professors", "letters", "correspondence"].flatMap((kind) =>
            (db[kind] || []).map((record) => {
                const position = positions.get(record.positionId);
                const professorId = kind === "professors" ? record.id
                    : record.professorId || position?.professorId || "";
                const professor = professors.get(professorId);
                const university = universities.get(professor?.universityId || position?.universityId);
                const entry = {
                    kind,
                    id: record.id,
                    professorId,
                    professorName: professor?.name || (professorId ? "Unknown professor" : "No professor linked"),
                    positionTitle: position?.title || "",
                    universityName: university?.name || "",
                    date: recordedDate(kind === "professors" ? record.lastContact
                        : kind === "letters" ? record.sentDate : record.date),
                    title: kind === "professors" ? "Professor contact: " + (record.name || "Unnamed professor")
                        : kind === "letters" ? record.title || "Untitled letter" : record.subject || "Untitled email",
                    status: kind === "correspondence" ? record.outcome || "" : record.status || "",
                    direction: kind === "correspondence" ? record.direction || "" : "",
                    detail: kind === "letters" ? record.subject || "" : record.notes || "",
                };
                entry.searchText = [...Object.values(entry), ...Object.values(record), professor?.email || ""]
                    .join(" ").toLowerCase();
                return entry;
            }),
        );
    }

    function filterEntries(entries, filters = defaults(), search = "") {
        const query = search.trim().toLowerCase();
        return entries.filter((entry) =>
            (!filters.professorId || entry.professorId === filters.professorId) &&
            (!filters.kind || entry.kind === filters.kind) &&
            (!filters.from || (entry.date && entry.date >= filters.from)) &&
            (!filters.to || (entry.date && entry.date <= filters.to)) &&
            (!query || entry.searchText.includes(query)),
        ).sort((a, b) => {
            if (!a.date) return b.date ? 1 : 0;
            if (!b.date) return -1;
            return b.date.localeCompare(a.date);
        });
    }

    const api = { defaults, buildEntries, filterEntries };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    else root.ActivityHistory = api;
})(globalThis);
