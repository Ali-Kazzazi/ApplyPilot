# ApplyPilot 2.0.0 — University application workspace

An offline-first Electron/JavaScript desktop application for managing Master's and PhD admissions.

## Getting started

Requires Node.js 22.12.0 or later and npm. To run the current source, open a terminal in the project folder and run these commands.

```sh
npm install
npm start
```

In the app, open **Settings & backup → Privacy & storage**. The footer displays **ApplyPilot 2.0.0** using the version reported by Electron.

If a previously built Windows installer or portable executable still shows **ApplyPilot 1.0** in that footer, use `npm start` to see the updated label. Windows builds need to be rebuilt from the current source to pick up the fix.

## Included features

- Dashboard, university profiles, professor profiles with publications/research fit, positions and admissions pipeline
- Rich-text letters with first-contact/follow-up/thank-you/interview templates, placeholders and merged preview
- Open a populated `mailto:` draft in your default email app (does not send or confirm delivery)
- Email correspondence log with follow-up dates
- Activity history timeline for professors, letters and emails, with professor, record type, date range and text filters. Open it from the sidebar or a professor's History button. Dates come from existing records; undated records appear last and are excluded by date filters. This is a view of current records, not a log of edits.
- Monthly calendar, task list and in-app desktop notifications for items **due today while the app is running**
- Position-specific application document checklists and completion tracking
- Local file attachments copied to the Electron user-data directory; open files from the Documents page
- Side-by-side university comparison and basic application analytics
- Search, JSON data import/export, atomic writes and `.bak` database backup

## Storage and backups

Structured records are in Electron's userData directory (`applypilot.json`). Attachments are in its `attachments/` folder. **JSON export includes only records and attachment metadata, not the attachment files.** Back up the attachments folder separately. Import replaces the JSON records, not attachments.

## Limitations

- No direct Gmail or Google Calendar sync, background scheduler, automatic email sending, or web scraping.
- Notifications are due-today checks while the app is open; they are not scheduled at exact times and do not run when closed.
- Application costs have no currency conversion; keep values in one currency if comparing totals.
- HTML editing uses Electron Chromium's legacy `execCommand` for formatting.
- This is source code, not a signed installer. Electron installation and interactive runtime have not been tested in this environment.


## Letter preview (v2)

The **Preview merged letter** button now opens a dedicated Electron BrowserWindow.
Its native menu is removed and the preview HTML contains no editor toolbar or application navigation.
The editing toolbar remains available in the letter editor. Close the preview using the window's native close button.

## Merge JSON databases

To prepare a research file with a web-enabled AI, use the [research prompt](database-research-prompt.md), [blank template](database-template.json), and [JSON Schema](database.schema.json).

Go to **Settings & backup → Merge JSON files**, choose another ApplyPilot JSON backup, review the category-by-category preview and confirm. The merge adds new records, skips existing records with the same IDs, matches universities by name and country and professors by name and university, and remaps IDs on conflicts. It does **not** overwrite existing records or merge settings. A `.bak` copy of the pre-merge database is created alongside your local `applypilot.json` when that file exists.

Note: Attached documents are not included in JSON backups; merge operates on JSON metadata only. Links to local attachments from another computer may not work. Keep a backup and verify linked records after merging. The operation is intended for trusted ApplyPilot JSON files.
