import Dexie, { type Table } from 'dexie'
import type {
  StoredRecord,
  AnalysisRecord,
  RoutingDecision,
  AuditEntry,
  ImportHistory,
} from '@/types'

export class RevenueIntelligenceDB extends Dexie {
  sourceRecords!: Table<StoredRecord, [string, string]>
  analysisRecords!: Table<AnalysisRecord, [string, string]>
  routingDecisions!: Table<RoutingDecision, [string, string]>
  auditLogs!: Table<AuditEntry, number>
  importHistory!: Table<ImportHistory, number>

  constructor() {
    super('RevenueIntelligenceDB')
    this.version(1).stores({
      sourceRecords: '[source_type+source_id], record_ref, source_type, applied_revision, has_usable_text, processing_state',
      analysisRecords: '[source_type+source_id], freshness, analysis_source_revision, is_pre_generated',
      routingDecisions: '[source_type+source_id], is_manual_override, review_status, routing_method',
      auditLogs: '++id, timestamp, action, record_ref, source_type, batch_id',
      importHistory: '++id, batch_id, revision, imported_at',
    })
  }
}

export const db = new RevenueIntelligenceDB()
