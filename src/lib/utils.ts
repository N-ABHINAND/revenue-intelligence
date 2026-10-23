import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeIST(isoString: string): string {
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  } catch {
    return isoString
  }
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || isNaN(seconds)) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}m ${secs.toString().padStart(2, '0')}s`
}

export function getRouteBadgeColor(route: string): string {
  switch (route) {
    case 'sales-coaching':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'deal-next-steps':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'customer-follow-up':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'partnership-follow-up':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'internal-vendor':
      return 'bg-slate-100 text-slate-800 border-slate-200'
    case 'human-review':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    case 'insufficient-evidence':
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function getRouteLabel(route: string): string {
  switch (route) {
    case 'sales-coaching':
      return 'Sales Coaching'
    case 'deal-next-steps':
      return 'Deal Follow-up'
    case 'customer-follow-up':
      return 'Customer Follow-up'
    case 'partnership-follow-up':
      return 'Partnership / Channel'
    case 'internal-vendor':
      return 'Internal / Vendor Notes'
    case 'human-review':
      return 'Human Review Needed'
    case 'insufficient-evidence':
      return 'Insufficient Evidence'
    default:
      return route
  }
}
