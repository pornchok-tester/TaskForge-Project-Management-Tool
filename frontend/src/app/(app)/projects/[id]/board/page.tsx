'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  MouseSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import api from '@/lib/api'
import { Ticket, TicketStatus, Project } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import KanbanColumn from '@/components/board/KanbanColumn'
import Spinner from '@/components/ui/Spinner'

const COLUMNS: TicketStatus[] = ['todo', 'in_progress', 'in_review', 'done']

function groupByStatus(tickets: Ticket[]): Record<TicketStatus, Ticket[]> {
  const groups: Record<TicketStatus, Ticket[]> = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  }
  for (const t of tickets) {
    if (groups[t.status]) {
      groups[t.status].push(t)
    }
  }
  for (const col of COLUMNS) {
    groups[col].sort((a, b) => a.position - b.position)
  }
  return groups
}

export default function BoardPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const canCreate = user?.role !== 'viewer'

  const fetchTickets = useCallback(() => {
    return api.get(`/projects/${projectId}/tickets`).then((res) => setTickets(res.data))
  }, [projectId])

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`).then((res) => setProject(res.data)),
      fetchTickets(),
    ]).finally(() => setLoading(false))
  }, [projectId, fetchTickets])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const ticketId = active.id as string
    const overId = over.id as string

    const draggedTicket = tickets.find((t) => t.id === ticketId)
    if (!draggedTicket) return

    const newStatus = COLUMNS.includes(overId as TicketStatus)
      ? (overId as TicketStatus)
      : tickets.find((t) => t.id === overId)?.status ?? draggedTicket.status

    const columnTickets = tickets
      .filter((t) => t.status === newStatus && t.id !== ticketId)
      .sort((a, b) => a.position - b.position)

    let overIndex = columnTickets.findIndex((t) => t.id === overId)
    if (overIndex === -1) overIndex = columnTickets.length

    const prev = columnTickets[overIndex - 1]?.position ?? 0
    const next = columnTickets[overIndex]?.position ?? (prev + 2000)
    const newPosition = (prev + next) / 2

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus, position: newPosition } : t
      )
    )

    try {
      if (draggedTicket.status !== newStatus) {
        await api.patch(`/tickets/${ticketId}/status`, { status: newStatus })
      }
      await api.patch(`/tickets/${ticketId}/position`, {
        status: newStatus,
        position: newPosition,
      })
    } catch {
      fetchTickets()
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const ticketId = active.id as string
    const overId = over.id as string

    if (ticketId === overId) return

    const draggedTicket = tickets.find((t) => t.id === ticketId)
    if (!draggedTicket) return

    const targetStatus = COLUMNS.includes(overId as TicketStatus)
      ? (overId as TicketStatus)
      : tickets.find((t) => t.id === overId)?.status

    if (targetStatus && draggedTicket.status !== targetStatus) {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: targetStatus } : t))
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const grouped = groupByStatus(tickets)

  return (
    <div>
      <div className="mb-6">
        <h1 className="project-name text-2xl font-bold text-gray-900">{project?.name}</h1>
        {project?.status === 'archived' && (
          <span className="inline-block mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            Archived
          </span>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={grouped[status]}
              projectId={projectId}
              onRefresh={fetchTickets}
              canCreate={canCreate}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
