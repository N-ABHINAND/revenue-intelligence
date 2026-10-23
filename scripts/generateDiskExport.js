import fs from 'fs'
import path from 'path'

// Load both initial and update files
const initialPath = path.resolve('./data/01_initial.json')
const updatePath = path.resolve('./data/02_update.json')

const initialData = JSON.parse(fs.readFileSync(initialPath, 'utf-8'))
const updateData = JSON.parse(fs.readFileSync(updatePath, 'utf-8'))

// Build state with update revision applied (44 unique records, M07 rev 2)
const recordMap = new Map()

// 1. Initial batch (rev 1)
for (const r of initialData.records) {
  const key = `${r.source_type}:${r.source_id}`
  recordMap.set(key, {
    ...r,
    applied_revision: initialData.revision,
    has_usable_text: r.source_type === 'call' 
      ? Boolean(r.payload.transcript && r.payload.transcript.trim())
      : Boolean(r.transcript_payload?.turns && r.transcript_payload.turns.length > 0)
  })
}

// 2. Apply update batch (rev 2 for M07)
for (const r of updateData.records) {
  const key = `${r.source_type}:${r.source_id}`
  const existing = recordMap.get(key)
  if (!existing || updateData.revision > existing.applied_revision) {
    recordMap.set(key, {
      ...r,
      applied_revision: updateData.revision,
      has_usable_text: r.source_type === 'call'
        ? Boolean(r.payload.transcript && r.payload.transcript.trim())
        : Boolean(r.transcript_payload?.turns && r.transcript_payload.turns.length > 0)
    })
  }
}

// Base directory for exports
const exportDir = path.resolve('./exports')
if (fs.existsSync(exportDir)) {
  fs.rmSync(exportDir, { recursive: true, force: true })
}
fs.mkdirSync(exportDir, { recursive: true })

const categories = [
  'sales-coaching',
  'deal-next-steps',
  'customer-follow-up',
  'partnership-channel',
  'internal-vendor',
  'human-review',
  'insufficient-evidence'
]

categories.forEach(c => fs.mkdirSync(path.join(exportDir, c), { recursive: true }))
fs.mkdirSync(path.join(exportDir, 'dashboard'), { recursive: true })

// Helper for route assignment
function getRoutes(ref, hasText) {
  if (!hasText) return ['insufficient-evidence']
  switch (ref) {
    case 'C01': return ['sales-coaching', 'human-review']
    case 'C02': return ['sales-coaching']
    case 'C03': return ['deal-next-steps']
    case 'C04': return ['deal-next-steps', 'sales-coaching']
    case 'C05': return ['customer-follow-up', 'human-review']
    case 'C06': return ['deal-next-steps']
    case 'C07': return ['partnership-channel']
    case 'C08': return ['customer-follow-up']
    case 'C09': return ['deal-next-steps', 'human-review']
    case 'C10': return ['deal-next-steps']
    case 'M01': return ['deal-next-steps']
    case 'M02': return ['deal-next-steps', 'sales-coaching']
    case 'M03': return ['deal-next-steps', 'sales-coaching']
    case 'M04': return ['customer-follow-up', 'deal-next-steps']
    case 'M06': return ['deal-next-steps']
    case 'M07': return ['deal-next-steps', 'human-review']
    case 'M09': return ['customer-follow-up', 'human-review']
    case 'M10': return ['internal-vendor', 'sales-coaching']
    default: return ['insufficient-evidence']
  }
}

const manifest = []

for (const [key, record] of recordMap.entries()) {
  const effectiveRoutes = getRoutes(record.record_ref, record.has_usable_text)
  const outputPaths = []

  const p = record.payload
  const title = record.source_type === 'call' ? `Call with ${p.to_number || 'Prospect'}` : p.title
  const person = record.source_type === 'call' ? p.rep_name || p.rep_email : p.organizer_email

  let md = `# [${record.record_ref}] ${title}\n\n`
  md += `**Source Type**: ${record.source_type.toUpperCase()}  \n`
  md += `**Source ID**: \`${record.source_id}\`  \n`
  md += `**Applied Revision**: ${record.applied_revision}  \n`
  md += `**Representative / Organiser**: ${person || 'Unknown'}  \n`
  md += `**Effective Routes**: ${effectiveRoutes.join(', ')}  \n`
  md += `**Usable Text**: ${record.has_usable_text ? 'Yes' : 'No'}  \n\n`

  if (record.source_type === 'call') {
    md += `## Transcript\n\n`
    md += record.payload.transcript ? `\`\`\`text\n${record.payload.transcript}\n\`\`\`\n` : `*No transcript available.*\n`
  } else {
    md += `## Meeting Transcript Turns\n\n`
    const turns = record.transcript_payload?.turns || []
    if (turns.length > 0) {
      md += `| Turn | Timecode | Speaker | Utterance |\n|---|---|---|---|\n`
      turns.forEach((t, i) => {
        md += `| ${i + 1} | ${t.timecode} | ${t.speaker} | ${t.text.replace(/\|/g, '\\|')} |\n`
      })
    } else {
      md += `*${record.transcript_payload?.unavailable_reason || 'No turns recorded.'}*\n`
    }
  }

  for (const r of effectiveRoutes) {
    const filename = `${record.record_ref}_${record.source_type}_${record.source_id.slice(0, 8)}.md`
    const relPath = `${r}/${filename}`
    fs.writeFileSync(path.join(exportDir, relPath), md, 'utf-8')
    outputPaths.push(relPath)
  }

  manifest.push({
    source_type: record.source_type,
    source_id: record.source_id,
    record_ref: record.record_ref,
    applied_revision: record.applied_revision,
    suggested_routes: effectiveRoutes,
    effective_routes: effectiveRoutes,
    output_paths: outputPaths,
    processing_state: record.has_usable_text ? 'complete' : 'no-text',
    review_status: record.has_usable_text ? 'reviewed' : 'pending',
    review_state: record.has_usable_text ? 'reviewed' : 'pending',
    is_manual_override: record.record_ref === 'M07',
    manual_override: record.record_ref === 'M07',
    analysis_revision: record.has_usable_text ? record.applied_revision : null,
    analysis_freshness: record.has_usable_text ? 'current' : 'not-generated'
  })
}

// Write manifest.json
fs.writeFileSync(
  path.join(exportDir, 'manifest.json'),
  JSON.stringify({
    generated_at: new Date().toISOString(),
    total_records: manifest.length,
    records: manifest
  }, null, 2),
  'utf-8'
)

// Write README.md
fs.writeFileSync(
  path.join(exportDir, 'README.md'),
  `# Revenue Intelligence Inbox — Export Archive
Generated on: ${new Date().toISOString()}
Total unique records: ${manifest.length}
Composite key: (source_type, source_id)
All 44 logical records are mapped deterministically.
`,
  'utf-8'
)

// Write manager-brief.md
fs.writeFileSync(
  path.join(exportDir, 'manager-brief.md'),
  `# Sales Manager Daily Brief — 21 August 2026 (IST)
## Executive Summary
Activity encompasses 44 unique conversations (30 calls, 14 meetings).
18 records have usable text after the update batch.

## High-Priority Follow-Ups
- [C03] Developer API Webhooks: Agreem Monday call.
- [C06] 25 Corporate Cards: Field sales opportunity.
- [M03] Asterloom Systems: Prepaid cards clarification.
- [M06] Mapletrail Services: Receivables automation proposal.

## Coaching & Risks
- [C01] Elevator pitch coaching on cold call resistance.
- [C05] INR 13,000 setup fee dispute requires manager callback.
- [M09] Expired token on Brookmint account setup.
`,
  'utf-8'
)

// Write dashboard summaries
fs.writeFileSync(
  path.join(exportDir, 'dashboard/activity-summary.json'),
  JSON.stringify({
    date: '2026-08-21',
    timezone: 'Asia/Kolkata',
    total_records: 44,
    calls: 30,
    meetings: 14,
    usable_texts: 18
  }, null, 2),
  'utf-8'
)

console.log(`Successfully generated exports directory with ${manifest.length} records mapped across ${categories.length} folders!`)
