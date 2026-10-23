import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { db } from '@/lib/db'

export function Layout() {
  const [totalRecords, setTotalRecords] = useState(0)
  const [usableCount, setUsableCount] = useState(0)
  const [needsReviewCount, setNeedsReviewCount] = useState(0)
  const [staleCount, setStaleCount] = useState(0)
  const location = useLocation()

  const refreshCounts = async () => {
    const recs = await db.sourceRecords.toArray()
    const routings = await db.routingDecisions.toArray()
    const analyses = await db.analysisRecords.toArray()

    setTotalRecords(recs.length)
    setUsableCount(recs.filter((r) => r.has_usable_text).length)

    const needsReview = recs.filter((r) => {
      const routing = routings.find(
        (rt) => rt.source_type === r.source_type && rt.source_id === r.source_id
      )
      return (
        routing?.review_status === 'needs-attention' ||
        routing?.effective_routes.includes('human-review')
      )
    }).length
    setNeedsReviewCount(needsReview)

    const stale = analyses.filter((a) => a.freshness === 'stale').length
    setStaleCount(stale)
  }

  useEffect(() => {
    refreshCounts()
  }, [location.pathname])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Dark Navy Sidebar */}
      <Sidebar
        totalRecords={totalRecords}
        needsReviewCount={needsReviewCount}
        staleCount={staleCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          totalRecords={totalRecords}
          usableCount={usableCount}
          onDataChanged={refreshCounts}
        />

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ onDataChanged: refreshCounts }} />
        </main>
      </div>
    </div>
  )
}
