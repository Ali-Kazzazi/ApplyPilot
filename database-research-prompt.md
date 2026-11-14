# ApplyPilot database research prompt

Copy the prompt below into a model with web access. Replace the bracketed inputs and attach [database-template.json](database-template.json) and [database.schema.json](database.schema.json). Save the result as `applypilot-research.json`.

In ApplyPilot, open **Settings & backup → Merge JSON files** and review the preview before confirming. Merge skips matches and keeps your settings. **Import JSON backup** replaces your current records and settings. The schema is for validating generated files outside ApplyPilot. The app does not enforce it, and older exports may contain extra fields or nonstandard values.

Merge looks for matching IDs. It can also match a university by normalized name and country or a professor by normalized name and university, when the match is unambiguous. Positions with different IDs can both be added even if their titles and URLs match. Reuse known IDs when repeating a search. To update existing records, edit them in the app or prepare a full replacement export from a fresh backup. Attachment bytes live separately from the JSON.

---

## Prompt to copy

Search the web for graduate opportunities and produce an importable ApplyPilot JSON file. Follow `database.schema.json` if provided. Use the record shapes and rules below to produce the file.

- Degree and research topics: [e.g., PhD in electrical engineering, power systems and SCADA]
- Countries or universities: [list]
- Intake and deadline window: [e.g., Fall 2027, applications still open]
- My background and constraints: [experience, funding needs, language, eligibility]
- Maximum number of opportunities: [e.g., 10]

Use official university admissions pages, department pages, faculty profiles, lab sites, or funding announcements. Open each source before recording a claim. Confirm that deadlines, fees, and eligibility apply to the requested intake and applicant category. Distinguish a named vacancy from a general program. Record funding terms as published and include the currency for costs or stipends. If a fact is unknown, leave its field empty. Leave `deadline` empty for rolling, approximate, or unconfirmed dates and explain the wording in `notes`. Use public professional contact details only.

Store `positions.applicationCost` as a plain numeric string such as `"125.00"`, or `""` if unknown. Put the currency and fee conditions in `positions.notes`; ApplyPilot's Analytics sums the numeric amounts without converting currencies. Use `positions.deadline` for the opportunity-specific cutoff because the calendar and reminders use that field. Put official cutoff times and time zones in `notes`.

Create one record per university, professor, and distinct opportunity. Use `Not contacted` for new professors and `Interested` for new positions. Link a supervisor only when the official sources support that association. Put source URLs in each relevant record’s `notes`, alongside the facts they support and the date checked. Put the application page in `positions.url` and the relevant official profile or homepage in `website`. When a requirement is specific to an opportunity, store it on that position. Record any subjective research fit as a string from `"1"` to `"5"` only when my background is supplied, and explain the score in `notes`.

Return one valid JSON object with these top-level keys. For a research batch, populate `universities`, `professors`, and `positions`. Keep the other arrays empty and `settings` as `{}` unless I specifically request additional records. Never invent personal activity such as sent emails, interviews, application submissions, completed tasks, or local attachments. Return the JSON file, or raw JSON only if you cannot create a file.

```json
{
  "universities": [],
  "professors": [],
  "positions": [],
  "letters": [],
  "events": [],
  "tasks": [],
  "correspondence": [],
  "documents": [],
  "checklistItems": [],
  "settings": {}
}
```

### Record shapes

Each line below is an example of one object inside the named array. Empty strings show the shape and should be filled only when appropriate. Every record needs a unique string `id`. Generate UUIDs for new records and reuse their exact values in linked fields. When I supply an existing export as a reference, reuse IDs for matching entities and keep the ID of an existing record if you include it. Include referenced parent records in the output when the file should also work on an empty database. Otherwise, a nonempty reference must resolve to an existing record in the supplied database. Use an empty string for an optional link without a match.

```text
universities:   {"id":"","name":"","country":"","city":"","ranking":"","acceptanceRate":"","deadline":"","scholarship":"","website":"","tuition":"","applicationFee":"","language":"","funding":"","notes":""}
professors:     {"id":"","name":"","universityId":"","department":"","email":"","research":"","publications":"","fit":"","website":"","status":"","lastContact":"","followUp":"","notes":""}
positions:      {"id":"","title":"","degree":"","universityId":"","professorId":"","field":"","funding":"","deadline":"","url":"","status":"","requirements":"","documentsRequired":"","applicationCost":"","decisionDate":"","notes":""}
letters:        {"id":"","title":"","type":"","professorId":"","positionId":"","subject":"","status":"","sentDate":"","followUp":"","template":"","body":""}
events:         {"id":"","title":"","date":"","time":"","type":"","positionId":"","notes":""}
tasks:          {"id":"","title":"","due":"","priority":"","positionId":"","done":false,"notes":""}
correspondence: {"id":"","subject":"","professorId":"","positionId":"","direction":"","date":"","outcome":"","nextFollowUp":"","notes":""}
documents:      {"id":"","title":"","category":"","positionId":"","version":"","status":"","notes":""}
checklistItems: {"id":"","positionId":"","title":"","done":false}
```

`universityId` points to `universities`, `professorId` to `professors`, and `positionId` to `positions`. Each checklist item belongs to one position. For a linked position and professor, check that both point to the same university.

The merge code also recognizes optional `universityId` and `professorId` on `events` and `tasks`. The app's forms expose `positionId` for those collections. For application documents, fill `positions.documentsRequired` with one document name per line. ApplyPilot builds the checklist from that text and uses `checklistItems` for saved completion and custom items. If you supply a completion record, match its `title` exactly to the requirement and use only one record for each position and title.

Use strings for all shown values except `done`, which is a JSON boolean. Use `YYYY-MM-DD` for exact dates, `HH:MM` for times, and `\n` inside strings for line breaks, especially in `documentsRequired` (one document per line). Give every university and professor a `name`, every correspondence entry a `subject`, and every other record a `title`. Events also need a date. If asked to draft letters, use plain text or simple HTML for `body`.

### Allowed dropdown values

| Field | Values |
| --- | --- |
| `professors.fit` | `1`, `2`, `3`, `4`, `5` as strings |
| `professors.status` | `Not contacted`, `Draft ready`, `Contacted`, `Replied`, `Interested`, `Not available` |
| `positions.degree` | `PhD`, `Master`, `Research assistant`, `Other` |
| `positions.status` | `Interested`, `Preparing`, `Applied`, `Interview`, `Offer`, `Rejected`, `Withdrawn` |
| `letters.type` | `First contact`, `Follow-up`, `Statement of purpose`, `Motivation letter`, `Thank you`, `Other` |
| `letters.status` | `Draft`, `Ready`, `Sent`, `Replied` |
| `letters.template` | `Custom`, `First contact`, `Follow-up`, `Thank you`, `Interview reply` |
| `events.type` | `Deadline`, `Interview`, `Follow-up`, `Meeting`, `Exam`, `Other` |
| `tasks.priority` | `Low`, `Medium`, `High` |
| `correspondence.direction` | `Outgoing`, `Incoming` |
| `correspondence.outcome` | `Sent`, `Replied`, `Interested`, `Declined`, `Follow-up required`, `Other` |
| `documents.category` | `CV`, `SOP`, `Transcript`, `Recommendation`, `Language test`, `Portfolio`, `Other` |
| `documents.status` | `Draft`, `Ready`, `Submitted`, `Needs revision` |

ApplyPilot may add `createdAt` (an ISO timestamp) when it saves an edited record, `preview` when it saves a letter, and `fileName` and `filePath` when you attach a local document. Leave those fields out of new research records. Preserve them when editing a supplied export. Settings can include `yourName` (string), `comparisonIds` (university ID array), and `checklistPosition` (position ID string). Keep the settings from the existing file if I ask for a full updated replacement export.

Before returning the file, validate its structure against the schema if available. Separately check that all nine collections are arrays, dates exist on the calendar, all record IDs are unique across collections, all nonempty linked IDs resolve, and dropdown values match the spellings above. For a merge into an existing database, check links against the supplied export and the generated file together. Confirm that every opportunity has a source in `notes`.
