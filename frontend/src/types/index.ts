export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer'
export type ProjectStatus = 'active' | 'archived'
export type TicketStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  workspace_id: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  ticket_number: number
  project_id: string
  title: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority | null
  assignee_id: string | null
  reporter_id: string
  story_points: number | null
  position: number
  due_date: string | null
  assignee: User | null
  reporter: User | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  ticket_id: string
  author_id: string
  content: string
  author: User | null
  created_at: string
}

export interface Member {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  is_active: boolean
  last_active_at: string | null
  created_at: string
}

export interface DashboardStats {
  my_tasks_count: number
  due_today_count: number
  overdue_count: number
}
