import { processDeliveryEnvelope, type ImportResult } from '@/lib/importEngine'

export async function loadInitialBatch(): Promise<ImportResult> {
  const response = await fetch('/data/01_initial.json')
  if (!response.ok) {
    throw new Error(`Failed to load initial batch: HTTP ${response.status}`)
  }
  const json = await response.json()
  return await processDeliveryEnvelope(json)
}

export async function loadUpdateBatch(): Promise<ImportResult> {
  const response = await fetch('/data/02_update.json')
  if (!response.ok) {
    throw new Error(`Failed to load update batch: HTTP ${response.status}`)
  }
  const json = await response.json()
  return await processDeliveryEnvelope(json)
}
