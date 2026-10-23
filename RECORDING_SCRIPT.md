# 3-Minute Video Recording Narration Script
**Project:** Revenue Intelligence Inbox (SpendNest)  
**Target Duration:** Exactly 3 minutes (180 seconds)  
**Format:** Continuous single-take screen capture with spoken voiceover narration

---

### [0:00 – 0:35] Scene 1: Introduction & Useful Manager Workflow
**Visual Cue:**
- Browser is open to `http://localhost:5173/` showing the **Revenue Intelligence Overview** dashboard.
- Mouse hovers over the **Usable Transcript Coverage** metric card tooltip, then the **Connection Rate** tooltip.
- Scroll down to show the **Interactive Filters Bar** and click **Calls Only** to demonstrate live metric recalculation.

**Spoken Narration (Voiceover):**
> "Welcome to the Revenue Intelligence Inbox, an evidence-first workspace built for sales managers evaluating call records and meeting notes from August 21st, 2026.
>
> Right on our Manager Dashboard, the metrics adhere strictly to data integrity guardrails: out of 44 unique logical records across 30 calls and 14 meetings, exactly 17 records initially supply usable conversation transcripts.
>
> When measuring our 75% connection rate, notice our tooltip: it calculates strictly from calls with a verified boolean status, cleanly separating null records rather than assuming outcomes.
>
> Notice that when I filter by source type or team member, every metric and routing distribution chart updates dynamically based on the applied dataset."

---

### [0:35 – 1:20] Scene 2: Evidence-Backed Intelligence & Difficult Routing Decision
**Visual Cue:**
- In the **High-Priority Follow-Up Recommendations** widget, click on card **C07**.
- The **Record Detail Drawer** slides in from the right.
- Point to the verbatim quote in the evidence box: *"I wanted to ask about a possible partnership... Send whatever proposal you have..."*
- Show the multi-route governance section: compare **Automated Route** vs **Effective Destination Categories**.
- Toggle route from standard deal follow-up to **Partnership / Channel Follow-up**. Add a manager note: *"Inquiry from regional IT consultancy for client distribution; route to Head of Partnerships."*
- Click **Save Routing Changes**. Show the green confirmation badge.

**Spoken Narration (Voiceover):**
> "Let’s look at a difficult routing decision: record C07.
>
> On the surface, a naive keyword classifier might see words like 'proposal' and route this directly to sales deal follow-up. But inspecting the exact transcript passage reveals a crucial distinction:
>
> The caller says: *'I wanted to ask about a possible partnership... could I call on Monday to see whether you'd like to discuss it further?'*
>
> This is a regional IT consultancy seeking a reseller distribution agreement to sell SpendNest to their SME clients, not an end-user purchase.
>
> If this went to direct sales, it would distort rep quota attainment. Using our multi-route governance controls, I explicitly designate this as 'Partnership / Channel Follow-up' with a manager note. The system preserves the machine suggestion separately while enforcing the human decision."

---

### [1:20 – 2:20] Scene 3: Duplicate Suppression & Update Test with Preserved Manual Correction
**Visual Cue:**
- Click **Import Center** in the sidebar.
- Show the **Replay Contract Verification** checklist and the current storage state (44 records, 17 usable).
- Open record **M07** in Conversation Inbox or drawer. Show that M07 has no transcript in revision 1. Manually assign M07 to **Human Review Needed** and **Partnership / Channel**.
- Return to **Import Center**. Click **Load 01_initial.json** again.
- Show the import result: **0 new, 44 unchanged (deduplicated)**.
- Now click **Apply 02_update.json (Rev 2)**.
- Show the import result: **1 updated (M07)**.
- Re-open record **M07** in the drawer:
  - Demonstrate that M07 now has its full conversation turns.
  - Show that its manual route override to **Human Review Needed** was **strictly preserved** through the revision update!
  - Point to the **Stale Analysis** warning badge noting the transcript was updated from revision 1 to revision 2.

**Spoken Narration (Voiceover):**
> "Now let's demonstrate our reliable data engine and replay contract.
>
> First, deduplication: when I re-import the initial batch envelope, the system uses our stable composite key `(source_type, source_id)`. The result shows exactly zero new records and 44 unchanged rows—preventing duplicate counting.
>
> Next, watch record M07—the Willowfield Trust meeting. In the initial delivery, M07 arrived with a withheld transcript. I will manually override M07's route to 'Human Review' and save it.
>
> Now, we simulate late-arriving data by applying `02_update.json`, which supplies revision 2 of M07.
>
> Upon ingestion, the total logical count remains strictly 44, while usable transcript coverage increases to 18.
>
> When we inspect M07, two vital things have happened: first, its full transcript turns are now available. Second, my manual routing override was completely preserved across the source update. Furthermore, the analysis is transparently flagged as stale until verified."

---

### [2:20 – 3:00] Scene 4: Export Archive, Audit Log & Wrap-Up
**Visual Cue:**
- Click **Exports & Manifest** in the sidebar.
- Show the live **Manifest Inspector** mapping `record_ref`, `applied_revision`, `effective_routes`, and `output_paths`.
- Click **Download Export Archive (.zip)**. Show the generated zip download.
- Briefly click **Audit Log** to show the immutable chronological log of the imports and manual overrides.
- Return to Overview dashboard.

**Spoken Narration (Voiceover):**
> "Finally, let's inspect the export system.
>
> In the Export Center, the live manifest maps every single record to its applied revision, human decisions, and folder destinations.
>
> Clicking 'Download Export Archive' generates a complete ZIP containing `manifest.json`, the daily `manager-brief.md`, dashboard metrics, and organized folders for each intelligence category.
>
> Backed by an immutable audit log, automated Vitest verification, and zero paid API dependencies, the Revenue Intelligence Inbox provides sales leadership with trustworthy, auditable intelligence. Thank you."

---
*End of 3-minute recording.*
