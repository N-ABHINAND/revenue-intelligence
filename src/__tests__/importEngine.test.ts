import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '@/lib/db'
import { processDeliveryEnvelope, resetDatabase } from '@/lib/importEngine'
import fs from 'fs'
import path from 'path'

describe('Revenue Intelligence Inbox — Import Engine & Data Contract', () => {
  const initialJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../data/01_initial.json'), 'utf-8')
  )
  const updateJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../data/02_update.json'), 'utf-8')
  )

  beforeEach(async () => {
    await resetDatabase()
  })

  it('1. Imports 01_initial.json: 44 unique records, 30 calls, 14 meetings, 17 usable texts', async () => {
    const res = await processDeliveryEnvelope(initialJson)

    expect(res.new_count).toBe(44)
    expect(res.updated_count).toBe(0)
    expect(res.error_count).toBe(0)

    const allRecords = await db.sourceRecords.toArray()
    expect(allRecords).toHaveLength(44)

    const calls = allRecords.filter((r) => r.source_type === 'call')
    const meetings = allRecords.filter((r) => r.source_type === 'meeting')
    expect(calls).toHaveLength(30)
    expect(meetings).toHaveLength(14)

    const usable = allRecords.filter((r) => r.has_usable_text)
    expect(usable).toHaveLength(17)

    // Initial M07 check: has_usable_text should be false in rev 1
    const m07 = allRecords.find((r) => r.record_ref === 'M07')
    expect(m07).toBeDefined()
    expect(m07?.has_usable_text).toBe(false)
    expect(m07?.applied_revision).toBe(1)
  })

  it('2. Idempotent repeat import: 0 new, 44 unchanged, total records strictly 44', async () => {
    await processDeliveryEnvelope(initialJson)
    const repeatRes = await processDeliveryEnvelope(initialJson)

    expect(repeatRes.new_count).toBe(0)
    expect(repeatRes.updated_count).toBe(0)
    expect(repeatRes.unchanged_count).toBe(44)

    const totalInDb = await db.sourceRecords.count()
    expect(totalInDb).toBe(44)
  })

  it('3. Record order independence: reordered batch yields identical state', async () => {
    const reversedEnvelope = {
      ...initialJson,
      records: [...initialJson.records].reverse(),
    }
    await processDeliveryEnvelope(reversedEnvelope)
    const totalInDb = await db.sourceRecords.count()
    expect(totalInDb).toBe(44)
  })

  it('4. Revision precedence: 02_update.json updates M07 to rev 2; usable text increases to 18; total stays 44', async () => {
    await processDeliveryEnvelope(initialJson)

    const updateRes = await processDeliveryEnvelope(updateJson)
    expect(updateRes.new_count).toBe(0)
    expect(updateRes.updated_count).toBe(1) // M07 was updated

    const allRecords = await db.sourceRecords.toArray()
    expect(allRecords).toHaveLength(44) // No extra record created

    const usable = allRecords.filter((r) => r.has_usable_text)
    expect(usable).toHaveLength(18) // M07 text is now usable!

    const m07 = allRecords.find((r) => r.record_ref === 'M07')
    expect(m07?.applied_revision).toBe(2)
    expect(m07?.has_usable_text).toBe(true)
  })

  it('5. Downgrade rejection: importing rev 1 after rev 2 does NOT overwrite rev 2', async () => {
    await processDeliveryEnvelope(initialJson)
    await processDeliveryEnvelope(updateJson)

    // Try re-importing initial envelope (rev 1)
    const res = await processDeliveryEnvelope(initialJson)
    expect(res.ignored_count).toBe(1) // M07 was ignored because rev 1 < rev 2
    expect(res.unchanged_count).toBe(43)

    const m07 = await db.sourceRecords.get(['meeting', '4f304fff-fd40-5cfc-a366-0a134c445c2a'])
    expect(m07?.applied_revision).toBe(2)
    expect(m07?.has_usable_text).toBe(true)
  })

  it('6. Manual override preservation: manager route override is preserved across updates', async () => {
    await processDeliveryEnvelope(initialJson)

    const key: [string, string] = ['meeting', '4f304fff-fd40-5cfc-a366-0a134c445c2a']
    const existingRouting = await db.routingDecisions.get(key)
    expect(existingRouting).toBeDefined()

    // Manager manually overrides M07 route to 'human-review' and 'partnership-follow-up'
    await db.routingDecisions.put({
      ...existingRouting!,
      is_manual_override: true,
      manual_routes: ['partnership-follow-up', 'human-review'],
      effective_routes: ['partnership-follow-up', 'human-review'],
      manual_note: 'Assigned to executive partnership review by Sales VP',
      routing_method: 'manual-override',
    })

    // Now apply update batch
    await processDeliveryEnvelope(updateJson)

    // Verify routing decision still has the manual override!
    const postUpdateRouting = await db.routingDecisions.get(key)
    expect(postUpdateRouting?.is_manual_override).toBe(true)
    expect(postUpdateRouting?.effective_routes).toEqual(['partnership-follow-up', 'human-review'])
    expect(postUpdateRouting?.manual_note).toBe('Assigned to executive partnership review by Sales VP')
  })
})
