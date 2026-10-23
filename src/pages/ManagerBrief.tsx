import React, { useState, useEffect } from 'react'
import {
  FileText,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Quote,
} from 'lucide-react'
import { db } from '@/lib/db'
import type { StoredRecord, AnalysisRecord } from '@/types'
import { RecordDetailDrawer } from '@/components/RecordDetailDrawer'

export function ManagerBrief() {
  const [records, setRecords] = useState<StoredRecord[]>([])
  const [analyses, setAnalyses] = useState<Map<string, AnalysisRecord>>(new Map())
  const [selectedRecord, setSelectedRecord] = useState<StoredRecord | null>(null)

  const loadData = async () => {
    const recs = await db.sourceRecords.toArray()
    const anals = await db.analysisRecords.toArray()
    setRecords(recs)
    setAnalyses(new Map(anals.map((a) => [`${a.source_type}:${a.source_id}`, a])))
  }

  useEffect(() => {
    loadData()
  }, [])

  const findRecordByRef = (ref: string) => {
    return records.find((r) => r.record_ref === ref) || null
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs font-semibold rounded">
            Executive Intelligence
          </span>
          <span className="text-xs text-slate-500 font-mono">21 August 2026 &bull; Asia/Kolkata</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Manager Daily Brief</h1>
        <p className="text-xs text-slate-500 mt-1">
          Evidence-driven executive summary synthesized from verified call transcripts and meeting notes.
          Every highlight links directly to supporting conversation passages.
        </p>
      </div>

      {/* Transparency Banner */}
      <div className="p-3 bg-slate-900 text-white rounded-xl flex items-start gap-3 shadow-sm text-xs">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-teal-400">Pre-Generated Content Disclosure:</strong> The findings and
          recommendations below represent pre-generated analysis produced against the 21 August 2026 source batch.
          When late-arriving transcripts (such as M07) arrive in subsequent deliveries, analysis freshness is
          flagged for manager verification.
        </div>
      </div>

      {/* Section 1: Executive Summary */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <h2>1. Executive Summary & Pipeline Momentum</h2>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Activity for 21 August 2026 encompassed <strong>44 unique source conversations</strong> (30 outbound
          calls, 14 scheduled meetings). Usable conversation text is available for 17 initial records (10 calls, 7
          meetings), expanding to 18 after applying the M07 update batch.
        </p>
        <p className="text-xs text-slate-700 leading-relaxed">
          Primary buyer themes across qualified conversations focus on <strong>prepaid vs corporate credit line
          clarification</strong>, <strong>automated ERP/accounting sync</strong> (Tally & direct feeds), and
          <strong>statutory expense receipt governance</strong>. High commercial intent was verified across multiple
          accounts requiring immediate follow-up.
        </p>
      </section>

      {/* Section 2: Top Commercial Opportunities */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h2>2. High-Priority Deal Opportunities (Direct Follow-up Required)</h2>
        </div>

        <div className="space-y-3">
          {/* C03 */}
          <div
            onClick={() => setSelectedRecord(findRecordByRef('C03'))}
            className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded font-mono text-[11px]">C03</span>
                API Webhook Integration & Monday Follow-up Call
              </span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-0.5">
                Inspect <ExternalLink className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs text-slate-700 mb-2">
              Technical lead expressed direct buying intent for automated webhook notifications into their internal
              backend. Agreed to Monday call if developer specs are emailed beforehand.
            </p>
            <blockquote className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-600 italic">
              "Could we do this by email? Or call on Monday... Something like 'Developer access and event notifications
              — follow-up'"
            </blockquote>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              <strong>Action:</strong> Dispatch API sandbox access and confirm Monday 11:00 AM calendar invite &bull;
              <strong> Owner:</strong> Kiran Rao (Call Rep)
            </div>
          </div>

          {/* C06 */}
          <div
            onClick={() => setSelectedRecord(findRecordByRef('C06'))}
            className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded font-mono text-[11px]">C06</span>
                25 Field Sales Corporate Cards Requirement
              </span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-0.5">
                Inspect <ExternalLink className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs text-slate-700 mb-2">
              Prospect evaluating corporate prepaid cards for 25 traveling sales reps currently frustrated by
              reimbursement delays.
            </p>
            <blockquote className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-600 italic">
              "We have 25 sales reps travelling across western region. They are currently paying out of pocket and
              complaining about reimbursement lag."
            </blockquote>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              <strong>Action:</strong> Send tiered card proposal for 25 users &bull;
              <strong> Owner:</strong> Kiran Rao (Call Rep)
            </div>
          </div>

          {/* M03 */}
          <div
            onClick={() => setSelectedRecord(findRecordByRef('M03'))}
            className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded font-mono text-[11px]">M03</span>
                Asterloom Systems — Prepaid vs Credit Fee Alignment
              </span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-0.5">
                Inspect <ExternalLink className="w-3 h-3" />
              </span>
            </div>
            <p className="text-xs text-slate-700 mb-2">
              Monthly spend of INR 10–13 lakh. Customer clarified pricing difference (INR 26k annual subscription +
              INR 13k one-time setup). Proposal now goes to CFO for financial approval.
            </p>
            <blockquote className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-600 italic">
              Turn #22 Customer A: "But you previously told me INR 26,000. Why has that become INR 39,000?"
            </blockquote>
            <div className="mt-2 text-[11px] text-slate-500 font-medium">
              <strong>Action:</strong> Provide formal proposal breaking down recurring vs one-time setup charge &bull;
              <strong> Owner:</strong> Sales Lead
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Coaching Priorities */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <UserCheck className="w-4 h-4 text-purple-600" />
          <h2>3. Sales Coaching & Methodology Observations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* C01 Coaching */}
          <div
            onClick={() => setSelectedRecord(findRecordByRef('C01'))}
            className="p-3.5 bg-purple-50/40 rounded-lg border border-purple-200 hover:border-purple-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-purple-900 text-white rounded font-mono text-[10px]">C01</span>
                Cold Outreach Resistance Hook
              </span>
              <ExternalLink className="w-3 h-3 text-purple-700" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Prospect initially pushed back strongly ("I didn't ask for this call") but gave an opening ("just
              briefly, what does your company actually do?"). Rep should be coached on a concise 10-second elevator
              hook rather than jumping to schedule calls immediately.
            </p>
          </div>

          {/* M02 Coaching */}
          <div
            onClick={() => setSelectedRecord(findRecordByRef('M02'))}
            className="p-3.5 bg-purple-50/40 rounded-lg border border-purple-200 hover:border-purple-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-purple-950 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-purple-900 text-white rounded font-mono text-[10px]">M02</span>
                Buyer Procurement Governance Respect
              </span>
              <ExternalLink className="w-3 h-3 text-purple-700" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Prospect explained their standard 4-step buying sequence requires written pricing before management
              calls. The rep repeatedly pushed for a live proposal walkthrough, causing friction. Coach reps on
              accommodating buyer procurement governance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Churn & Support Risks */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h2>4. Customer Escalations & Onboarding Blockers</h2>
        </div>

        <div className="space-y-3">
          {/* C05 */}
          <div
            onClick={() => setSelectedRecord(findRecordByRef('C05'))}
            className="p-3.5 bg-rose-50/40 rounded-lg border border-rose-200 hover:border-rose-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-rose-900 text-white rounded font-mono text-[10px]">C05</span>
                Disputed INR 13,000 Setup Fee Line Item
              </span>
              <ExternalLink className="w-3 h-3 text-rose-700" />
            </div>
            <p className="text-xs text-slate-700 mb-2">
              Existing customer called frustrated over unexpected INR 13,000 setup charge they claimed was promised to
              be waived. Demanded manager callback immediately.
            </p>
            <div className="text-[11px] text-rose-900 font-semibold">
              Urgency: Same-day manager callback to audit deal notes and issue credit note if promised.
            </div>
          </div>

          {/* M09 */}
          <div
            onClick={() => setSelectedRecord(findRecordByRef('M09'))}
            className="p-3.5 bg-rose-50/40 rounded-lg border border-rose-200 hover:border-rose-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-rose-900 text-white rounded font-mono text-[10px]">M09</span>
                Brookmint Holdings Expired Reset Token & Shared Mailbox Permissions
              </span>
              <ExternalLink className="w-3 h-3 text-rose-700" />
            </div>
            <p className="text-xs text-slate-700 mb-2">
              Customer unable to access Brookmint account because reset token expired immediately upon arrival. Also
              concerned about AP clerk gaining admin rights via shared accounts mailbox.
            </p>
            <div className="text-[11px] text-rose-900 font-semibold">
              Urgency: Technical support must resolve token expiry bug and guide separate admin role setup.
            </div>
          </div>
        </div>
      </section>

      {/* Detail Drawer */}
      <RecordDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onRecordUpdated={loadData}
      />
    </div>
  )
}
