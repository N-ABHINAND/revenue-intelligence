import React from 'react'
import { RotateCcw, Upload, FileUp, Sparkles, CheckCircle2 } from 'lucide-react'
import { loadInitialBatch, loadUpdateBatch } from '@/data/demoDataLoader'
import { resetDatabase } from '@/lib/importEngine'

interface NavbarProps {
  totalRecords: number
  usableCount: number
  onDataChanged: () => void
}

export function Navbar({ totalRecords, usableCount, onDataChanged }: NavbarProps) {
  const [loading, setLoading] = React.useState<string | null>(null)
  const [banner, setBanner] = React.useState<string | null>(null)

  const showBanner = (msg: string) => {
    setBanner(msg)
    setTimeout(() => setBanner(null), 4000)
  }

  const handleLoadInitial = async () => {
    setLoading('initial')
    try {
      const res = await loadInitialBatch()
      showBanner(`Initial delivery loaded: ${res.new_count} new, ${res.unchanged_count} unchanged`)
      onDataChanged()
    } catch (err: any) {
      alert(`Error loading initial batch: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleLoadUpdate = async () => {
    setLoading('update')
    try {
      const res = await loadUpdateBatch()
      showBanner(`Update batch applied: ${res.updated_count} updated (M07 rev 2)`)
      onDataChanged()
    } catch (err: any) {
      alert(`Error loading update batch: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleReset = async () => {
    if (confirm('Reset IndexedDB to empty state? You can re-import batches immediately.')) {
      setLoading('reset')
      await resetDatabase()
      showBanner('Database reset to clean state.')
      onDataChanged()
      setLoading(null)
    }
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Status indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-800">Local IndexedDB</span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="text-xs text-slate-600">
          <strong className="text-slate-900">{totalRecords}</strong> unique records &bull;{' '}
          <strong className="text-teal-700">{usableCount}</strong> with usable text
          {totalRecords === 44 && usableCount === 17 && (
            <span className="ml-1 text-[11px] text-amber-600 font-medium">(Initial batch state)</span>
          )}
          {totalRecords === 44 && usableCount === 18 && (
            <span className="ml-1 text-[11px] text-emerald-600 font-medium">(Update batch applied &bull; M07 usable)</span>
          )}
        </div>

        {banner && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200 transition-all">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{banner}</span>
          </div>
        )}
      </div>

      {/* Demo & Replay Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLoadInitial}
          disabled={loading !== null}
          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Import 01_initial.json delivery envelope (44 records, 17 with text)"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Load Initial (01)</span>
        </button>

        <button
          onClick={handleLoadUpdate}
          disabled={loading !== null}
          className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Import 02_update.json revision 2 (updates M07 with usable transcript)"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Apply Update (02)</span>
        </button>

        <button
          onClick={handleReset}
          disabled={loading !== null}
          className="px-2.5 py-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-700 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Clear all stored data from IndexedDB"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  )
}
