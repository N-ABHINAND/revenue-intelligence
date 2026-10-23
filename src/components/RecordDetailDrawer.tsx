import React, { useState, useEffect } from 'react'
import {
  X,
  ShieldCheck,
  Clock,
  User,
  Quote,
  AlertTriangle,
  RotateCcw,
  Check,
  Tag,
  ExternalLink,
  Phone,
  Video,
} from 'lucide-react'
import { db } from '@/lib/db'
import type {
  StoredRecord,
  RoutingDecision,
  AnalysisRecord,
  RouteCategory,
  ReviewStatus,
} from '@/types'
import { formatTimeIST, formatDuration, getRouteBadgeColor, getRouteLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface RecordDetailDrawerProps {
  record: StoredRecord | null
  onClose: () => void
  onRecordUpdated: () => void
}

const ALL_ROUTE_CATEGORIES: { id: RouteCategory; label: string; desc: string }[] = [
  { id: 'sales-coaching', label: 'Sales Coaching', desc: 'Rep objection handling, talk ratio, sales methodology' },
  { id: 'deal-next-steps', label: 'Deal Follow-up', desc: 'Commercial proposals, demo progression, pricing quotes' },
  { id: 'customer-follow-up', label: 'Customer Follow-up', desc: 'Post-sales onboarding, billing disputes, customer support' },
  { id: 'partnership-follow-up', label: 'Partnership / Channel', desc: 'Reseller, agency distribution, indirect channel inquiry' },
  { id: 'internal-vendor', label: 'Internal / Vendor Notes', desc: 'Internal operations walkthrough, training, billing rules' },
  { id: 'human-review', label: 'Human Review Needed', desc: 'Ambiguous intent, high-risk security hurdle, or missing info' },
  { id: 'insufficient-evidence', label: 'Insufficient Evidence', desc: 'No usable transcript available in source envelope' },
]

export function RecordDetailDrawer({ record, onClose, onRecordUpdated }: RecordDetailDrawerProps) {
  if (!record) return null

  const [routing, setRouting] = useState<RoutingDecision | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null)
  const [selectedRoutes, setSelectedRoutes] = useState<RouteCategory[]>([])
  const [isManualOverride, setIsManualOverride] = useState(false)
  const [managerNote, setManagerNote] = useState('')
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('pending')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const key: [string, string] = [record.source_type, record.source_id]

  useEffect(() => {
    async function loadDetails() {
      const r = await db.routingDecisions.get(key)
      const a = await db.analysisRecords.get(key)
      if (r) {
        setRouting(r)
        setSelectedRoutes(r.effective_routes)
        setIsManualOverride(r.is_manual_override)
        setManagerNote(r.manual_note || '')
        setReviewStatus(r.review_status)
      }
      if (a) {
        setAnalysis(a)
      }
    }
    loadDetails()
  }, [record.source_type, record.source_id])

  const handleToggleRoute = (route: RouteCategory) => {
    setIsManualOverride(true)
    if (selectedRoutes.includes(route)) {
      if (selectedRoutes.length > 1) {
        setSelectedRoutes(selectedRoutes.filter((r) => r !== route))
      }
    } else {
      setSelectedRoutes([...selectedRoutes, route])
    }
  }

  const handleResetToSuggested = () => {
    if (routing) {
      setSelectedRoutes(routing.suggested_routes)
      setIsManualOverride(false)
      setManagerNote('')
    }
  }

  const handleSave = async () => {
    if (!routing) return
    setIsSaving(true)

    const updatedRouting: RoutingDecision = {
      ...routing,
      effective_routes: selectedRoutes,
      is_manual_override: isManualOverride,
      manual_routes: isManualOverride ? selectedRoutes : null,
      manual_note: isManualOverride ? managerNote : null,
      manual_override_at: isManualOverride ? new Date().toISOString() : routing.manual_override_at,
      routing_method: isManualOverride ? 'manual-override' : 'suggested',
      review_status: reviewStatus,
      review_note: managerNote || routing.review_note,
      reviewed_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString(),
    }

    await db.routingDecisions.put(updatedRouting)

    await db.auditLogs.add({
      timestamp: new Date().toISOString(),
      action: isManualOverride ? 'route-manual-override' : 'route-accepted',
      source_type: record.source_type,
      source_id: record.source_id,
      record_ref: record.record_ref,
      details: isManualOverride
        ? `Manager manually assigned routes: [${selectedRoutes.join(', ')}] with note: "${managerNote}"`
        : `Manager saved review status: ${reviewStatus}`,
    })

    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
    onRecordUpdated()
  }

  const p: any = record.payload
  const isCall = record.source_type === 'call'
  const title = isCall ? `Call with ${p.to_number || 'Prospect'}` : p.title
  const person = isCall ? p.rep_name || p.rep_email : p.organizer_email
  const startTime = formatTimeIST(isCall ? p.started_at : p.starts_at)
  const duration = formatDuration(p.duration_seconds)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                {record.record_ref}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                {isCall ? <Phone className="w-3 h-3 text-slate-600" /> : <Video className="w-3 h-3 text-slate-600" />}
                {record.source_type.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Rev {record.applied_revision}
              </span>
              {routing?.is_manual_override && (
                <Badge variant="teal">Manual Override</Badge>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Representative / Organiser</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{person || 'Unspecified'}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Start Time (Asia/Kolkata)</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{startTime}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Duration</span>
              <span className="font-medium text-slate-900">{duration}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Source Identifier</span>
              <span className="font-mono text-[11px] text-slate-600 truncate block" title={record.source_id}>
                {record.source_id}
              </span>
            </div>
            {isCall && (
              <>
                <div>
                  <span className="text-slate-500 block mb-0.5">Connection Status</span>
                  <span className="font-medium text-slate-900">
                    {p.is_connected === true ? 'Connected' : p.is_connected === false ? 'Not Connected' : 'Unknown (null)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Observed Outcome</span>
                  <span className="font-medium text-slate-900">{p.observed_outcome || 'None'}</span>
                </div>
              </>
            )}
            {!isCall && (
              <>
                <div>
                  <span className="text-slate-500 block mb-0.5">Provider & Recording</span>
                  <span className="font-medium text-slate-900">{p.provider} &bull; {p.recording_status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Attendees</span>
                  <span className="font-medium text-slate-900">{p.attendee_count ?? 'Unknown'} attendee(s)</span>
                </div>
              </>
            )}
          </div>

          {/* Evidence-Backed Conversation Intelligence */}
          {analysis ? (
            <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-2">
                <div className="flex items-center gap-1.5 text-teal-900 font-semibold text-xs tracking-wide uppercase">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Evidence-Backed Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.freshness === 'current' ? 'success' : 'warning'}>
                    {analysis.freshness.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-slate-500 font-mono">
                    (Analysis Rev {analysis.analysis_source_revision})
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Finding Summary</h4>
                <p className="text-xs text-slate-900 leading-relaxed">{analysis.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Business Significance</h4>
                <p className="text-xs text-slate-800 leading-relaxed">{analysis.why_it_matters}</p>
              </div>

              {/* Supporting Passages */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-teal-600" />
                  <span>Direct Conversation Evidence</span>
                </h4>
                <div className="space-y-2">
                  {analysis.evidence_passages.map((ev, idx) => (
                    <blockquote
                      key={idx}
                      className="p-2.5 bg-white rounded-lg border border-teal-200 text-xs text-slate-900 italic shadow-xs"
                    >
                      {ev.type === 'call-quote' ? (
                        <>
                          "{ev.quote}"
                          <span className="block not-italic text-[10px] text-slate-400 mt-1 font-mono">
                            — Verbatim Call Transcript Quote
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold not-italic text-teal-800">
                            Turn #{ev.turn_number} [{ev.timecode}] {ev.speaker}:{' '}
                          </span>
                          "{ev.text}"
                        </>
                      )}
                    </blockquote>
                  ))}
                </div>
              </div>

              {/* Next Action & Action Owner */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-teal-200/60">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-0.5">Next Action</h4>
                  <p className="text-xs text-slate-900 font-medium">{analysis.next_action}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-0.5">Action Owner</h4>
                  <p className="text-xs text-slate-900 font-medium">{analysis.action_owner || 'Unassigned'}</p>
                </div>
              </div>

              {/* Explicit Uncertainties */}
              {analysis.uncertainties && analysis.uncertainties.length > 0 && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold mb-1 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Explicit Uncertainties (What Cannot Be Concluded)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900/90">
                    {analysis.uncertainties.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block">No Conversation Intelligence Available</span>
              <p>
                This record does not have a usable conversation transcript.
                {record.source_type === 'meeting' && record.transcript_payload?.unavailable_reason && (
                  <span className="block mt-1 font-medium text-slate-700">
                    Reason: {record.transcript_payload.unavailable_reason}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Routing & Review Controls */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-slate-600" />
                <span>Multi-Route Governance</span>
              </div>
              {isManualOverride && (
                <button
                  onClick={handleResetToSuggested}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Revert to automated suggestion"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Suggested</span>
                </button>
              )}
            </div>

            {/* Suggested vs Effective Comparison */}
            <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-24 shrink-0">Automated Route:</span>
                <div className="flex flex-wrap gap-1">
                  {routing?.suggested_routes.map((r) => (
                    <span key={r} className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getRouteBadgeColor(r)}`}>
                      {getRouteLabel(r)}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic pl-26">
                Rationale: {routing?.suggestion_rationale}
              </p>
            </div>

            {/* Multi-route selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Effective Destination Categories (Select all that apply)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ALL_ROUTE_CATEGORIES.map((cat) => {
                  const isChecked = selectedRoutes.includes(cat.id)
                  return (
                    <label
                      key={cat.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-teal-500 bg-teal-50/40 text-slate-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRoute(cat.id)}
                        className="mt-0.5 text-teal-600 focus:ring-teal-500 rounded border-slate-300"
                      />
                      <div>
                        <span className="font-semibold block">{cat.label}</span>
                        <span className="text-[11px] text-slate-500">{cat.desc}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Review Status & Manager Notes */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Manager Review State
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => {
                    setReviewStatus(e.target.value as ReviewStatus)
                    setIsManualOverride(true)
                  }}
                  className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Reviewed & Verified</option>
                  <option value="needs-attention">Needs Manager Attention</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Manager Override Note
                </label>
                <input
                  type="text"
                  value={managerNote}
                  onChange={(e) => {
                    setManagerNote(e.target.value)
                    setIsManualOverride(true)
                  }}
                  placeholder="Reason for manual assignment..."
                  className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                {isManualOverride ? 'Manual change pending save' : 'Using automated classification'}
              </span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saved to Dexie!</span>
                  </>
                ) : (
                  <span>Save Routing Changes</span>
                )}
              </button>
            </div>
          </div>

          {/* Raw Conversation Viewer */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Source Conversation Content ({isCall ? 'Audio Transcript' : 'Meeting Turns'})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {record.has_usable_text ? 'Usable text present' : 'No text available'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 max-h-96 overflow-y-auto text-xs font-mono leading-relaxed">
              {isCall ? (
                p.transcript ? (
                  <pre className="whitespace-pre-wrap font-sans text-slate-800">{p.transcript}</pre>
                ) : (
                  <div className="text-slate-500 italic">No transcript recorded for this call.</div>
                )
              ) : (
                (() => {
                  const turns = record.transcript_payload?.turns || []
                  if (turns.length === 0) {
                    return (
                      <div className="text-slate-500 italic">
                        {record.transcript_payload?.unavailable_reason || 'No transcript turns recorded for this meeting.'}
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-3 font-sans">
                      {turns.map((turn, i) => (
                        <div key={i} className="p-2 rounded bg-white border border-slate-200 shadow-2xs">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span className="font-semibold text-teal-800">Turn #{i + 1} &bull; {turn.speaker}</span>
                            <span className="font-mono text-slate-400">{turn.timecode}</span>
                          </div>
                          <p className="text-xs text-slate-900">{turn.text}</p>
                        </div>
                      ))}
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
