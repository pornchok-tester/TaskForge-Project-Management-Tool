'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import api from '@/lib/api'
import { Project } from '@/types'
import ProjectCard from '@/components/projects/ProjectCard'
import NewProjectModal from '@/components/projects/NewProjectModal'
import CustomDropdown from '@/components/ui/CustomDropdown'

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

const SORT_LABEL: Record<string, string> = {
  'name-asc': 'Name A-Z',
  'name-desc': 'Name Z-A',
  newest: 'Newest',
  oldest: 'Oldest',
}

const FILTER_LABEL: Record<string, string> = {
  all: 'All',
  active: 'Active',
  archived: 'Archived',
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')
  const [showModal, setShowModal] = useState(false)

  const canCreate = user?.role === 'admin' || user?.role === 'manager'

  const fetchProjects = () => {
    const params: Record<string, string> = { sort: sortBy }
    if (search) params.search = search
    if (filterStatus !== 'all') params.status = filterStatus
    api.get('/projects', { params }).then((res) => setProjects(res.data))
  }

  useEffect(() => {
    fetchProjects()
  }, [search, filterStatus, sortBy])

  const handleCreate = async (name: string, description: string) => {
    await api.post('/projects', { name, description })
    showToast('Project created successfully', 'success')
    setShowModal(false)
    fetchProjects()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        {canCreate && (
          <button
            id="btn-new-project"
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          id="search-projects"
          type="text"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 w-56"
        />

        <CustomDropdown
          triggerId="filter-status"
          optionsId="filter-status-options"
          triggerContent={FILTER_LABEL[filterStatus]}
          options={FILTER_OPTIONS}
          onSelect={(val) => setFilterStatus(val)}
        />

        <CustomDropdown
          triggerId="sort-by"
          optionsId="sort-by-options"
          triggerContent={SORT_LABEL[sortBy]}
          options={SORT_OPTIONS}
          onSelect={(val) => setSortBy(val)}
        />
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div id="empty-state" className="py-20 text-center text-gray-400">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <NewProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchProjects}
        onCreate={handleCreate}
      />
    </div>
  )
}
