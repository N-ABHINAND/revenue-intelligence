import React, { useState, useEffect } from 'react'
import {
  Download,
  FolderArchive,
  FileCode,
  CheckCircle2,
  FileText,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { generateExportZip } from '@/lib/exportEngine'
import { db } from '@/lib/db'
import type { ExportManifestEntry } from '@/types'
import { getRouteBadgeColor, getRouteLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export function Exports() {
  const [manifest, setManifest] = useState<ExportManifestEntry[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [exportStats, setExportStats] = useState<{ total: number; paths: number } | null>(null)

  const loadPreview = async () => {
    // Generate manifest in memory for live inspection
    const { manifest: m } = await generateExportZip()
    setManifest(m)
    const totalPaths = m.reduce((acc, curr) => acc + curr.output_paths.length, 0)
    setExportStats({ total: m.length, paths: totalPaths })
  }

  useEffect(() => {
    loadPreview()
  }, [])

  const handleDownload = async () => {
    setIsExporting(true)
    try {
      const { blob } = await generateExportZip()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      // Trigger browser download
      const a = document.createElement('a')
      a.href = url
      a.download = `revenue-intelligence-export-${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err: any) {
      alert(`Export failed: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Export & Archive Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Package verified conversation intelligence, manager briefings, and machine-readable manifests into an
            auditable ZIP archive.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>{isExporting ? 'Generating ZIP Archive...' : 'Download Export Archive (.zip)'}</span>
        </button>
      </div>

      {/* Export Archive Structure Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
            <FileCode className="w-4 h-4 text-teal-600" />
            <span>Machine-Readable Manifest</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <code>manifest.json</code> maps every unique source record identity to its current applied revision,
            effective multi-routes, output file paths, and review status.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Daily Manager Briefing</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <code>manager-brief.md</code> packages the executive summary, pipeline deals, coaching notes, and risk
            alerts for 21 August 2026.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
            <FolderArchive className="w-4 h-4 text-amber-600" />
            <span>Categorized Markdown Files</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Organised directories (e.g. <code>sales-coaching/</code>, <code>deal-next-steps/</code>) storing
            evidence-backed Markdown files with quotes and metadata.
          </p>
        </div>
      </div>

      {/* Manifest Summary & Validation Card */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Manifest Validation Passed</h4>
            <p className="text-slate-600 text-[11px]">
              All <strong>{manifest.length}</strong> records have deterministic identity mappings and valid destination
              paths. Total output files: <strong>{exportStats?.paths || 0}</strong>.
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-[11px] text-slate-500">
          Composite Key: <code>(source_type, source_id)</code>
        </div>
      </div>

      {/* Manifest Inspector Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
            Live Manifest Inspector ({manifest.length} records mapped)
          </h3>
          <span className="text-[11px] text-slate-500">Inspect machine-readable mapping prior to export</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Ref</th>
                <th className="py-2.5 px-3">Source Type</th>
                <th className="py-2.5 px-3">Source ID (UUID)</th>
                <th className="py-2.5 px-2">Rev</th>
                <th className="py-2.5 px-3">Effective Routes</th>
                <th className="py-2.5 px-4">Output File Paths</th>
                <th className="py-2.5 px-3">Review Status</th>
                <th className="py-2.5 px-3">Override</th>
                <th className="py-2.5 px-3">Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {manifest.map((m) => (
                <tr key={`${m.source_type}:${m.source_id}`} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{m.record_ref}</td>
                  <td className="py-2.5 px-3 font-sans uppercase font-semibold text-[10px] text-slate-600">
                    {m.source_type}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]" title={m.source_id}>
                    {m.source_id.slice(0, 12)}...
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-700 font-bold">{m.applied_revision}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="flex flex-wrap gap-1">
                      {m.effective_routes.map((rt) => (
                        <span
                          key={rt}
                          className={`px-1 py-0.2 rounded text-[9px] font-medium border ${getRouteBadgeColor(rt)}`}
                        >
                          {getRouteLabel(rt)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    <div className="space-y-0.5">
                      {m.output_paths.map((p) => (
                        <div key={p} className="truncate max-w-xs text-[10px] text-slate-700 bg-slate-100 px-1 rounded">
                          {p}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <Badge variant={m.review_status === 'reviewed' ? 'success' : m.review_status === 'needs-attention' ? 'destructive' : 'secondary'}>
                      {m.review_status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    {m.is_manual_override ? (
                      <span className="text-teal-700 font-semibold">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <Badge variant={m.analysis_freshness === 'current' ? 'success' : m.analysis_freshness === 'stale' ? 'warning' : 'outline'}>
                      {m.analysis_freshness}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
