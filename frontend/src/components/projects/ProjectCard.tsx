'use client'

import { useRouter } from 'next/navigation'
import { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  archived: 'Archived',
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter()

  return (
    <div
      data-project-id={project.id}
      className="project-card cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300"
      onClick={() => router.push(`/projects/${project.id}/board`)}
    >
      <h3 className="project-title text-base font-semibold text-gray-900">
        {project.name}
      </h3>
      {project.description && (
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}
      <div className="mt-3">
        <span
          className={`project-status inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[project.status]}`}
        >
          {STATUS_LABEL[project.status]}
        </span>
      </div>
    </div>
  )
}
