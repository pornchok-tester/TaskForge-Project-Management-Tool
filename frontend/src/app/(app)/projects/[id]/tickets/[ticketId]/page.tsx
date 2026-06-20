'use client'

import { useEffect, useState, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Ticket, Comment, Member, TicketStatus, TicketPriority } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import CustomDropdown from '@/components/ui/CustomDropdown'
import Spinner from '@/components/ui/Spinner'

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function TicketDetailPage() {
  const { id: projectId, ticketId } = useParams<{ id: string; ticketId: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // Editable title state
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')

  // Description edit
  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState('')

  // Comment
  const [commentText, setCommentText] = useState('')

  const isViewer = user?.role === 'viewer'
  const canEdit = !isViewer

  useEffect(() => {
    Promise.all([
      api.get(`/tickets/${ticketId}`).then((res) => setTicket(res.data)),
      api.get(`/tickets/${ticketId}/comments`).then((res) => setComments(res.data)),
      api.get('/workspace/members').then((res) => setMembers(res.data)),
    ]).finally(() => setLoading(false))
  }, [ticketId])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!ticket) return null

  // --- Editable title ---
  const startEditTitle = () => {
    setTitleValue(ticket.title)
    setEditingTitle(true)
  }

  const saveTitle = async () => {
    if (!titleValue.trim() || titleValue.trim() === ticket.title) {
      setEditingTitle(false)
      return
    }
    try {
      const res = await api.patch(`/tickets/${ticketId}`, { title: titleValue.trim() })
      setTicket(res.data)
      showToast('Title updated', 'success')
    } catch {
      showToast('Failed to update title', 'error')
    } finally {
      setEditingTitle(false)
    }
  }

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveTitle()
    if (e.key === 'Escape') setEditingTitle(false)
  }

  // --- Status dropdown ---
  const handleStatusChange = async (status: string) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}/status`, { status })
      setTicket(res.data)
      showToast('Status updated', 'success')
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  // --- Priority dropdown ---
  const handlePriorityChange = async (priority: string) => {
    try {
      const res = await api.patch(`/tickets/${ticketId}`, { priority })
      setTicket(res.data)
      showToast('Priority updated', 'success')
    } catch {
      showToast('Failed to update priority', 'error')
    }
  }

  // --- Assignee dropdown (4-step: trigger → search input → type → click option) ---
  const handleAssigneeChange = async (userId: string) => {
    const assigneeId = userId === 'unassigned' ? null : userId
    try {
      const res = await api.patch(`/tickets/${ticketId}`, { assignee_id: assigneeId })
      setTicket(res.data)
      showToast('Assignee updated', 'success')
    } catch {
      showToast('Failed to update assignee', 'error')
    }
  }

  // --- Description ---
  const startEditDesc = () => {
    setDescValue(ticket.description ?? '')
    setEditingDesc(true)
  }

  const saveDesc = async () => {
    try {
      const res = await api.patch(`/tickets/${ticketId}`, { description: descValue })
      setTicket(res.data)
      showToast('Description updated', 'success')
    } catch {
      showToast('Failed to update description', 'error')
    } finally {
      setEditingDesc(false)
    }
  }

  const clearDesc = async () => {
    try {
      const res = await api.patch(`/tickets/${ticketId}`, { description: '' })
      setTicket(res.data)
      setDescValue('')
    } catch {
      showToast('Failed to clear description', 'error')
    } finally {
      setEditingDesc(false)
    }
  }

  // --- Due date ---
  const handleDueDateChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const due_date = e.target.value || null
    try {
      const res = await api.patch(`/tickets/${ticketId}`, { due_date })
      setTicket(res.data)
      showToast('Due date updated', 'success')
    } catch {
      showToast('Failed to update due date', 'error')
    }
  }

  // --- Comment ---
  const handleAddComment = async () => {
    if (!commentText.trim()) return
    try {
      const res = await api.post(`/tickets/${ticketId}/comments`, {
        content: commentText.trim(),
      })
      setComments((prev) => [...prev, res.data])
      setCommentText('')
    } catch {
      showToast('Failed to add comment', 'error')
    }
  }

  // Assignee options for custom dropdown
  const assigneeOptions = [
    { value: 'unassigned', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.id,
      label: `${m.first_name} ${m.last_name}`,
      'data-user-id': m.id,
    })),
  ]

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <button
        onClick={() => router.push(`/projects/${projectId}/board`)}
        className="mb-4 text-sm text-indigo-600 hover:underline"
      >
        ← Back to Board
      </button>

      {/* Editable Title — StaleElement pattern: h1 → input → h1 */}
      <div id="ticket-title-container" className="mb-6">
        {editingTitle ? (
          <input
            id="ticket-title-input"
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={handleTitleKeyDown}
            className="w-full rounded-lg border border-indigo-400 px-3 py-2 text-xl font-bold outline-none focus:ring-2 focus:ring-indigo-300"
            autoFocus
          />
        ) : (
          <h1
            id="ticket-title"
            onClick={canEdit ? startEditTitle : undefined}
            className={`text-2xl font-bold text-gray-900 ${canEdit ? 'cursor-pointer hover:text-indigo-700' : ''}`}
          >
            {ticket.title}
          </h1>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Description</h3>
            {editingDesc ? (
              <div>
                <textarea
                  id="ticket-description-input"
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-indigo-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    id="btn-save-description"
                    onClick={saveDesc}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    id="btn-clear-description"
                    onClick={clearDesc}
                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setEditingDesc(false)}
                    className="rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                id="ticket-description"
                onClick={canEdit ? startEditDesc : undefined}
                className={`min-h-[80px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 ${canEdit ? 'cursor-pointer hover:border-indigo-300' : ''}`}
              >
                {ticket.description || <span className="text-gray-400">No description</span>}
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Comments ({comments.length})
            </h3>

            <div className="space-y-3 mb-4">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-100 bg-white p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-800">
                      {c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              ))}
            </div>

            {!isViewer && (
              <div>
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                />
                <button
                  id="btn-add-comment"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="mt-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add Comment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status — 3-step dropdown */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Status
            </label>
            {canEdit ? (
              <CustomDropdown
                triggerId="ticket-status-trigger"
                optionsId="ticket-status-options"
                triggerContent={STATUS_OPTIONS.find((s) => s.value === ticket.status)?.label ?? ticket.status}
                options={STATUS_OPTIONS}
                onSelect={handleStatusChange}
              />
            ) : (
              <span className="text-sm text-gray-700">
                {STATUS_OPTIONS.find((s) => s.value === ticket.status)?.label}
              </span>
            )}
          </div>

          {/* Priority — 3-step dropdown */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Priority
            </label>
            {canEdit ? (
              <CustomDropdown
                triggerId="ticket-priority-trigger"
                optionsId="ticket-priority-options"
                triggerContent={PRIORITY_OPTIONS.find((p) => p.value === ticket.priority)?.label ?? 'None'}
                options={PRIORITY_OPTIONS}
                onSelect={handlePriorityChange}
              />
            ) : (
              <span className="text-sm text-gray-700">
                {ticket.priority ?? 'None'}
              </span>
            )}
          </div>

          {/* Assignee — 4-step searchable dropdown */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Assignee
            </label>
            {canEdit ? (
              <CustomDropdown
                triggerId="ticket-assignee-trigger"
                optionsId="ticket-assignee-options"
                triggerContent={
                  ticket.assignee
                    ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}`
                    : 'Unassigned'
                }
                options={assigneeOptions}
                onSelect={handleAssigneeChange}
                searchable
                searchId="ticket-assignee-search"
                placeholder="Search members..."
              />
            ) : (
              <span className="text-sm text-gray-700">
                {ticket.assignee
                  ? `${ticket.assignee.first_name} ${ticket.assignee.last_name}`
                  : 'Unassigned'}
              </span>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Due Date
            </label>
            {canEdit ? (
              <input
                id="ticket-due-date"
                type="date"
                value={ticket.due_date ? ticket.due_date.slice(0, 10) : ''}
                onChange={handleDueDateChange}
                className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-indigo-400"
              />
            ) : (
              <span className="text-sm text-gray-700">
                {ticket.due_date ? ticket.due_date.slice(0, 10) : 'None'}
              </span>
            )}
          </div>

          {/* Reporter */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Reporter
            </label>
            <span className="text-sm text-gray-700">
              {ticket.reporter
                ? `${ticket.reporter.first_name} ${ticket.reporter.last_name}`
                : 'Unknown'}
            </span>
          </div>

          {/* Ticket number */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
              Ticket
            </label>
            <span className="text-sm text-gray-700">#{ticket.ticket_number}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
