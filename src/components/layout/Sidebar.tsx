import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  GitBranch,
  FileText,
  Download,
  UploadCloud,
  History,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  totalRecords: number
  needsReviewCount: number
  staleCount: number
}

export function Sidebar({ totalRecords, needsReviewCount, staleCount }: SidebarProps) {
  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/inbox',
      label: 'Conversation Inbox',
      icon: Inbox,
      badge: totalRecords > 0 ? totalRecords : null,
    },
    {
      to: '/routing',
      label: 'Routing & Review',
      icon: GitBranch,
      badge: needsReviewCount > 0 ? needsReviewCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      to: '/brief',
      label: 'Manager Brief',
      icon: FileText,
      badge: '21 Aug',
      badgeColor: 'bg-teal-600 text-white',
    },
    {
      to: '/exports',
      label: 'Exports & Manifest',
      icon: Download,
      badge: null,
    },
    {
      to: '/import',
      label: 'Import Center',
      icon: UploadCloud,
      badge: staleCount > 0 ? `${staleCount} stale` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      to: '/audit',
      label: 'Audit Log',
      icon: History,
      badge: null,
    },
    {
      to: '/settings',
      label: 'Definitions & Rules',
      icon: SettingsIcon,
      badge: null,
    },
  ]

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md shadow-teal-500/20">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-white tracking-wide">Revenue Intelligence</h1>
            <p className="text-xs text-slate-400">SpendNest Inbox</p>
          </div>
        </div>

        <div className="mt-3 px-2 py-1 bg-slate-800/60 rounded border border-slate-700/60 text-[11px] text-slate-300 flex items-center justify-between">
          <span className="text-slate-400">Reporting Day</span>
          <span className="font-mono text-teal-400 font-medium">21 Aug 2026 (IST)</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
          Core Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Human Controlled Governance indicator */}
      <div className="p-4 border-t border-slate-800 text-xs">
        <div className="bg-slate-800/70 rounded-lg p-2.5 border border-slate-700/80">
          <div className="flex items-center gap-1.5 text-teal-400 font-medium mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Evidence First</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All routes require transcript quotes. Manager decisions override AI recommendations deterministically.
          </p>
        </div>
      </div>
    </aside>
  )
}
