'use client'

import { useRouter } from 'next/navigation'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Ticket } from '@/types'

interface KanbanCardProps {
  ticket: Ticket
  projectId: string
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-green-400',
}

export default function KanbanCard({ ticket, projectId }: KanbanCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
    data: { ticket },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-ticket-id={ticket.id}
      className="cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md active:cursor-grabbing"
      onClick={() => router.push(`/projects/${projectId}/tickets/${ticket.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="card-title text-sm font-medium text-gray-800 line-clamp-2">{ticket.title}</p>
        {ticket.priority && (
          <span
            data-priority={ticket.priority}
            className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${PRIORITY_COLOR[ticket.priority] ?? 'bg-gray-300'}`}
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="ticket-id-label text-xs text-gray-400">#{ticket.ticket_number}</span>
        {ticket.assignee && (
          <span
            data-user-id={ticket.assignee.id}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700"
            title={`${ticket.assignee.first_name} ${ticket.assignee.last_name}`}
          >
            {ticket.assignee.first_name[0]}
          </span>
        )}
      </div>
    </div>
  )
}
