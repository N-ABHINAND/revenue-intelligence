import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Phone,
  Video,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { db } from '@/lib/db'
import type { StoredRecord, RoutingDecision, AnalysisRecord, RouteCategory, ReviewStatus } from '@/types'
import { formatTimeIST, formatDuration, getRouteBadgeColor, getRouteLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { RecordDetailDrawer } from '@/components/RecordDetailDrawer'

export function ConversationInbox() {
  const [records, setRecords] = useState<StoredRecord[]>([])
  const [routings, setRoutings] = useState<Map<string, RoutingDecision>>(new Map())
  const [analyses, setAnalyses] = useState<Map<string, AnalysisRecord>>(new Map())
  const [selectedRecord, setSelectedRecord] = useState<StoredRecord | null>(null)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'call' | 'meeting'>('all')
  const [routeFilter, setRouteFilter] = useState<string>('all')
  const [reviewFilter, setReviewFilter] = useState<string>('all')
  const [textFilter, setTextFilter] = useState<'all' | 'has_text' | 'no_text'>('all')

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

  // Filter records
  const filtered = records.filter((r) => {
    const key = `${r.source_type}:${r.source_id}`
    const routing = routings.get(key)
    const analysis = analyses.get(key)
    const p: any = r.payload

    if (typeFilter !== 'all' && r.source_type !== typeFilter) return false
    if (textFilter === 'has_text' && !r.has_usable_text) return false
    if (textFilter === 'no_text' && r.has_usable_text) return false

    if (reviewFilter !== 'all') {
      if (routing?.review_status !== reviewFilter) return false
    }

    if (routeFilter !== 'all') {
      if (!routing?.effective_routes.includes(routeFilter as RouteCategory)) return false
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      const title = r.source_type === 'call' ? p.to_number || '' : p.title || ''
      const person = r.source_type === 'call' ? p.rep_name || p.rep_email || '' : p.organizer_email || ''
      const summary = analysis?.summary || ''
      const ref = r.record_ref.toLowerCase()
      const id = r.source_id.toLowerCase()

      return (
        ref.includes(q) ||
        id.includes(q) ||
        title.toLowerCase().includes(q) ||
        person.toLowerCase().includes(q) ||
        summary.toLowerCase().includes(q)
      )
    }

    return true
  })

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Conversation Inbox</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Searchable log of 44 unique calls and meetings with verified evidence passages, multi-route tags, and manager reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="teal">{filtered.length} records shown</Badge>
          <span className="text-xs text-slate-400 font-mono">21 Aug 2026 (IST)</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ref (e.g. C01, M03), contact, person, summary keywords..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="all">All Types</option>
              <option value="call">Calls Only</option>
              <option value="meeting">Meetings Only</option>
            </select>

            <select
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="all">All Text Status</option>
              <option value="has_text">Has Usable Text</option>
              <option value="no_text">No Usable Text</option>
            </select>

            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 max-w-[160px] truncate"
            >
              <option value="all">All Routes</option>
              <option value="deal-next-steps">Deal Follow-up</option>
              <option value="sales-coaching">Sales Coaching</option>
              <option value="customer-follow-up">Customer Follow-up</option>
              <option value="partnership-follow-up">Partnership / Channel</option>
              <option value="internal-vendor">Internal / Vendor</option>
              <option value="human-review">Human Review</option>
              <option value="insufficient-evidence">Insufficient Evidence</option>
            </select>

            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="all">All Review States</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="needs-attention">Needs Attention</option>
            </select>

            {(search || typeFilter !== 'all' || routeFilter !== 'all' || reviewFilter !== 'all' || textFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('')
                  setTypeFilter('all')
                  setRouteFilter('all')
                  setReviewFilter('all')
                  setTextFilter('all')
                }}
                className="text-xs text-teal-600 hover:text-teal-800 font-semibold px-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Time (IST)</th>
                <th className="py-3 px-4">Subject / Title</th>
                <th className="py-3 px-3">Person</th>
                <th className="py-3 px-3">Text & Turns</th>
                <th className="py-3 px-4">Effective Routes</th>
                <th className="py-3 px-3">Review State</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                    No conversation records matched the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const key = `${r.source_type}:${r.source_id}`
                  const routing = routings.get(key)
                  const analysis = analyses.get(key)
                  const p: any = r.payload
                  const isCall = r.source_type === 'call'

                  const title = isCall ? `Call: ${p.to_number || 'Prospect'}` : p.title
                  const person = isCall ? p.rep_name || p.rep_email : p.organizer_email
                  const startTime = formatTimeIST(isCall ? p.started_at : p.starts_at)

                  return (
                    <tr
                      key={key}
                      onClick={() => setSelectedRecord(r)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {r.record_ref}
                          </span>
                          {routing?.is_manual_override && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" title="Manually Overridden" />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                          {isCall ? <Phone className="w-3 h-3 text-slate-400" /> : <Video className="w-3 h-3 text-slate-400" />}
                          {r.source_type.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {startTime}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 max-w-xs truncate" title={title}>
                          {title}
                        </div>
                        {analysis?.summary && (
                          <div className="text-[11px] text-slate-500 truncate max-w-sm" title={analysis.summary}>
                            {analysis.summary}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {person || 'Unspecified'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {r.has_usable_text ? (
                          <Badge variant="teal">
                            {isCall
                              ? `${formatDuration(p.duration_seconds)}`
                              : `${r.transcript_payload?.turns.length || 0} turns`}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No text</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(routing?.effective_routes || ['insufficient-evidence']).map((rt) => (
                            <span
                              key={rt}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRouteBadgeColor(rt)}`}
                            >
                              {getRouteLabel(rt)}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {routing?.review_status === 'needs-attention' ? (
                          <Badge variant="destructive">Needs Review</Badge>
                        ) : routing?.review_status === 'reviewed' ? (
                          <Badge variant="success">Reviewed</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="text-teal-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 font-semibold text-[11px]">
                          Inspect <ExternalLink className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
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
