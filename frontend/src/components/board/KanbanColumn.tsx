'use client'

import { useState, KeyboardEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Ticket, TicketStatus } from '@/types'
import KanbanCard from './KanbanCard'
import api from '@/lib/api'

const STATUS_LABEL: Record<TicketStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

interface KanbanColumnProps {
  status: TicketStatus
  tickets: Ticket[]
  projectId: string
  onRefresh: () => void
  canCreate: boolean
}

export default function KanbanColumn({ status, tickets, projectId, onRefresh, canCreate }: KanbanColumnProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const { setNodeRef, isOver } = useDroppable({ id: status })

  const handleQuickAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      await api.post(`/projects/${projectId}/tickets`, { title: newTitle.trim(), status })
      setNewTitle('')
      setShowQuickAdd(false)
      onRefresh()
    } finally {
      setAdding(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleQuickAdd()
    if (e.key === 'Escape') {
      setShowQuickAdd(false)
      setNewTitle('')
    }
  }

  return (
    <div
      data-status={status}
      className={`flex flex-col rounded-xl p-3 transition ${isOver ? 'bg-indigo-50' : 'bg-gray-100'}`}
      style={{ minHeight: 300, width: 260, flexShrink: 0 }}
    >
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{STATUS_LABEL[status]}</h3>
        <span className="column-card-count rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex flex-col gap-2 flex-1">
        <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket) => (
            <KanbanCard key={ticket.id} ticket={ticket} projectId={projectId} />
          ))}
        </SortableContext>
      </div>

      {/* Quick add */}
      {canCreate && (
        <div className="mt-3">
          {showQuickAdd ? (
            <div>
              <input
                className="quick-add-input w-full rounded-lg border border-indigo-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                placeholder="Card title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="mt-2 flex gap-2">
                <button
                  className="quick-add-confirm rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
                  onClick={handleQuickAdd}
                  disabled={adding || !newTitle.trim()}
                >
                  Add
                </button>
                <button
                  className="quick-add-cancel rounded border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  onClick={() => { setShowQuickAdd(false); setNewTitle('') }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn-add-card w-full rounded-lg border border-dashed border-gray-300 py-1.5 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-500"
              data-status={status}
              onClick={() => setShowQuickAdd(true)}
            >
              + Add card
            </button>
          )}
        </div>
      )}
    </div>
  )
}
