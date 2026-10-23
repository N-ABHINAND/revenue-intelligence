# Five Presentation Slides — Revenue Intelligence Inbox

This document provides the full text, wireframe layouts, visual hierarchy, and strategic narrative of the **five presentation slides** for the **Revenue Intelligence Inbox** (also provided as the native PowerPoint file [`presentation.pptx`](file:///c:/Users/HP/Downloads/candidate-v1.0%20%283%29_layout_fixed%20%281%29%282%29%20%283%29/candidate/presentation.pptx)).

---

## Slide 1: Strategic Architecture & Evidence-First Principle

### Visual Layout:
- **Header:** SpendNest Revenue Intelligence (Teal `#0D9488` badge)
- **Title (34pt, White on Dark Navy `#0F172A`):** Revenue Intelligence Inbox
- **Subtitle:** Evidence-First Sales Analytics, Multi-Route Classification & Audit-Grade Data Operations
- **Three Core Pillars (Side-by-side slate containers):**
  1. **Evidence-First Intelligence:** Every route and next action links to verbatim conversation passages. Missing transcripts are clearly distinguished from non-occurrence. Stale analysis is visibly flagged when underlying text changes.
  2. **Human-Controlled Routing:** Multi-destination routing (`sales-coaching`, `deal-next-steps`, `customer-follow-up`, `partnership-follow-up`, `internal-vendor`, `human-review`, `insufficient-evidence`). Machine suggestions are kept strictly separate from manager overrides. Manual corrections deterministically survive source updates.
  3. **Audit-Grade Ingestion:** Stable identity pair `(source_type, source_id)`. 44 logical records (30 calls, 14 meetings). Idempotent deduplication prevents duplicate rows on repeat deliveries. Revision precedence prevents downgrade regressions.

---

## Slide 2: Manager Dashboard & Source Constraints

### Visual Layout:
- **Title:** Operational Dashboard & Metrics: 21 August 2026 (Asia/Kolkata)
- **Four Top Metric Cards:**
  - **Unique Logical Records:** 44 (30 Calls | 14 Meetings)
  - **Usable Transcript Coverage:** 17 / 44 (39%) initially &rarr; 18 / 44 after M07 update
  - **Source Connection Rate:** 75% (strictly from non-null dials; 14 nulls excluded)
  - **Governance Review Queue:** 10 records flagged for manager review
- **Methodological Guardrails (Full-width callout container):**
  - **Transcript Coverage Denominator:** Strictly 44 logical records. Numerator is non-empty transcript strings (calls) or turns &gt; 0 (meetings). Zero-turn meetings (M05, M08, M11) are recorded but empty.
  - **Connection Rate Exclusions:** Only non-null `is_connected` boolean values are used in calculation. Unknown/null records are segregated and labeled as source-reported.
  - **Person Classification:** Call representatives (outbound dialers) are strictly separated from meeting organisers (calendar owners). Meeting organisers are never assumed to have attended, spoken, or sold the product.
  - **No Inferred Outcomes:** Without explicit conversation confirmation, deal size, purchase outcomes, and pipeline values are marked as unknown.

---

## Slide 3: Three Most Important Conversation Findings

### Visual Layout:
- **Title:** Three Most Important Conversation Findings (with Passages & Product Influence)
- **Three Equal Cards (Side-by-side with quote blocks and teal highlights):**

### Finding 1 (Record C01): Cold Call Resistance with Latent Curiosity
- **Verbatim Evidence Passage:**  
  > *"I didn't ask for this call, and I'm not interested... just briefly, what does your company actually do?"*
- **Analysis:** Prospect led with an initial cold-call brush-off, but immediately followed with an unprompted question about company capabilities and agreed to receive an introductory overview.
- **Product Influence:** Influenced the *Sales Coaching* multi-route classification and prompted creation of the objection-handling coaching review card on both the Dashboard and Routing Review screen.

### Finding 2 (Record C03): High-Intent Technical API Qualification with Concrete Next Step
- **Verbatim Evidence Passage:**  
  > *"Could we do this by email? Or call on Monday... Something like 'Developer access and event notifications — follow-up'"*
- **Analysis:** Technical lead explicitly requested webhook and developer API access for ERP synchronization and volunteered a concrete Monday calendar appointment.
- **Product Influence:** Influenced deterministic routing to *Deal Follow-up* and elevated the record to the top of the High-Priority Follow-up Recommendations widget on the Overview dashboard.

### Finding 3 (Record C07): Reseller / Consultancy Channel Intent vs Direct Deal
- **Verbatim Evidence Passage:**  
  > *"I wanted to ask about a possible partnership... Send whatever proposal you have... could I call on Monday to see whether you'd like to discuss it further?"*
- **Analysis:** The contact is an IT consultancy seeking reseller distribution to their client base, not an end-user corporate card buyer.
- **Product Influence:** Mandated creation of the dedicated *Partnership / Channel* route category, preventing channel partnership inquiries from distorting direct sales quotas.

---

## Slide 4: Deliberately Rejected Design Decision

### Visual Layout:
- **Title:** Design Principles & Governance: Deliberately Rejected Decision
- **Comparison Split Screen (Rose Alert Left vs Emerald Solution Right):**

### Left Column (Red/Rose): What was Rejected & Why
- **Rejected Feature:** *"Sales Representative Performance Leaderboard & Conversion Ranking"*
- **Why Considered:** Standard sales CRMs frequently rank reps by connected call rates, conversation outcomes, and deal close probabilities.
- **Why Deliberately Rejected:**
  1. **Selected Dataset Bias:** The supplied 44 records represent a deliberate operational extract, not a complete measure of team performance. Ranking reps on partial data containing 20 unrecorded background calls would produce unfair and misleading evaluations.
  2. **Role Conflation:** Meeting organisers cannot be conflated with meeting attendees or closing representatives.
  3. **Punitive Inaccuracies:** Evaluative rankings derived from small samples incentivize gaming and harm team trust.

### Right Column (Green/Emerald): Chosen Alternative & Trade-Off
- **Chosen Alternative:** Neutral **Activity Breakdown Cards** that strictly separate telephonic Call Reps from meeting Calendar Organisers.
- **Descriptive Metrics Only:** Reports raw conversation counts and usable transcript counts per person without computing comparative conversion scores or ranking badges.
- **Transparent Disclaimer:** A permanent visual footnote informs managers that the data is an operational sample, ensuring coaching remains focused on conversation evidence rather than synthetic leaderboard standings.

---

## Slide 5: Reliable Data Operations & Replay Contract

### Visual Layout:
- **Title:** Import Engine Deduplication & Replay Verification
- **Four Replay Steps (Process flow diagram with step badges):**
  - **Step 1: Initial Ingestion (`01_initial.json`):** Ingests 44 logical records (30 calls, 14 mtgs). 17 have usable text. M07 text is withheld (`applied_revision: 1`).
  - **Step 2: Repeat Ingestion (Idempotency):** Re-importing `01_initial.json` yields 0 new records, 44 unchanged. Absolute zero duplicate rows created.
  - **Step 3: Manual Route Correction:** Manager overrides record M07 to *Partnership / Channel* and *Human Review Needed*. Manual override flag set to `true` in IndexedDB.
  - **Step 4: Revision Precedence & Preservation:** `02_update.json` arrives (revision 2). Total remains 44, usable texts increase to 18. Manual route override is strictly preserved across the source update!
- **Complete Verification Suite (Dark Navy Footer Box):**
  - Automated Vitest suite (`src/__tests__/importEngine.test.ts`) confirms all 6 core data contract assertions in 358ms.
  - Downgrade Rejection: Importing revision 1 after revision 2 ignores stale records, preventing regressions.
  - Machine-Readable Export: `manifest.json` + `manager-brief.md` + categorized folders packaged via JSZip and pre-packaged at [`exports.zip`](file:///c:/Users/HP/Downloads/candidate-v1.0%20%283%29_layout_fixed%20%281%29%282%29%20%283%29/candidate/exports.zip).
