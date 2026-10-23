import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Overview } from '@/pages/Overview'
import { ConversationInbox } from '@/pages/ConversationInbox'
import { RoutingReview } from '@/pages/RoutingReview'
import { ManagerBrief } from '@/pages/ManagerBrief'
import { Exports } from '@/pages/Exports'
import { ImportCenter } from '@/pages/ImportCenter'
import { AuditLog } from '@/pages/AuditLog'
import { Settings } from '@/pages/Settings'
import { db } from '@/lib/db'
import { loadInitialBatch } from '@/data/demoDataLoader'

export function App() {
  // On initial mount, if IndexedDB is completely empty, automatically load 01_initial.json
  useEffect(() => {
    async function initDb() {
      const count = await db.sourceRecords.count()
      if (count === 0) {
        try {
          await loadInitialBatch()
        } catch (err) {
          console.warn('Auto-import of initial batch failed (can be imported manually via UI):', err)
        }
      }
    }
    initDb()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="inbox" element={<ConversationInbox />} />
          <Route path="routing" element={<RoutingReview />} />
          <Route path="brief" element={<ManagerBrief />} />
          <Route path="exports" element={<Exports />} />
          <Route path="import" element={<ImportCenter />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
