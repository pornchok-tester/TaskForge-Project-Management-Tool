'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import api from '@/lib/api'
import { Member, UserRole } from '@/types'
import Modal from '@/components/ui/Modal'
import CustomDropdown from '@/components/ui/CustomDropdown'
import Spinner from '@/components/ui/Spinner'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'viewer', label: 'Viewer' },
]

type SortKey = 'name' | 'email' | 'role'
type SortDir = 'asc' | 'desc'

export default function MembersPage() {
  const { user, isLoading } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Invite
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('developer')
  const [inviteFirst, setInviteFirst] = useState('')
  const [inviteLast, setInviteLast] = useState('')

  // Remove confirm
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      router.replace('/dashboard')
    }
  }, [user, isAdmin, isLoading, router])

  const fetchMembers = () => {
    api.get('/workspace/members', {
      params: { search, sort: sortBy, direction: sortDir },
    }).then((res) => setMembers(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMembers()
  }, [search, sortBy, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteFirst.trim() || !inviteLast.trim()) return
    try {
      await api.post('/workspace/members/invite', {
        email: inviteEmail.trim(),
        first_name: inviteFirst.trim(),
        last_name: inviteLast.trim(),
        role: inviteRole,
        password: 'TempPass123!',
      })
      showToast('Member invited', 'success')
      setInviteEmail('')
      setInviteFirst('')
      setInviteLast('')
      setInviteRole('developer')
      fetchMembers()
    } catch (err: any) {
      showToast(err?.response?.data?.detail ?? 'Failed to invite member', 'error')
    }
  }

  const handleRoleChange = async (memberId: string, role: string) => {
    try {
      await api.patch(`/workspace/members/${memberId}/role`, { role })
      showToast('Role updated', 'success')
      fetchMembers()
    } catch {
      showToast('Failed to update role', 'error')
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    try {
      await api.delete(`/workspace/members/${removeTarget.id}`)
      showToast('Member removed', 'success')
      setRemoveTarget(null)
      fetchMembers()
    } catch {
      showToast('Failed to remove member', 'error')
    }
  }

  const sortArrow = (key: SortKey) => {
    if (sortBy !== key) return ''
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Members</h1>

      {/* Invite form (admin only) */}
      {isAdmin && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Invite New Member</h2>
          <div className="flex flex-wrap gap-3">
            <input
              id="invite-first-name"
              type="text"
              value={inviteFirst}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteFirst(e.target.value)}
              placeholder="First name"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            />
            <input
              id="invite-last-name"
              type="text"
              value={inviteLast}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteLast(e.target.value)}
              placeholder="Last name"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
            />
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 w-52"
            />
            <CustomDropdown
              triggerId="invite-role-trigger"
              optionsId="invite-role-options"
              triggerContent={ROLE_OPTIONS.find((r) => r.value === inviteRole)?.label ?? inviteRole}
              options={ROLE_OPTIONS}
              onSelect={(v) => setInviteRole(v as UserRole)}
            />
            <button
              id="btn-invite-member"
              onClick={handleInvite}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Invite
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          id="search-members"
          type="text"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 w-64"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <table id="members-table" className="w-full text-sm">
          <thead className="overflow-hidden rounded-t-xl bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th
                id="sort-name"
                onClick={() => handleSort('name')}
                className="cursor-pointer px-4 py-3 text-left hover:text-indigo-600"
              >
                Name{sortArrow('name')}
              </th>
              <th
                id="sort-email"
                onClick={() => handleSort('email')}
                className="cursor-pointer px-4 py-3 text-left hover:text-indigo-600"
              >
                Email{sortArrow('email')}
              </th>
              <th
                id="sort-role"
                onClick={() => handleSort('role')}
                className="cursor-pointer px-4 py-3 text-left hover:text-indigo-600"
              >
                Role{sortArrow('role')}
              </th>
              <th className="px-4 py-3 text-left">Status</th>
              {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id} className="member-row hover:bg-gray-50">
                <td className="member-name px-4 py-3 font-medium text-gray-900">
                  {m.first_name} {m.last_name}
                </td>
                <td className="member-email px-4 py-3 text-gray-600">{m.email}</td>
                <td className="member-role px-4 py-3">
                  {isAdmin && m.id !== user?.id ? (
                    <CustomDropdown
                      triggerId={`role-trigger-${m.id}`}
                      optionsId={`role-options-${m.id}`}
                      triggerContent={ROLE_OPTIONS.find((r) => r.value === m.role)?.label ?? m.role}
                      options={ROLE_OPTIONS}
                      onSelect={(v) => handleRoleChange(m.id, v)}
                    />
                  ) : (
                    <span className="capitalize">{m.role}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`member-status rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {m.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {m.id !== user?.id && (
                      <button
                        id={`btn-remove-${m.id}`}
                        onClick={() => setRemoveTarget(m)}
                        className="btn-remove-member text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remove confirmation modal */}
      <Modal
        isOpen={!!removeTarget}
        title="Remove Member"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
        confirmLabel="Remove"
        cancelLabel="Cancel"
      >
        Are you sure you want to remove{' '}
        <strong>
          {removeTarget?.first_name} {removeTarget?.last_name}
        </strong>{' '}
        from the workspace?
      </Modal>
    </div>
  )
}
