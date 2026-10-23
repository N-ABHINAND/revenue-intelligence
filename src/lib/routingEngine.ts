import type { RouteCategory, StoredRecord } from '@/types'
import { getPreGeneratedAnalysis } from '@/data/preGeneratedAnalysis'

export interface RoutingResult {
  suggested_routes: RouteCategory[]
  rationale: string
}

export function determineRoutes(record: StoredRecord): RoutingResult {
  // 1. Check if we have pre-generated analysis
  const preGen = getPreGeneratedAnalysis(record.source_type, record.source_id, record.applied_revision)
  if (preGen && preGen.suggested_routes.length > 0) {
    return {
      suggested_routes: preGen.suggested_routes,
      rationale: preGen.route_rationale,
    }
  }

  // 2. Check for usable text
  if (!record.has_usable_text) {
    let reasonDetail = 'No conversation transcript available in source payload.'
    if (record.source_type === 'meeting' && record.transcript_payload?.unavailable_reason) {
      reasonDetail = record.transcript_payload.unavailable_reason
    }
    return {
      suggested_routes: ['insufficient-evidence'],
      rationale: `Cannot classify business intent without conversation evidence (${reasonDetail}). Preserving unknown outcome.`,
    }
  }

  // 3. Fallback deterministic keyword detection if custom text is imported
  const text = extractText(record)
  const routes: RouteCategory[] = []
  const rationaleParts: string[] = []

  const lower = text.toLowerCase()

  if (lower.includes('partner') || lower.includes('reseller') || lower.includes('channel')) {
    routes.push('partnership-follow-up')
    rationaleParts.push('Detected partnership / channel distribution intent')
  }

  if (lower.includes('complaint') || lower.includes('ticket') || lower.includes('bug') || lower.includes('token expired') || lower.includes('support')) {
    routes.push('customer-follow-up')
    rationaleParts.push('Detected post-sale support or onboarding issue')
  }

  if (lower.includes('quote') || lower.includes('proposal') || lower.includes('pricing') || lower.includes('demo') || lower.includes('contract')) {
    routes.push('deal-next-steps')
    rationaleParts.push('Detected active commercial evaluation or proposal request')
  }

  if (lower.includes('internal') || lower.includes('training') || lower.includes('walkthrough') || lower.includes('back-office')) {
    routes.push('internal-vendor')
    rationaleParts.push('Detected internal knowledge transfer or operational walkthrough')
  }

  if (lower.includes('objection') || lower.includes('gatekeeper') || lower.includes('not interested') || lower.includes('resistance')) {
    routes.push('sales-coaching')
    rationaleParts.push('Identified coaching opportunity on objection handling')
  }

  if (routes.length === 0) {
    routes.push('human-review')
    rationaleParts.push('Ambiguous conversation intent requires manager inspection')
  }

  return {
    suggested_routes: routes,
    rationale: rationaleParts.join('; '),
  }
}

function extractText(record: StoredRecord): string {
  if (record.source_type === 'call') {
    return (record.payload as any).transcript || ''
  } else {
    const turns = record.transcript_payload?.turns || []
    return turns.map((t) => t.text).join(' ')
  }
}
