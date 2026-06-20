'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

export interface DropdownOption {
  value: string
  label: string | ReactNode
  'data-user-id'?: string
}

interface CustomDropdownProps {
  triggerId: string
  optionsId: string
  triggerContent: ReactNode
  options: DropdownOption[]
  onSelect: (value: string) => void
  className?: string
  optionsClassName?: string
  searchable?: boolean
  searchId?: string
  placeholder?: string
}

export default function CustomDropdown({
  triggerId,
  optionsId,
  triggerContent,
  options,
  onSelect,
  className = '',
  optionsClassName = '',
  searchable = false,
  searchId,
  placeholder = 'Search...',
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = searchable
    ? options.filter((o) =>
        typeof o.label === 'string'
          ? o.label.toLowerCase().includes(query.toLowerCase())
          : true
      )
    : options

  const handleSelect = (value: string) => {
    onSelect(value)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        id={triggerId}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:border-indigo-400"
      >
        {triggerContent}
        <span className="ml-1 text-gray-400">▾</span>
      </button>

      {open && (
        <div
          id={optionsId}
          className={`absolute z-30 mt-1 min-w-full rounded-lg border border-gray-200 bg-white shadow-lg ${optionsClassName}`}
        >
          {searchable && (
            <div className="p-2">
              <input
                id={searchId}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-indigo-400"
                autoFocus
              />
            </div>
          )}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map((opt) => (
              <li
                key={opt.value}
                data-value={opt.value}
                data-user-id={opt['data-user-id']}
                onClick={() => handleSelect(opt.value)}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-indigo-50"
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
