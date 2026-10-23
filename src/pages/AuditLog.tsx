import React, { useState, useEffect } from 'react'
import { History, Filter, ShieldAlert, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'
import type { AuditEntry } from '@/types'
import { formatTimeIST } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [actionFilter, setActionFilter] = useState<string>('all')

  const loadLogs = async () => {
    const all = await db.auditLogs.reverse().toArray()
    setLogs(all)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false
    return true
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'import-initial':
      case 'import-update':
        return <Badge variant="teal">{action}</Badge>
      case 'import-repeat':
        return <Badge variant="secondary">{action}</Badge>
      case 'route-manual-override':
        return <Badge variant="warning">{action}</Badge>
      case 'route-accepted':
      case 'review-status-change':
        return <Badge variant="success">{action}</Badge>
      case 'analysis-stale':
      case 'import-validation-error':
        return <Badge variant="destructive">{action}</Badge>
      case 'database-reset':
        return <Badge variant="outline">{action}</Badge>
      default:
        return <Badge variant="secondary">{action}</Badge>
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Trail & Compliance Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological record of all batch imports, deduplication events, manager routing overrides, and
            system operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="all">All Action Types ({logs.length})</option>
            <option value="import-initial">import-initial</option>
            <option value="import-update">import-update</option>
            <option value="import-repeat">import-repeat</option>
            <option value="route-manual-override">route-manual-override</option>
            <option value="route-accepted">route-accepted</option>
            <option value="analysis-stale">analysis-stale</option>
            <option value="export-generated">export-generated</option>
            <option value="database-reset">database-reset</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-3">Timestamp (Asia/Kolkata)</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Ref</th>
                <th className="py-3 px-6">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">#{log.id}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatTimeIST(log.timestamp)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-3 font-mono text-slate-800 font-bold whitespace-nowrap">
                      {log.record_ref || log.batch_id || '—'}
                    </td>
                    <td className="py-3 px-6 text-slate-700 leading-relaxed">{log.details}</td>
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
