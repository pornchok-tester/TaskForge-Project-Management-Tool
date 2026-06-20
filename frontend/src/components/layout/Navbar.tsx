'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import UserMenu from './UserMenu'

export default function Navbar() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <nav id="navbar" className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
            TaskForge
          </Link>
          <Link
            id="nav-dashboard"
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            Dashboard
          </Link>
          <Link
            id="nav-projects"
            href="/projects"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            Projects
          </Link>
          {isAdmin && (
            <Link
              id="nav-members"
              href="/workspace/members"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Members
            </Link>
          )}
        </div>
        <UserMenu />
      </div>
    </nav>
  )
}
