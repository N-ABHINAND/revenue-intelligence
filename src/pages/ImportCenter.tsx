import React, { useState, useEffect } from 'react'
import {
  UploadCloud,
  FileUp,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react'
import { processDeliveryEnvelope, resetDatabase } from '@/lib/importEngine'
import { loadInitialBatch, loadUpdateBatch } from '@/data/demoDataLoader'
import { db } from '@/lib/db'
import type { ImportHistory, StoredRecord } from '@/types'
import { formatTimeIST } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export function ImportCenter() {
  const [history, setHistory] = useState<ImportHistory[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<any | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [currentRecordCount, setCurrentRecordCount] = useState<number>(0)
  const [currentUsableCount, setCurrentUsableCount] = useState<number>(0)

  const loadState = async () => {
    const hist = await db.importHistory.reverse().toArray()
    setHistory(hist)
    const recs = await db.sourceRecords.toArray()
    setCurrentRecordCount(recs.length)
    setCurrentUsableCount(recs.filter((r) => r.has_usable_text).length)
  }

  useEffect(() => {
    loadState()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setValidationErrors([])
    setLastResult(null)

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const res = await processDeliveryEnvelope(json)
      setLastResult(res)
      if (res.error_count > 0) {
        setValidationErrors(res.errors)
      }
      await loadState()
    } catch (err: any) {
      setValidationErrors([`Invalid JSON file format: ${err.message}`])
    } finally {
      setIsProcessing(false)
      e.target.value = ''
    }
  }

  const handleRunInitial = async () => {
    setIsProcessing(true)
    setValidationErrors([])
    try {
      const res = await loadInitialBatch()
      setLastResult(res)
      await loadState()
    } catch (err: any) {
      setValidationErrors([err.message])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRunUpdate = async () => {
    setIsProcessing(true)
    setValidationErrors([])
    try {
      const res = await loadUpdateBatch()
      setLastResult(res)
      await loadState()
    } catch (err: any) {
      setValidationErrors([err.message])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = async () => {
    if (confirm('Reset IndexedDB to completely clean state?')) {
      await resetDatabase()
      setLastResult(null)
      setValidationErrors([])
      await loadState()
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reliable Import & Update Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deduplication on stable source identity <code>(source_type, source_id)</code>, revision precedence, and
            preservation of manual manager corrections across updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database to Clean State</span>
          </button>
        </div>
      </div>

      {/* Current DB State Strip */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Current IndexedDB Storage State</div>
            <div className="text-xs text-slate-500">
              <strong className="text-slate-900">{currentRecordCount}</strong> unique source records &bull;{' '}
              <strong className="text-teal-700">{currentUsableCount}</strong> with usable text
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunInitial}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileUp className="w-3.5 h-3.5 text-teal-400" />
            <span>Load 01_initial.json</span>
          </button>

          <button
            onClick={handleRunUpdate}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply 02_update.json (Rev 2)</span>
          </button>
        </div>
      </div>

      {/* Upload Drag & Drop Box */}
      <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 transition-colors text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-900">Upload Delivery Envelope JSON</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Drag and drop any delivery envelope JSON here to test validation, duplicate suppression, or revision precedence.
          </p>
        </div>
        <div>
          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer transition-colors">
            <span>Select File from Disk</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Last Result & Validation Feedback */}
      {lastResult && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-xs text-slate-900">
              Import Result: Batch <code>{lastResult.batch_id}</code> (Revision {lastResult.revision})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Total Envelope Records: {lastResult.total_records}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-xl font-extrabold text-emerald-700">{lastResult.new_count}</span>
              <span className="text-xs text-emerald-800 block font-medium">New Records</span>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
              <span className="text-xl font-extrabold text-teal-700">{lastResult.updated_count}</span>
              <span className="text-xs text-teal-800 block font-medium">Updated Records</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xl font-extrabold text-slate-700">{lastResult.unchanged_count}</span>
              <span className="text-xs text-slate-700 block font-medium">Unchanged (Deduplicated)</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-xl font-extrabold text-amber-700">{lastResult.ignored_count}</span>
              <span className="text-xs text-amber-800 block font-medium">Ignored (Stale Revisions)</span>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-900">
          <div className="flex items-center gap-2 font-bold text-rose-800">
            <AlertTriangle className="w-4 h-4" />
            <span>Validation Errors Detected</span>
          </div>
          <ul className="list-disc list-inside space-y-1 font-mono text-[11px]">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Replay Verification Walkthrough */}
      <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h3 className="font-bold text-sm text-white">Replay Contract Verification Walkthrough</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Follow these deterministic steps to verify the data contract and audit replay requirements:
        </p>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-white">Clean State:</strong> Click <em>Reset Database</em>. Database tables clear completely.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-white">Initial Ingestion:</strong> Click <em>Load 01_initial.json</em>. Verify 44 total records (30 calls, 14 meetings) and 17 usable texts.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-white">Deduplication Check:</strong> Click <em>Load 01_initial.json</em> a second time. Verify 0 new records, 44 unchanged. Total remains 44.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
              4
            </span>
            <div>
              <strong className="text-white">Manager Override:</strong> Go to Conversation Inbox, open record M07, manually assign it to <em>Partnership / Channel</em>, and save.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
              5
            </span>
            <div>
              <strong className="text-white">Update & Override Preservation:</strong> Click <em>Apply 02_update.json</em>. Record count stays 44, usable texts increase to 18, M07 receives its transcript, and your manual route override remains preserved!
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0 mt-0.5">
              6
            </span>
            <div>
              <strong className="text-white">Downgrade Rejection:</strong> Click <em>Load 01_initial.json</em> again. Revision 1 data is ignored because revision 2 takes precedence.
            </div>
          </div>
        </div>
      </div>

      {/* Batch Import History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span>Import Envelope History</span>
          </h3>
          <span className="text-[11px] text-slate-500">{history.length} batches processed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Batch ID</th>
                <th className="py-2.5 px-3">Revision</th>
                <th className="py-2.5 px-3">Imported At (IST)</th>
                <th className="py-2.5 px-3">New</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-3">Unchanged</th>
                <th className="py-2.5 px-3">Ignored</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 font-sans text-xs">
                    No import history logged yet.
                  </td>
                </tr>
              ) : (
                history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-bold text-slate-900 font-sans">{h.batch_id}</td>
                    <td className="py-2.5 px-3 font-bold text-teal-700">Rev {h.revision}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-sans">{formatTimeIST(h.imported_at)}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{h.new_count}</td>
                    <td className="py-2.5 px-3 text-teal-700 font-bold">{h.updated_count}</td>
                    <td className="py-2.5 px-3 text-slate-500">{h.unchanged_count}</td>
                    <td className="py-2.5 px-3 text-amber-700">{h.ignored_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
