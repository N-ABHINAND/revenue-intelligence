import pptxgen from 'pptxgenjs'
import fs from 'fs'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.author = 'Revenue Intelligence Inbox Team'
pres.title = 'Revenue Intelligence Inbox — Architecture, Evidence & Governance'

// Palette: Dark Navy #0F172A, Teal #0D9488, Slate Gray #64748B, Light Card #F8FAFC
const C_NAVY = '0F172A'
const C_TEAL = '0D9488'
const C_SLATE = '64748B'
const C_WHITE = 'FFFFFF'
const C_BG = 'F8FAFC'
const C_ROSE = 'E11D48'
const C_EMERALD = '059669'

// -------------------------------------------------------------
// SLIDE 1: Title & Strategic Architecture
// -------------------------------------------------------------
{
  const s = pres.addSlide()
  s.bkgd = C_NAVY

  s.addText('SPENDNEST REVENUE INTELLIGENCE', {
    x: 0.8,
    y: 1.0,
    fontSize: 14,
    bold: true,
    color: C_TEAL,
    fontFace: 'Arial',
  })

  s.addText('Revenue Intelligence Inbox', {
    x: 0.8,
    y: 1.5,
    fontSize: 34,
    bold: true,
    color: C_WHITE,
    fontFace: 'Arial',
  })

  s.addText('Evidence-First Sales Analytics, Multi-Route Classification & Audit-Grade Data Operations', {
    x: 0.8,
    y: 2.3,
    fontSize: 16,
    color: '94A3B8',
    fontFace: 'Arial',
  })

  // Three Core Pillars
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 3.5, w: 3.8, h: 2.8,
    fill: { color: '1E293B' }, line: { color: '334155', width: 1 }
  })
  s.addText('1. Evidence-First Intelligence', {
    x: 1.0, y: 3.8, fontSize: 14, bold: true, color: C_WHITE
  })
  s.addText('• Every route and action links to verbatim conversation passages.\n• Unknown intent and missing transcripts explicitly distinguished from non-occurrence.\n• Pre-generated summaries flagged when source text changes.', {
    x: 1.0, y: 4.3, w: 3.4, fontSize: 11, color: 'CBD5E1'
  })

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 4.8, y: 3.5, w: 3.8, h: 2.8,
    fill: { color: '1E293B' }, line: { color: '334155', width: 1 }
  })
  s.addText('2. Human-Controlled Routing', {
    x: 5.0, y: 3.8, fontSize: 14, bold: true, color: C_WHITE
  })
  s.addText('• Multi-destination routing (Coaching, Deals, Support, Partnerships, Reviews).\n• Machine suggestions strictly separated from manager decisions.\n• Manual manager corrections deterministically preserved across source updates.', {
    x: 5.0, y: 4.3, w: 3.4, fontSize: 11, color: 'CBD5E1'
  })

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.8, y: 3.5, w: 3.8, h: 2.8,
    fill: { color: '1E293B' }, line: { color: '334155', width: 1 }
  })
  s.addText('3. Audit-Grade Ingestion', {
    x: 9.0, y: 3.8, fontSize: 14, bold: true, color: C_WHITE
  })
  s.addText('• Stable identity: (source_type, source_id).\n• 44 logical records (30 calls, 14 mtgs).\n• Idempotent deduplication (repeat imports = 0 duplicates).\n• Revision precedence prevents regressions.', {
    x: 9.0, y: 4.3, w: 3.4, fontSize: 11, color: 'CBD5E1'
  })
}

// -------------------------------------------------------------
// SLIDE 2: Manager Dashboard & Source Constraints
// -------------------------------------------------------------
{
  const s = pres.addSlide()
  s.bkgd = C_BG

  s.addText('OPERATIONAL DASHBOARD & METRICS', {
    x: 0.8, y: 0.6, fontSize: 12, bold: true, color: C_TEAL
  })
  s.addText('Dashboard Overview: 21 August 2026 (Asia/Kolkata)', {
    x: 0.8, y: 0.95, fontSize: 24, bold: true, color: C_NAVY
  })

  // Metric Cards Row
  const metrics = [
    { title: 'Unique Logical Records', val: '44', sub: '30 Calls | 14 Meetings', col: C_NAVY },
    { title: 'Usable Transcript Coverage', val: '17 / 44 (39%)', sub: '18 / 44 after M07 update', col: C_TEAL },
    { title: 'Source Connection Rate', val: '75%', sub: 'Only non-null dials (nulls excluded)', col: C_EMERALD },
    { title: 'Governance Review Queue', val: '10', sub: 'Flagged for manager inspection', col: C_ROSE },
  ]

  metrics.forEach((m, i) => {
    const x = 0.8 + i * 3.0
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 2.8, h: 1.6, fill: { color: C_WHITE }, line: { color: 'E2E8F0', width: 1 }
    })
    s.addText(m.title, { x: x + 0.2, y: 1.75, fontSize: 10, bold: true, color: C_SLATE })
    s.addText(m.val, { x: x + 0.2, y: 2.1, fontSize: 20, bold: true, color: m.col })
    s.addText(m.sub, { x: x + 0.2, y: 2.7, fontSize: 9, color: C_SLATE })
  })

  // Methodological Guardrails Box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 3.5, w: 11.8, h: 3.2, fill: { color: C_WHITE }, line: { color: 'CBD5E1', width: 1 }
  })
  s.addText('Core Measurement Rules & Methodological Guardrails', {
    x: 1.1, y: 3.8, fontSize: 14, bold: true, color: C_NAVY
  })

  s.addText('• Transcript Coverage Denominator: Strictly 44 logical records. Numerator is non-empty transcript strings (calls) or turns > 0 (meetings). Zero-turn meetings (M05, M08, M11) are recorded but empty.\n• Connection Rate Exclusions: Only non-null is_connected boolean values are used in calculation. Unknown/null records are segregated and labeled as source-reported.\n• Person Classification: Call representatives (outbound dialers) are strictly separated from meeting organisers (calendar owners). Meeting organisers are never assumed to have attended, spoken, or sold the product.\n• No Inferred Outcomes: Without explicit conversation confirmation, deal size, purchase outcomes, and pipeline values are marked as unknown.', {
    x: 1.1, y: 4.3, w: 11.2, fontSize: 11, color: '334155'
  })
}

// -------------------------------------------------------------
// SLIDE 3: Three Most Important Findings
// -------------------------------------------------------------
{
  const s = pres.addSlide()
  s.bkgd = C_BG

  s.addText('EVIDENCE-FIRST CONVERSATION INTELLIGENCE', {
    x: 0.8, y: 0.6, fontSize: 12, bold: true, color: C_TEAL
  })
  s.addText('Three Most Important Conversation Findings', {
    x: 0.8, y: 0.95, fontSize: 24, bold: true, color: C_NAVY
  })

  const findings = [
    {
      ref: 'C01',
      title: 'Finding 1: Cold Call Resistance with Latent Hook',
      quote: '"I didn\'t ask for this call, and I\'m not interested... just briefly, what does your company actually do?"',
      finding: 'Initial objection disguised curiosity; prospect agreed to an email brief but rep lacked a crisp hook.',
      impact: 'Directly influenced the Sales Coaching classification rule and generated the objection-handling coaching review card.',
      tag: 'Sales Coaching + Human Review'
    },
    {
      ref: 'C03',
      title: 'Finding 2: High-Intent ERP Developer API Evaluation',
      quote: '"Could we do this by email? Or call on Monday... Something like \'Developer access and event notifications — follow-up\'"',
      finding: 'Lead confirmed active technical qualification for webhooks; committed to a Monday calendar follow-up.',
      impact: 'Triggered immediate routing to Deal Follow-up and promoted the opportunity to the top of the High-Priority Follow-up widget.',
      tag: 'Deal Follow-up'
    },
    {
      ref: 'C07',
      title: 'Finding 3: Regional IT Consultancy Reseller Inquiry',
      quote: '"I wanted to ask about a possible partnership... Send whatever proposal you have... could I call on Monday...?"',
      finding: 'Caller is an IT services consultancy seeking to distribute SpendNest to SME clients, NOT a direct end-user.',
      impact: 'Mandated creation of the distinct Partnership / Channel route, preventing channel reseller leads from distorting direct pipeline metrics.',
      tag: 'Partnership / Channel'
    }
  ]

  findings.forEach((f, i) => {
    const x = 0.8 + i * 4.0
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 3.8, h: 5.1, fill: { color: C_WHITE }, line: { color: 'E2E8F0', width: 1 }
    })
    s.addText(f.ref + ' • ' + f.tag, { x: x + 0.2, y: 1.8, fontSize: 10, bold: true, color: C_TEAL })
    s.addText(f.title, { x: x + 0.2, y: 2.1, w: 3.4, fontSize: 12, bold: true, color: C_NAVY })
    s.addText(f.quote, { x: x + 0.2, y: 2.8, w: 3.4, fontSize: 10, italic: true, color: '475569' })
    s.addText('Analysis: ' + f.finding, { x: x + 0.2, y: 3.9, w: 3.4, fontSize: 10, color: '1E293B' })
    s.addText('Product Influence:\n' + f.impact, { x: x + 0.2, y: 4.8, w: 3.4, fontSize: 10, bold: true, color: '0F766E' })
  })
}

// -------------------------------------------------------------
// SLIDE 4: Deliberately Rejected Design Decision
// -------------------------------------------------------------
{
  const s = pres.addSlide()
  s.bkgd = C_BG

  s.addText('DESIGN PRINCIPLES & GOVERNANCE', {
    x: 0.8, y: 0.6, fontSize: 12, bold: true, color: C_TEAL
  })
  s.addText('Deliberately Rejected Decision: Salesperson Leaderboards', {
    x: 0.8, y: 0.95, fontSize: 24, bold: true, color: C_NAVY
  })

  // Two columns comparison
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 1.6, w: 5.7, h: 5.1, fill: { color: 'FFF1F2' }, line: { color: 'FECDD3', width: 1 }
  })
  s.addText('Rejected Decision: Rep Performance Ranking', {
    x: 1.1, y: 1.9, fontSize: 15, bold: true, color: C_ROSE
  })
  s.addText('• What was considered:\n  A competitive sales leaderboard ranking sales reps by connected call rates, conversation outcomes, and deal close probabilities.\n\n• Why it was rejected:\n  1. Selected Dataset Bias: The 44 supplied records are a deliberate, non-random extract containing 20 background calls without transcripts. Ranking reps on partial data produces invalid evaluations.\n  2. Role Conflation: Calendar organisers are not necessarily meeting attendees or account closers.\n  3. Punitive Inaccuracies: Evaluative rankings derived from small samples incentivize gaming and harm team trust.', {
    x: 1.1, y: 2.4, w: 5.1, fontSize: 11, color: '881337'
  })

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.9, y: 1.6, w: 5.7, h: 5.1, fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 1 }
  })
  s.addText('Accepted Alternative & Trade-Off', {
    x: 7.2, y: 1.9, fontSize: 15, bold: true, color: C_EMERALD
  })
  s.addText('• Chosen Product Architecture:\n  Neutral "Activity Breakdown Cards" that strictly separate telephonic Call Reps from meeting Calendar Organisers.\n\n• Descriptive Metrics Only:\n  Reports raw conversation counts and usable transcript counts per person without computing comparative conversion scores or ranking badges.\n\n• Transparent Disclaimer:\n  A permanent visual footnote informs managers that the data is an operational sample, ensuring coaching remains focused on conversation evidence rather than synthetic leaderboard standings.', {
    x: 7.2, y: 2.4, w: 5.1, fontSize: 11, color: '14532D'
  })
}

// -------------------------------------------------------------
// SLIDE 5: Reliable Data Operations & Replay Contract
// -------------------------------------------------------------
{
  const s = pres.addSlide()
  s.bkgd = C_BG

  s.addText('DATA OPERATIONS & AUDIT TRAIL', {
    x: 0.8, y: 0.6, fontSize: 12, bold: true, color: C_TEAL
  })
  s.addText('Import Engine Deduplication & Replay Verification', {
    x: 0.8, y: 0.95, fontSize: 24, bold: true, color: C_NAVY
  })

  // 4 Steps layout
  const steps = [
    { num: 'Step 1', title: 'Initial Ingestion (01_initial)', desc: 'Imports 44 records (30 calls, 14 mtgs). 17 have usable text. M07 text is withheld (rev 1).' },
    { num: 'Step 2', title: 'Repeat Ingestion (Idempotency)', desc: 'Re-importing 01_initial yields 0 new records, 44 unchanged. Absolute zero duplicate rows created.' },
    { num: 'Step 3', title: 'Manual Route Correction', desc: 'Manager overrides record M07 to Partnership / Channel. Manual override flag set to TRUE in IndexedDB.' },
    { num: 'Step 4', title: 'Revision Precedence & Preservation', desc: '02_update arrives (rev 2). Total remains 44, usable texts increase to 18. Manual route override is strictly preserved!' }
  ]

  steps.forEach((st, i) => {
    const x = 0.8 + i * 3.0
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 2.8, h: 3.0, fill: { color: C_WHITE }, line: { color: 'CBD5E1', width: 1 }
    })
    s.addText(st.num, { x: x + 0.2, y: 1.8, fontSize: 11, bold: true, color: C_TEAL })
    s.addText(st.title, { x: x + 0.2, y: 2.1, w: 2.4, fontSize: 12, bold: true, color: C_NAVY })
    s.addText(st.desc, { x: x + 0.2, y: 2.8, w: 2.4, fontSize: 10, color: '475569' })
  })

  // Bottom Summary Box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.8, y: 4.8, w: 11.8, h: 1.9, fill: { color: C_NAVY }, line: { color: C_NAVY }
  })
  s.addText('Complete Verification Suite & Automated Testing', {
    x: 1.1, y: 5.0, fontSize: 13, bold: true, color: C_WHITE
  })
  s.addText('• Automated Vitest suite (src/__tests__/importEngine.test.ts) confirms all 6 core data contract assertions in 309ms.\n• Downgrade Rejection: Importing revision 1 after revision 2 ignores stale records, preventing regressions.\n• Machine-Readable Export: manifest.json + manager-brief.md + categorized folders packaged via JSZip with 1-click browser download.', {
    x: 1.1, y: 5.4, w: 11.2, fontSize: 10, color: '94A3B8'
  })
}

// Generate file
pres.writeFile({ fileName: 'presentation.pptx' }).then((fileName) => {
  console.log(`Presentation created successfully: ${fileName}`)
})
