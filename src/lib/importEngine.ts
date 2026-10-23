import { db } from './db'
import { DeliveryEnvelopeSchema } from './zod-schemas'
import { determineRoutes } from './routingEngine'
import { getPreGeneratedAnalysis } from '@/data/preGeneratedAnalysis'
import type {
  StoredRecord,
  RoutingDecision,
  AnalysisRecord,
  ImportHistory,
  ProcessingState,
} from '@/types'

export interface ImportResult {
  batch_id: string
  revision: number
  new_count: number
  updated_count: number
  unchanged_count: number
  ignored_count: number
  error_count: number
  total_records: number
  errors: string[]
}

export function checkHasUsableText(sourceType: 'call' | 'meeting', payload: any, transcriptPayload: any): boolean {
  if (sourceType === 'call') {
    return typeof payload.transcript === 'string' && payload.transcript.trim().length > 0
  } else {
    return Array.isArray(transcriptPayload?.turns) && transcriptPayload.turns.length > 0
  }
}

export async function processDeliveryEnvelope(rawJson: unknown): Promise<ImportResult> {
  const parseResult = DeliveryEnvelopeSchema.safeParse(rawJson)

  if (!parseResult.success) {
    const errorMessages = parseResult.error.issues.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    )
    await db.auditLogs.add({
      timestamp: new Date().toISOString(),
      action: 'import-validation-error',
      details: `Envelope validation failed with ${errorMessages.length} errors`,
    })
    return {
      batch_id: (rawJson as any)?.batch_id || 'unknown',
      revision: (rawJson as any)?.revision || 0,
      new_count: 0,
      updated_count: 0,
      unchanged_count: 0,
      ignored_count: 0,
      error_count: errorMessages.length,
      total_records: 0,
      errors: errorMessages,
    }
  }

  const envelope = parseResult.data
  const importedAt = new Date().toISOString()

  let newCount = 0
  let updatedCount = 0
  let unchangedCount = 0
  let ignoredCount = 0
  const errors: string[] = []

  for (const record of envelope.records) {
    const key: [string, string] = [record.source_type, record.source_id]
    const existing = await db.sourceRecords.get(key)
    const hasUsableText = checkHasUsableText(
      record.source_type,
      record.payload,
      record.transcript_payload
    )

    const processingState: ProcessingState = hasUsableText ? 'complete' : 'no-text'

    if (!existing) {
      // 1. Brand new record
      const newStored: StoredRecord = {
        source_type: record.source_type,
        source_id: record.source_id,
        record_ref: record.record_ref,
        applied_revision: envelope.revision,
        payload: record.payload,
        transcript_payload: record.transcript_payload,
        imported_at: importedAt,
        last_updated_at: importedAt,
        has_usable_text: hasUsableText,
        processing_state: processingState,
      }
      await db.sourceRecords.put(newStored)

      // Initial routing
      const routeResult = determineRoutes(newStored)
      const routingDecision: RoutingDecision = {
        source_type: record.source_type,
        source_id: record.source_id,
        suggested_routes: routeResult.suggested_routes,
        suggestion_rationale: routeResult.rationale,
        effective_routes: routeResult.suggested_routes,
        routing_method: 'suggested',
        is_manual_override: false,
        manual_routes: null,
        manual_note: null,
        manual_override_at: null,
        review_status: hasUsableText ? 'pending' : 'reviewed',
        review_note: hasUsableText ? null : 'Auto-reviewed: no text available',
        reviewed_at: null,
        last_updated_at: importedAt,
      }
      await db.routingDecisions.put(routingDecision)

      // Initial analysis if available
      const preGen = getPreGeneratedAnalysis(record.source_type, record.source_id, envelope.revision)
      if (preGen) {
        await db.analysisRecords.put(preGen)
      }

      newCount++
    } else {
      // Record already exists in DB
      if (envelope.revision > existing.applied_revision) {
        // Newer revision! Replace source payload & transcript
        const updatedStored: StoredRecord = {
          ...existing,
          record_ref: record.record_ref, // update ref if changed
          applied_revision: envelope.revision,
          payload: record.payload,
          transcript_payload: record.transcript_payload,
          last_updated_at: importedAt,
          has_usable_text: hasUsableText,
          processing_state: processingState,
        }
        await db.sourceRecords.put(updatedStored)

        // Routing: check existing decision to PRESERVE MANUAL OVERRIDES
        const existingRouting = await db.routingDecisions.get(key)
        const freshRoutes = determineRoutes(updatedStored)

        if (existingRouting?.is_manual_override) {
          // Keep manual override intact! Only update suggested_routes and freshness note
          await db.routingDecisions.put({
            ...existingRouting,
            suggested_routes: freshRoutes.suggested_routes,
            suggestion_rationale: `Updated with revision ${envelope.revision}: ${freshRoutes.rationale}`,
            last_updated_at: importedAt,
          })
        } else {
          // If no manual override, apply newly suggested routes
          await db.routingDecisions.put({
            source_type: record.source_type,
            source_id: record.source_id,
            suggested_routes: freshRoutes.suggested_routes,
            suggestion_rationale: freshRoutes.rationale,
            effective_routes: freshRoutes.suggested_routes,
            routing_method: 'suggested',
            is_manual_override: false,
            manual_routes: null,
            manual_note: null,
            manual_override_at: null,
            review_status: 'needs-attention', // flag for manager attention!
            review_note: `Source updated to rev ${envelope.revision}; review updated text`,
            reviewed_at: null,
            last_updated_at: importedAt,
          })
        }

        // Analysis: check if previously generated analysis is now stale
        const existingAnalysis = await db.analysisRecords.get(key)
        const preGen = getPreGeneratedAnalysis(record.source_type, record.source_id, envelope.revision)

        if (preGen) {
          await db.analysisRecords.put(preGen)
        } else if (existingAnalysis) {
          // Mark stale if source text changed
          await db.analysisRecords.put({
            ...existingAnalysis,
            freshness: 'stale',
            updated_at: importedAt,
          })
          await db.auditLogs.add({
            timestamp: importedAt,
            action: 'analysis-stale',
            source_type: record.source_type,
            source_id: record.source_id,
            record_ref: record.record_ref,
            details: `Source text updated to revision ${envelope.revision}. Stored analysis marked stale.`,
          })
        }

        updatedCount++
      } else if (envelope.revision === existing.applied_revision) {
        // Equal revision: duplicate import, idempotent no-op
        unchangedCount++
      } else {
        // Older revision: ignore to prevent regression
        ignoredCount++
      }
    }
  }

  // Record import history
  const historyEntry: ImportHistory = {
    batch_id: envelope.batch_id,
    revision: envelope.revision,
    exported_at: envelope.exported_at,
    imported_at: importedAt,
    new_count: newCount,
    updated_count: updatedCount,
    unchanged_count: unchangedCount,
    ignored_count: ignoredCount,
    error_count: 0,
    total_records: envelope.records.length,
    errors: [],
  }
  await db.importHistory.add(historyEntry)

  // Audit log entry
  let action: any = 'import-initial'
  if (updatedCount > 0) action = 'import-update'
  else if (newCount === 0 && unchangedCount > 0) action = 'import-repeat'

  await db.auditLogs.add({
    timestamp: importedAt,
    action,
    batch_id: envelope.batch_id,
    details: `Imported envelope '${envelope.batch_id}' (rev ${envelope.revision}): ${newCount} new, ${updatedCount} updated, ${unchangedCount} unchanged, ${ignoredCount} ignored.`,
  })

  return {
    batch_id: envelope.batch_id,
    revision: envelope.revision,
    new_count: newCount,
    updated_count: updatedCount,
    unchanged_count: unchangedCount,
    ignored_count: ignoredCount,
    error_count: 0,
    total_records: envelope.records.length,
    errors: [],
  }
}

export async function resetDatabase(): Promise<void> {
  await db.sourceRecords.clear()
  await db.analysisRecords.clear()
  await db.routingDecisions.clear()
  await db.auditLogs.clear()
  await db.importHistory.clear()

  await db.auditLogs.add({
    timestamp: new Date().toISOString(),
    action: 'database-reset',
    details: 'Database completely cleared by user reset.',
  })
}
