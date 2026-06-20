'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import Skeleton from '@/components/ui/Skeleton'
import { DashboardStats } from '@/types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 id="welcome-header" className="mb-6 text-2xl font-bold text-gray-900">
        Welcome, {user?.first_name} {user?.last_name}
      </h1>

      {loading ? (
        <Skeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div id="widget-my-tasks" className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">My Tasks</p>
            <p id="stat-my-tasks" className="mt-2 text-4xl font-bold text-indigo-600">
              {stats?.my_tasks_count ?? 0}
            </p>
          </div>

          <div id="widget-due-today" className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Due Today</p>
            <p id="stat-due-today" className="mt-2 text-4xl font-bold text-amber-500">
              {stats?.due_today_count ?? 0}
            </p>
          </div>

          <div id="widget-overdue" className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Overdue</p>
            <p id="stat-overdue" className="mt-2 text-4xl font-bold text-red-500">
              {stats?.overdue_count ?? 0}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
