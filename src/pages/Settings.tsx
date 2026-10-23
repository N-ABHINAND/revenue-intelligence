import React from 'react'
import {
  HelpCircle,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  BookOpen,
} from 'lucide-react'

export function Settings() {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Metric Definitions, Methodology & Disclosures
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Formal definitions of all dashboard formulas, source constraints, three key conversation findings, and the
          rationale for deliberately rejected design choices.
        </p>
      </div>

      {/* Section 1: Strict Metric Definitions */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <BookOpen className="w-4 h-4 text-teal-600" />
          <h2>1. Metric Formulas & Methodology Disclosures</h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Metric A */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h3 className="font-bold text-slate-900">Unique Source Records (Count: 44)</h3>
            <p className="text-slate-600">
              <strong>Numerator:</strong> Count of unique composite primary keys <code>(source_type, source_id)</code> in the currently applied dataset.
            </p>
            <p className="text-slate-600">
              <strong>Denominator:</strong> N/A (absolute unique logical count).
            </p>
            <p className="text-slate-600">
              <strong>Time Period:</strong> 21 August 2026 (Asia/Kolkata).
            </p>
            <p className="text-slate-500 italic">
              <strong>Limitation:</strong> Repeated envelope imports do not increment this count. Revision 2 updates replace revision 1 payloads without duplicating records.
            </p>
          </div>

          {/* Metric B */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h3 className="font-bold text-slate-900">Usable Transcript Coverage (17 / 44 &rarr; 18 / 44 after update)</h3>
            <p className="text-slate-600">
              <strong>Numerator:</strong> Records where <code>transcript</code> (calls) is a non-empty string OR <code>transcript_payload.turns</code> (meetings) has length &gt; 0.
            </p>
            <p className="text-slate-600">
              <strong>Denominator:</strong> Total unique logical records (44).
            </p>
            <p className="text-slate-500 italic">
              <strong>Limitation:</strong> Missing transcripts do NOT indicate a call or meeting did not occur. Zero-turn meetings (e.g. M05, M08, M11) reflect recordings where nobody spoke.
            </p>
          </div>

          {/* Metric C */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h3 className="font-bold text-slate-900">Source-Reported Call Connection Rate</h3>
            <p className="text-slate-600">
              <strong>Numerator:</strong> Calls where <code>is_connected === true</code>.
            </p>
            <p className="text-slate-600">
              <strong>Denominator:</strong> Calls with a non-null boolean value (<code>is_connected !== null</code>).
            </p>
            <p className="text-slate-500 italic">
              <strong>Limitation:</strong> Calls reporting <code>null</code> for <code>is_connected</code> are strictly excluded from the connection rate denominator and displayed separately as unknown.
            </p>
          </div>

          {/* Metric D */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <h3 className="font-bold text-slate-900">Call Representatives vs Meeting Organisers</h3>
            <p className="text-slate-600">
              Call reps (<code>rep_name</code>, <code>rep_email</code>) represent telephonic outbound dialers. Meeting organisers (<code>organizer_email</code>) represent calendar booking owners.
            </p>
            <p className="text-slate-500 italic">
              <strong>Limitation:</strong> The system does not assume calendar organisers attended or sold the product. Salesperson leaderboards are deliberately omitted.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Three Key Conversation Findings */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Award className="w-4 h-4 text-purple-600" />
          <h2>2. Three Most Important Findings (with Passages & Product Influence)</h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Finding 1 */}
          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950">
                Finding 1: Cold Call Resistance with Latent Curiosity (Record C01)
              </span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-mono text-[10px]">C01</span>
            </div>
            <blockquote className="p-2.5 bg-white rounded border border-purple-200 text-slate-700 italic">
              "I didn't ask for this call, and I'm not interested... just briefly, what does your company actually do?"
            </blockquote>
            <p className="text-slate-700">
              <strong>Evidence Analysis:</strong> The prospect led with a standard cold-call brush-off, but immediately followed with an unprompted question about company capabilities.
            </p>
            <p className="text-slate-900 font-medium">
              <strong>Exact Product Influence:</strong> Influenced the <em>Sales Coaching</em> multi-route classification and prompted creation of the objection-handling coaching review card on both the Dashboard and Routing Review screen.
            </p>
          </div>

          {/* Finding 2 */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950">
                Finding 2: High-Intent Technical API Qualification with Concrete Next Step (Record C03)
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px]">C03</span>
            </div>
            <blockquote className="p-2.5 bg-white rounded border border-emerald-200 text-slate-700 italic">
              "Could we do this by email? Or call on Monday... Something like 'Developer access and event notifications — follow-up'"
            </blockquote>
            <p className="text-slate-700">
              <strong>Evidence Analysis:</strong> Technical lead explicitly requested webhook and developer API access for ERP synchronization and volunteered a concrete Monday calendar appointment.
            </p>
            <p className="text-slate-900 font-medium">
              <strong>Exact Product Influence:</strong> Influenced deterministic routing to <em>Deal Follow-up</em> and elevated the record into the Dashboard's High-Priority Follow-up Recommendations widget.
            </p>
          </div>

          {/* Finding 3 */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950">
                Finding 3: Reseller / Consultancy Channel Intent vs Direct Deal (Record C07)
              </span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono text-[10px]">C07</span>
            </div>
            <blockquote className="p-2.5 bg-white rounded border border-amber-200 text-slate-700 italic">
              "I wanted to ask about a possible partnership... Send whatever proposal you have... could I call on Monday to see whether you'd like to discuss it further?"
            </blockquote>
            <p className="text-slate-700">
              <strong>Evidence Analysis:</strong> The contact is an IT consultancy seeking reseller distribution to their client base, not an end-user buyer.
            </p>
            <p className="text-slate-900 font-medium">
              <strong>Exact Product Influence:</strong> Dictated creation of the dedicated <em>Partnership / Channel</em> route category, preventing channel inquiries from polluting direct sales pipeline quotas.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: One Deliberately Rejected Decision */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h2>3. Deliberately Rejected Design Decision</h2>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
          <div className="font-bold text-slate-900 text-sm">
            Rejected Feature: "Sales Representative Performance Leaderboard & Conversion Ranking"
          </div>

          <div>
            <span className="font-semibold text-slate-700">Why was it considered?</span>
            <p className="text-slate-600 mt-0.5">
              Sales management tools frequently include representative leaderboards showing connected call conversion rates, deal pipeline totals, and rep rankings.
            </p>
          </div>

          <div>
            <span className="font-semibold text-slate-700">Why was it deliberately rejected?</span>
            <p className="text-slate-600 mt-0.5 leading-relaxed">
              The provided dataset is an explicitly selected sample of 44 records (including 20 background calls lacking transcripts). Ranking individual reps on a partial extract would produce distorted, misleading, and potentially punitive evaluations. Furthermore, meeting organisers cannot be conflated with meeting attendees or closing reps.
            </p>
          </div>

          <div>
            <span className="font-semibold text-teal-800">Accepted Product Trade-Off:</span>
            <p className="text-slate-800 mt-0.5 leading-relaxed">
              We replaced competitive leaderboards with non-judgmental <strong>Activity Breakdown Cards</strong> that strictly distinguish call reps from meeting organisers, report raw conversation counts, and display a prominent disclaimer that the data represents an activity sample rather than team performance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Project Scope & Disclosures */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <h2>4. Project Scope, Hours & Known Limitations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
          <div className="space-y-1">
            <strong>Approximate Hours Spent:</strong>
            <p>14 engineering hours across data modeling, import engine development, Vitest replay testing, dashboard UI, and export generation.</p>
          </div>

          <div className="space-y-1">
            <strong>Storage Model:</strong>
            <p>Local IndexedDB via Dexie. Local to each reviewer's browser. Clean replay controls provided to reload or reset dataset instantly.</p>
          </div>

          <div className="space-y-1">
            <strong>AI & Pre-Generated Content:</strong>
            <p>All 18 conversation analyses are pre-generated from verbatim quotes. Stale-analysis detection flags any records whose underlying transcript changes.</p>
          </div>

          <div className="space-y-1">
            <strong>Timezone:</strong>
            <p>All timestamps are strictly presented in <code>Asia/Kolkata (IST)</code> according to DATA_CONTRACT.md.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
