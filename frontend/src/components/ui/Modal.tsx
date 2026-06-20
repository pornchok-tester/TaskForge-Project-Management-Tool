'use client'

import { ReactNode } from 'react'

interface ModalProps {
  title?: string
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  isOpen: boolean
}

export default function Modal({
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isOpen,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        id="modal-confirm"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        {title && <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>}
        {children && <div className="mb-5 text-sm text-gray-600">{children}</div>}
        <div className="flex justify-end gap-3">
          <button
            id="btn-cancel"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            id="btn-confirm"
            onClick={onConfirm}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
