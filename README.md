# ApplyPilot v1.0.0 — University application workspace

An offline-first Electron/JavaScript desktop application for managing Master's and PhD admissions.

## Getting started

Requires Node.js 20+ and npm. From the project folder:

```sh
npm install
npm start
```

## Included features

- Dashboard, university profiles, professor profiles with publications/research fit, positions and admissions pipeline
- Rich-text letters with first-contact/follow-up/thank-you/interview templates, placeholders and merged preview
- Open a populated `mailto:` draft in your default email app (does not send or confirm delivery)
- Email correspondence log with follow-up dates
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


