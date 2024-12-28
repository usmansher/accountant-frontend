'use client'
import React from 'react'

const ConfirmationModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'Do you really want to proceed with this action?',
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel}></div>

      <div className="bg-white rounded-lg shadow-lg z-50 max-w-sm w-full p-6 relative">
        {/* Close button top-right */}
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
