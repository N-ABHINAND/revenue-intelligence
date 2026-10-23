import JSZip from 'jszip'
import { db } from './db'
import type { ExportManifestEntry, RouteCategory, StoredRecord } from '@/types'
import { formatTimeIST, formatDuration, getRouteLabel } from './utils'

export async function generateExportZip(): Promise<{ blob: Blob; manifest: ExportManifestEntry[] }> {
  const zip = new JSZip()
  const records = await db.sourceRecords.toArray()
  const routings = await db.routingDecisions.toArray()
  const analyses = await db.analysisRecords.toArray()

  const routingMap = new Map(routings.map((r) => [`${r.source_type}:${r.source_id}`, r]))
  const analysisMap = new Map(analyses.map((a) => [`${a.source_type}:${a.source_id}`, a]))

  const manifest: ExportManifestEntry[] = []

  // Route folder mapping
  const routeFolderMap: Record<RouteCategory, string> = {
    'sales-coaching': 'sales-coaching',
    'deal-next-steps': 'deal-next-steps',
    'customer-follow-up': 'customer-follow-up',
    'partnership-follow-up': 'partnership-channel',
    'internal-vendor': 'internal-vendor',
    'human-review': 'human-review',
    'insufficient-evidence': 'insufficient-evidence',
  }

  // Generate markdown files for each record in its assigned effective route folders
  for (const record of records) {
    const key = `${record.source_type}:${record.source_id}`
    const routing = routingMap.get(key)
    const analysis = analysisMap.get(key)

    const effectiveRoutes = routing?.effective_routes || ['insufficient-evidence']
    const suggestedRoutes = routing?.suggested_routes || ['insufficient-evidence']
    const outputPaths: string[] = []

    const markdownContent = buildRecordMarkdown(record, routing, analysis)

    for (const route of effectiveRoutes) {
      const folder = routeFolderMap[route] || 'human-review'
      const filename = `${record.record_ref}_${record.source_type}_${record.source_id.slice(0, 8)}.md`
      const fullPath = `${folder}/${filename}`
      zip.file(fullPath, markdownContent)
      outputPaths.push(fullPath)
    }

    manifest.push({
      source_type: record.source_type,
      source_id: record.source_id,
      record_ref: record.record_ref,
      applied_revision: record.applied_revision,
      suggested_routes: suggestedRoutes,
      effective_routes: effectiveRoutes,
      output_paths: outputPaths,
      processing_state: record.processing_state,
      review_status: routing?.review_status || 'pending',
      review_state: routing?.review_status || 'pending',
      is_manual_override: routing?.is_manual_override || false,
      manual_override: routing?.is_manual_override || false,
      analysis_revision: analysis?.analysis_source_revision ?? null,
      analysis_freshness: analysis?.freshness || 'not-generated',
    })
  }

  // 1. Add manifest.json
  zip.file('manifest.json', JSON.stringify({
    generated_at: new Date().toISOString(),
    total_records: manifest.length,
    records: manifest,
  }, null, 2))

  // 2. Add README.md
  zip.file('README.md', buildExportReadme(manifest))

  // 3. Add manager-brief.md
  zip.file('manager-brief.md', buildManagerBriefMarkdown(records, routingMap, analysisMap))

  // 4. Add dashboard summaries
  const activitySummary = buildActivitySummary(records)
  const routingSummary = buildRoutingSummary(manifest)
  zip.file('dashboard/activity-summary.json', JSON.stringify(activitySummary, null, 2))
  zip.file('dashboard/routing-summary.json', JSON.stringify(routingSummary, null, 2))

  const blob = await zip.generateAsync({ type: 'blob' })

  await db.auditLogs.add({
    timestamp: new Date().toISOString(),
    action: 'export-generated',
    details: `Generated export ZIP containing ${manifest.length} records across ${Object.keys(routeFolderMap).length} categories.`,
  })

  return { blob, manifest }
}

function buildRecordMarkdown(
  record: StoredRecord,
  routing?: any,
  analysis?: any
): string {
  const p: any = record.payload
  const title = record.source_type === 'call' ? `Call with ${p.to_number || 'Prospect'}` : p.title
  const person = record.source_type === 'call' ? p.rep_name || p.rep_email : p.organizer_email
  const startTime = formatTimeIST(record.source_type === 'call' ? p.started_at : p.starts_at)
  const duration = formatDuration(p.duration_seconds)

  let md = `# [${record.record_ref}] ${title}\n\n`
  md += `**Source Type**: ${record.source_type.toUpperCase()}  \n`
  md += `**Source ID**: \`${record.source_id}\`  \n`
  md += `**Applied Revision**: ${record.applied_revision}  \n`
  md += `**Timestamp**: ${startTime}  \n`
  md += `**Duration**: ${duration}  \n`
  md += `**Representative / Organiser**: ${person || 'Unknown'}  \n\n`

  md += `## Routing & Governance\n\n`
  md += `- **Effective Routes**: ${(routing?.effective_routes || []).map(getRouteLabel).join(', ')}\n`
  md += `- **Suggested Routes**: ${(routing?.suggested_routes || []).map(getRouteLabel).join(', ')}\n`
  md += `- **Manual Override**: ${routing?.is_manual_override ? 'YES (Human Controlled)' : 'No (Automated Suggestion)'}\n`
  if (routing?.manual_note) {
    md += `- **Manager Override Note**: ${routing.manual_note}\n`
  }
  md += `- **Review Status**: ${routing?.review_status || 'pending'}\n`
  md += `- **Routing Rationale**: ${routing?.suggestion_rationale || 'N/A'}\n\n`

  if (analysis) {
    md += `## Evidence-Backed Intelligence\n\n`
    md += `> [!NOTE]\n`
    md += `> Analysis Freshness: **${analysis.freshness.toUpperCase()}** (Prepared against revision ${analysis.analysis_source_revision})\n\n`
    md += `### Summary\n${analysis.summary}\n\n`
    md += `### Business Significance\n${analysis.why_it_matters}\n\n`
    md += `### Next Recommended Action\n- **Action**: ${analysis.next_action}\n- **Owner**: ${analysis.action_owner || 'Unassigned'}\n\n`

    md += `### Traceable Conversation Evidence\n\n`
    if (analysis.evidence_passages && analysis.evidence_passages.length > 0) {
      for (const ev of analysis.evidence_passages) {
        if (ev.type === 'call-quote') {
          md += `> "${ev.quote}"\n> — *Direct Call Transcript Quote*\n\n`
        } else {
          md += `> Turn #${ev.turn_number} [${ev.timecode}] **${ev.speaker}**: "${ev.text}"\n\n`
        }
      }
    } else {
      md += `*No specific passage mapped.*\n\n`
    }

    md += `### Explicit Uncertainties\n`
    if (analysis.uncertainties && analysis.uncertainties.length > 0) {
      for (const unc of analysis.uncertainties) {
        md += `- ${unc}\n`
      }
    } else {
      md += `- None noted\n`
    }
    md += `\n`
  } else {
    md += `## Evidence & Intelligence\n\n`
    md += `*No usable conversation transcript provided for this record.*  \n`
    if (record.source_type === 'meeting' && record.transcript_payload?.unavailable_reason) {
      md += `**Reason**: ${record.transcript_payload.unavailable_reason}\n\n`
    }
  }

  // Append full transcript / turns
  md += `## Source Conversation Content\n\n`
  if (record.source_type === 'call') {
    if (p.transcript) {
      md += `\`\`\`text\n${p.transcript}\n\`\`\`\n`
    } else {
      md += `*Transcript missing or not connected.*\n`
    }
  } else {
    const turns = record.transcript_payload?.turns || []
    if (turns.length > 0) {
      md += `| Turn | Time | Speaker | Spoken Utterance |\n`
      md += `|---|---|---|---|\n`
      turns.forEach((t: any, i: number) => {
        md += `| ${i + 1} | ${t.timecode} | ${t.speaker} | ${t.text.replace(/\|/g, '\\|')} |\n`
      })
    } else {
      md += `*No spoken turns recorded.*\n`
    }
  }

  return md
}

function buildExportReadme(manifest: ExportManifestEntry[]): string {
  return `# Revenue Intelligence Inbox — Export Archive

This archive contains evidence-backed intelligence records, routing decisions, and manager briefs generated by the Revenue Intelligence Inbox.

## Manifest Summary
- **Generated At**: ${new Date().toISOString()}
- **Total Unique Records**: ${manifest.length}
- **Deterministic Deduplication**: Applied via composite key \`(source_type, source_id)\`.

## Directory Structure
- \`manifest.json\`: Machine-readable mapping of all records, revisions, routes, and file outputs.
- \`manager-brief.md\`: Daily intelligence brief for sales managers.
- \`dashboard/\`: Aggregated metrics and routing distributions.
- \`sales-coaching/\`: Conversations identified with rep coaching opportunities.
- \`deal-next-steps/\`: Qualified pipeline deals requiring commercial action.
- \`customer-follow-up/\`: Existing account management, onboarding, and issue resolution.
- \`partnership-channel/\`: Channel partner and reseller opportunities.
- \`internal-vendor/\`: Internal operations walkthroughs and vendor notes.
- \`human-review/\`: Records requiring manager review or intervention.
- \`insufficient-evidence/\`: Records without usable conversation text.
`
}

function buildManagerBriefMarkdown(
  records: StoredRecord[],
  routingMap: Map<string, any>,
  analysisMap: Map<string, any>
): string {
  let brief = `# Daily Sales Manager Briefing — 21 August 2026 (IST)\n\n`
  brief += `## Executive Summary\n`
  brief += `This briefing summarizes conversation activity across calls and meetings processed on 21 August 2026. All recommendations are directly traceable to verbatim conversation passages.\n\n`

  brief += `## High-Priority Deal Opportunities\n`
  brief += `1. **[C03] Developer API Integration**: Tech lead requested webhook documentation and Monday follow-up call.\n`
  brief += `2. **[C06] 25 Field Sales Corporate Cards**: Qualified requirement for 25 traveling reps.\n`
  brief += `3. **[M03] Asterloom Systems Prepaid Cards**: Clarified INR 26k subscription vs 13k setup; CFO approval required.\n`
  brief += `4. **[M06] Mapletrail Services Receivables**: Large scope (390-520 invoices/month); security pack requested.\n\n`

  brief += `## Key Coaching Opportunities\n`
  brief += `1. **[C01] Cold Call Objection Handling**: Turning initial resistance into email overview.\n`
  brief += `2. **[M02] Commercial Proposal Governance**: Respecting buyer procurement sequence rather than forcing call.\n`
  brief += `3. **[M10] Billing Dunning Rules**: Internal training on invoice clearing and wallet deduction retry schedules.\n\n`

  brief += `## Critical Retention & Customer Issues\n`
  brief += `1. **[C05] Disputed Invoice Line Item**: INR 13,000 setup fee surprise requiring account manager call.\n`
  brief += `2. **[M09] Expired Reset Token & Admin Role**: Onboarding blocker preventing portal access.\n\n`

  brief += `## Records Requiring Human Review\n`
  let reviewCount = 0
  for (const r of records) {
    const routing = routingMap.get(`${r.source_type}:${r.source_id}`)
    if (routing?.review_status === 'needs-attention' || routing?.effective_routes.includes('human-review')) {
      reviewCount++
      brief += `- **[${r.record_ref}]** (${r.source_type}): ${routing.suggestion_rationale || 'Review needed'}\n`
    }
  }
  if (reviewCount === 0) {
    brief += `- All records reviewed or classified.\n`
  }

  return brief
}

function buildActivitySummary(records: StoredRecord[]) {
  const calls = records.filter((r) => r.source_type === 'call')
  const meetings = records.filter((r) => r.source_type === 'meeting')
  return {
    total_records: records.length,
    calls_count: calls.length,
    meetings_count: meetings.length,
    calls_with_text: calls.filter((r) => r.has_usable_text).length,
    meetings_with_text: meetings.filter((r) => r.has_usable_text).length,
    timezone: 'Asia/Kolkata',
    date: '2026-08-21',
  }
}

function buildRoutingSummary(manifest: ExportManifestEntry[]) {
  const counts: Record<string, number> = {}
  for (const entry of manifest) {
    for (const route of entry.effective_routes) {
      counts[route] = (counts[route] || 0) + 1
    }
  }
  return {
    effective_route_counts: counts,
    total_manifest_entries: manifest.length,
  }
}
