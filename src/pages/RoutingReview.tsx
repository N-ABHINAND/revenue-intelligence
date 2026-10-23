import React, { useState, useEffect } from 'react'
import {
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Tag,
  UserCheck,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { db } from '@/lib/db'
import type { StoredRecord, RoutingDecision, AnalysisRecord, RouteCategory } from '@/types'
import { getRouteBadgeColor, getRouteLabel, formatTimeIST } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { RecordDetailDrawer } from '@/components/RecordDetailDrawer'

export function RoutingReview() {
  const [records, setRecords] = useState<StoredRecord[]>([])
  const [routings, setRoutings] = useState<Map<string, RoutingDecision>>(new Map())
  const [analyses, setAnalyses] = useState<Map<string, AnalysisRecord>>(new Map())
  const [selectedRecord, setSelectedRecord] = useState<StoredRecord | null>(null)

  // Filters
  const [filterMode, setFilterMode] = useState<'all' | 'needs-attention' | 'manual-overrides' | 'suggested-only'>('all')

  const loadData = async () => {
    const recs = await db.sourceRecords.toArray()
    const rDecs = await db.routingDecisions.toArray()
    const aDecs = await db.analysisRecords.toArray()

    setRecords(recs)
    setRoutings(new Map(rDecs.map((r) => [`${r.source_type}:${r.source_id}`, r])))
    setAnalyses(new Map(aDecs.map((a) => [`${a.source_type}:${a.source_id}`, a])))
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredRecords = records.filter((r) => {
    const key = `${r.source_type}:${r.source_id}`
    const routing = routings.get(key)

    if (filterMode === 'needs-attention') {
      return routing?.review_status === 'needs-attention' || routing?.effective_routes.includes('human-review')
    }
    if (filterMode === 'manual-overrides') {
      return routing?.is_manual_override === true
    }
    if (filterMode === 'suggested-only') {
      return routing?.is_manual_override === false
    }
    return true
  })

  const handleBulkApproveSuggestions = async () => {
    if (confirm('Mark all currently suggested automated routes as reviewed?')) {
      const allRoutings = await db.routingDecisions.toArray()
      for (const r of allRoutings) {
        if (r.review_status === 'pending') {
          await db.routingDecisions.put({
            ...r,
            review_status: 'reviewed',
            reviewed_at: new Date().toISOString(),
          })
        }
      }
      await db.auditLogs.add({
        timestamp: new Date().toISOString(),
        action: 'review-status-change',
        details: 'Manager bulk-approved pending automated routing suggestions.',
      })
      await loadData()
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Routing & Governance Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent routing engine keeping automated recommendations strictly separated from human decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkApproveSuggestions}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Approve All Pending</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Routing Decisions ({records.length})
        </button>
        <button
          onClick={() => setFilterMode('needs-attention')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterMode === 'needs-attention' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Needs Human Review ({records.filter((r) => {
            const rt = routings.get(`${r.source_type}:${r.source_id}`)
            return rt?.review_status === 'needs-attention' || rt?.effective_routes.includes('human-review')
          }).length})
        </button>
        <button
          onClick={() => setFilterMode('manual-overrides')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterMode === 'manual-overrides' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manager Overrides ({records.filter((r) => routings.get(`${r.source_type}:${r.source_id}`)?.is_manual_override).length})
        </button>
        <button
          onClick={() => setFilterMode('suggested-only')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterMode === 'suggested-only' ? 'bg-slate-200 text-slate-800' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Automated Suggestions
        </button>
      </div>

      {/* Routing Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((r) => {
          const key = `${r.source_type}:${r.source_id}`
          const routing = routings.get(key)
          const analysis = analyses.get(key)
          const p: any = r.payload
          const isCall = r.source_type === 'call'
          const title = isCall ? `Call: ${p.to_number || 'Prospect'}` : p.title

          return (
            <div
              key={key}
              onClick={() => setSelectedRecord(r)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                      {r.record_ref}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {r.source_type}
                    </span>
                    {routing?.is_manual_override ? (
                      <Badge variant="teal">Manual Override</Badge>
                    ) : (
                      <Badge variant="secondary">Automated</Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Rev {r.applied_revision}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>

                {analysis && (
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{analysis.summary}</p>
                )}

                {/* Routing Comparison Box */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                      Automated Suggestion:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {routing?.suggested_routes.map((rt) => (
                        <span key={rt} className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRouteBadgeColor(rt)}`}>
                          {getRouteLabel(rt)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                      Effective Route Applied:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {routing?.effective_routes.map((rt) => (
                        <span key={rt} className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRouteBadgeColor(rt)}`}>
                          {getRouteLabel(rt)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                    Rationale: {routing?.suggestion_rationale}
                  </p>

                  {routing?.manual_note && (
                    <div className="p-1.5 bg-teal-50 border border-teal-200 rounded text-[11px] text-teal-900">
                      <strong>Manager Note:</strong> {routing.manual_note}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Status: <strong>{routing?.review_status}</strong>
                </span>
                <span className="text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                  Edit Routes <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Drawer */}
      <RecordDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onRecordUpdated={loadData}
      />
    </div>
  )
}
