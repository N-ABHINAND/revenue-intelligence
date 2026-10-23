import React, { useState, useEffect } from 'react'
import {
  Phone,
  Video,
  FileCheck,
  AlertCircle,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Filter,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { db } from '@/lib/db'
import type { StoredRecord, RoutingDecision, AnalysisRecord, RouteCategory } from '@/types'
import { getRouteBadgeColor, getRouteLabel } from '@/lib/utils'
import { Tooltip } from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'
import { RecordDetailDrawer } from '@/components/RecordDetailDrawer'

export function Overview() {
  const [records, setRecords] = useState<StoredRecord[]>([])
  const [routings, setRoutings] = useState<Map<string, RoutingDecision>>(new Map())
  const [analyses, setAnalyses] = useState<Map<string, AnalysisRecord>>(new Map())
  const [selectedRecord, setSelectedRecord] = useState<StoredRecord | null>(null)

  // Filters
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | 'call' | 'meeting'>('all')
  const [personFilter, setPersonFilter] = useState<string>('all')

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

  // Apply real interactive filters
  const filteredRecords = records.filter((r) => {
    if (sourceTypeFilter !== 'all' && r.source_type !== sourceTypeFilter) return false
    if (personFilter !== 'all') {
      const p: any = r.payload
      const personName = r.source_type === 'call' ? p.rep_name || p.rep_email : p.organizer_email
      if (personName !== personFilter) return false
    }
    return true
  })

  // Calculations derived dynamically from filteredRecords
  const totalCount = filteredRecords.length
  const callCount = filteredRecords.filter((r) => r.source_type === 'call').length
  const meetingCount = filteredRecords.filter((r) => r.source_type === 'meeting').length

  const usableCalls = filteredRecords.filter((r) => r.source_type === 'call' && r.has_usable_text).length
  const usableMeetings = filteredRecords.filter((r) => r.source_type === 'meeting' && r.has_usable_text).length
  const usableTotal = usableCalls + usableMeetings

  // Call connection rate calculations (ONLY calls with non-null is_connected)
  const connectedCalls = filteredRecords.filter(
    (r) => r.source_type === 'call' && (r.payload as any).is_connected === true
  ).length
  const notConnectedCalls = filteredRecords.filter(
    (r) => r.source_type === 'call' && (r.payload as any).is_connected === false
  ).length
  const callsWithKnownConnection = connectedCalls + notConnectedCalls
  const callsWithNullConnection = callCount - callsWithKnownConnection
  const connectionRatePct =
    callsWithKnownConnection > 0 ? Math.round((connectedCalls / callsWithKnownConnection) * 100) : 0

  // Needs review count
  const needsReviewCount = filteredRecords.filter((r) => {
    const routing = routings.get(`${r.source_type}:${r.source_id}`)
    return routing?.review_status === 'needs-attention' || routing?.effective_routes.includes('human-review')
  }).length

  // Stale analysis count
  const staleAnalysisCount = filteredRecords.filter((r) => {
    const analysis = analyses.get(`${r.source_type}:${r.source_id}`)
    return analysis?.freshness === 'stale'
  }).length

  // Routing distribution counts
  const routeDistribution: Record<string, number> = {
    'deal-next-steps': 0,
    'sales-coaching': 0,
    'customer-follow-up': 0,
    'partnership-follow-up': 0,
    'internal-vendor': 0,
    'human-review': 0,
    'insufficient-evidence': 0,
  }

  filteredRecords.forEach((r) => {
    const routing = routings.get(`${r.source_type}:${r.source_id}`)
    const routes = routing?.effective_routes || ['insufficient-evidence']
    routes.forEach((route) => {
      if (routeDistribution[route] !== undefined) {
        routeDistribution[route]++
      }
    })
  })

  const routeChartData = Object.entries(routeDistribution).map(([route, count]) => ({
    name: getRouteLabel(route),
    count,
    route,
  }))

  // Distinct persons for filter dropdown
  const allPersons = Array.from(
    new Set(
      records
        .map((r) => {
          const p: any = r.payload
          return r.source_type === 'call' ? p.rep_name || p.rep_email : p.organizer_email
        })
        .filter(Boolean)
    )
  )

  // Activity by person (strictly distinguishing Call Reps vs Meeting Organisers)
  const repActivity: Record<string, { calls: number; withText: number }> = {}
  const organiserActivity: Record<string, { meetings: number; withText: number }> = {}

  filteredRecords.forEach((r) => {
    const p: any = r.payload
    if (r.source_type === 'call') {
      const rep = p.rep_name || p.rep_email || 'Unassigned Rep'
      if (!repActivity[rep]) repActivity[rep] = { calls: 0, withText: 0 }
      repActivity[rep].calls++
      if (r.has_usable_text) repActivity[rep].withText++
    } else {
      const org = p.organizer_email || 'Unassigned Organiser'
      if (!organiserActivity[org]) organiserActivity[org] = { meetings: 0, withText: 0 }
      organiserActivity[org].meetings++
      if (r.has_usable_text) organiserActivity[org].withText++
    }
  })

  // High-priority follow-up recommendations (evidence-backed items)
  const priorityRecords = filteredRecords
    .filter((r) => r.has_usable_text && analyses.has(`${r.source_type}:${r.source_id}`))
    .slice(0, 5)

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Interactive Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded">
              Manager Dashboard
            </span>
            <span className="text-xs text-slate-500 font-mono">Asia/Kolkata &bull; 21 Aug 2026</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Revenue Intelligence Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time evidence-backed sales analytics, deterministic deduplication, and manager review controls.
          </p>
        </div>

        {/* Dynamic Filters */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          <select
            value={sourceTypeFilter}
            onChange={(e) => setSourceTypeFilter(e.target.value as any)}
            className="text-xs p-1.5 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
          >
            <option value="all">All Source Types ({records.length})</option>
            <option value="call">Calls Only ({records.filter((r) => r.source_type === 'call').length})</option>
            <option value="meeting">Meetings Only ({records.filter((r) => r.source_type === 'meeting').length})</option>
          </select>

          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="text-xs p-1.5 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer max-w-[200px] truncate"
          >
            <option value="all">All Reps & Organisers</option>
            {allPersons.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {(sourceTypeFilter !== 'all' || personFilter !== 'all') && (
            <button
              onClick={() => {
                setSourceTypeFilter('all')
                setPersonFilter('all')
              }}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold px-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Cards with Required Explanatory Tooltips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Unique Source Records */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Unique Source Records</span>
            <Tooltip
              content={
                <div>
                  <strong>Metric Definition:</strong>
                  <br />
                  <strong>Numerator:</strong> Count of unique (source_type, source_id) pairs in currently applied dataset.
                  <br />
                  <strong>Denominator:</strong> N/A (absolute unique count).
                  <br />
                  <strong>Time Period:</strong> 21 August 2026 (Asia/Kolkata).
                  <br />
                  <strong>Limitation:</strong> Re-importing identical files does not duplicate records.
                </div>
              }
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500 font-medium">logical records</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <Phone className="w-3 h-3 text-slate-400" />
              {callCount} calls
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="flex items-center gap-1 font-medium">
              <Video className="w-3 h-3 text-slate-400" />
              {meetingCount} meetings
            </span>
          </div>
        </div>

        {/* Card 2: Usable Transcript Coverage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Usable Transcript Coverage</span>
            <Tooltip
              content={
                <div>
                  <strong>Coverage Calculation:</strong>
                  <br />
                  <strong>Numerator:</strong> Records with non-empty transcript text or turns &gt; 0 ({usableTotal}).
                  <br />
                  <strong>Denominator:</strong> Total logical records ({totalCount}).
                  <br />
                  <strong>Call breakdown:</strong> {usableCalls}/{callCount} calls.
                  <br />
                  <strong>Meeting breakdown:</strong> {usableMeetings}/{meetingCount} meetings.
                  <br />
                  <strong>Limitation:</strong> Missing transcripts do NOT mean meetings did not occur.
                </div>
              }
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-700">
              {usableTotal} <span className="text-lg font-normal text-slate-400">/ {totalCount}</span>
            </span>
            <span className="text-xs font-semibold text-teal-800">
              ({totalCount > 0 ? Math.round((usableTotal / totalCount) * 100) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Calls: <strong>{usableCalls}/{callCount}</strong></span>
            <span>Meetings: <strong>{usableMeetings}/{meetingCount}</strong></span>
          </div>
        </div>

        {/* Card 3: Calls Connection Rate (Source Reported) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Calls Connection Rate</span>
            <Tooltip
              content={
                <div>
                  <strong>Source-Reported Connection Rate:</strong>
                  <br />
                  <strong>Numerator:</strong> Calls where is_connected === true ({connectedCalls}).
                  <br />
                  <strong>Denominator:</strong> Calls with a non-null is_connected boolean ({callsWithKnownConnection}).
                  <br />
                  <strong>Unknown values:</strong> {callsWithNullConnection} calls reported null.
                  <br />
                  <strong>Limitation:</strong> Calculated strictly from non-null values. Null values are shown separately.
                </div>
              }
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{connectionRatePct}%</span>
            <span className="text-xs text-slate-500 font-medium">of reported dials</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>{connectedCalls} connected &bull; {notConnectedCalls} no-ans</span>
            <span className="text-slate-400">({callsWithNullConnection} null)</span>
          </div>
        </div>

        {/* Card 4: Governance & Review Queue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Governance Queue</span>
            <Tooltip
              content={
                <div>
                  <strong>Governance Metrics:</strong>
                  <br />
                  <strong>Needs Attention:</strong> Records requiring manager review or flagged for ambiguous intent ({needsReviewCount}).
                  <br />
                  <strong>Stale Analysis:</strong> Records where underlying transcript changed after initial analysis ({staleAnalysisCount}).
                </div>
              }
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-rose-600">{needsReviewCount}</span>
            <span className="text-xs font-medium text-slate-500">need manager review</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Stale analyses: <strong>{staleAnalysisCount}</strong></span>
            <span className="text-slate-500">{totalCount - usableTotal} no transcript</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Routing Chart & Person Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Routing Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Routing Distribution (Multi-Route Assignments)</h3>
              <p className="text-xs text-slate-500">
                Number of records assigned to each intelligence destination based on currently applied filters.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="name"
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2.5 rounded shadow-lg">
                          <p className="font-semibold">{data.name}</p>
                          <p className="text-teal-400 font-mono mt-0.5">{data.count} conversation(s)</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {routeChartData.map((entry, index) => {
                    const colors = ['#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#64748B', '#F43F5E', '#94A3B8']
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Activity by Person (Call Rep vs Meeting Organiser strictly separated) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">Activity by Person</h3>
              <Tooltip
                content={
                  <div>
                    <strong>Data Integrity Notice:</strong>
                    <br />
                    Call representatives are distinct from meeting organisers. Do not assume meeting organisers attended or closed deals.
                    <br />
                    This dataset is a selected extract, not a complete measure of individual sales performance.
                  </div>
                }
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </Tooltip>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Differentiates call reps from calendar organisers without inferring performance ranking.
            </p>

            {/* Call Representatives */}
            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Call Representatives ({Object.keys(repActivity).length})
              </span>
              {Object.entries(repActivity).map(([rep, stat]) => (
                <div key={rep} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                  <span className="font-medium text-slate-800 truncate max-w-[140px]">{rep}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{stat.calls} calls</span>
                    <Badge variant="teal">{stat.withText} with text</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Meeting Organisers */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Meeting Organisers ({Object.keys(organiserActivity).length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {Object.entries(organiserActivity).map(([org, stat]) => (
                  <div key={org} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">{org}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{stat.meetings} mtgs</span>
                      <Badge variant="secondary">{stat.withText} with text</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
            * Selected sample only. Employee leaderboards are deliberately omitted.
          </div>
        </div>
      </div>

      {/* High-Priority Follow-Up Recommendations (Evidence-Backed) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">
                High-Priority Follow-Up Recommendations (Evidence Traceable)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Each recommendation links directly to verbatim conversation evidence with concrete next actions and action owners.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {priorityRecords.map((r) => {
            const an = analyses.get(`${r.source_type}:${r.source_id}`)
            const ro = routings.get(`${r.source_type}:${r.source_id}`)
            if (!an) return null

            return (
              <div
                key={`${r.source_type}:${r.source_id}`}
                onClick={() => setSelectedRecord(r)}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                      {r.record_ref}
                    </span>
                    <div className="flex items-center gap-1">
                      {ro?.effective_routes.map((rt) => (
                        <span key={rt} className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRouteBadgeColor(rt)}`}>
                          {getRouteLabel(rt)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 mb-1.5 line-clamp-2">
                    {an.summary}
                  </p>

                  {/* Supporting quote preview */}
                  {an.evidence_passages.length > 0 && (
                    <blockquote className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-700 italic mb-2 line-clamp-2">
                      "{an.evidence_passages[0].quote || an.evidence_passages[0].text}"
                    </blockquote>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Owner: {an.action_owner || 'Unassigned'}</span>
                  <span className="text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                    Inspect <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            )
          })}
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
