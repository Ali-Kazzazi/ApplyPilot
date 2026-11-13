# ApplyPilot v2 Demo Data

This demo JSON uses the **exact data collections and field names** used by the v2 application's renderer/main process.

Contents: **20 named Canadian universities**, **60 entirely fictional demo professors**, **35 fictional positions**, **93 letters**, **129 correspondence logs**, **16 calendar events**, **24 tasks**, **12 document metadata records**, and **45 checklist entries**.

**Important:** The university names are real, but the professor names/associations, positions, rankings, research assignments, correspondence, and deadlines are **synthetic**, not verified. Do not email, apply, or rely on this as actual academic information. Emails and university websites are deliberately left blank.

## Import
1. Run ApplyPilot v2.
2. Click Settings & backup (gear button in sidebar).
3. Click **Export JSON backup** first if you have existing records.
4. Click **Import JSON backup**, select `ApplyPilot_Demo_Database.json`, and confirm replacing the existing database.
5. Open **Activity history** in the sidebar, or click **History** beside a professor. Browse the other pages to explore the linked records.

Import **replaces** all current records. Demo document records contain no real file attachments.

## Activity history examples

The timeline contains **282 entries**, including **231 dated entries** from **July 28 to October 16, 2026**, and **51 undated profiles or unsent letters**. It shows current records using their last-contact, sent or email dates; it is not an audit log.

There are **35 linked conversation threads** covering first contact, unanswered follow-ups, research interviews, funding discussions, offers awaiting clarification, declined inquiries, submitted applications, unavailable supervisors and preparation of unsent drafts. Each thread links its professor, position, letters and incoming/outgoing email logs. Professor contact status and last-contact dates reflect the latest message in that thread; actionable follow-ups are dated October 20–23, 2026.

Try these filters:

- Select **Maya Bennett** to see an initial inquiry, an unanswered follow-up and an undated second follow-up draft.
- Choose **Email** as the record type and search for **funding** or **interview** to find conversations across professors.
- Set **From** to `2026-10-01` and **To** to `2026-10-16` to see recent dated activity. Clear the dates to include unsent drafts and uncontacted profiles again.
- Use **Reset filters** to return to the complete timeline.
