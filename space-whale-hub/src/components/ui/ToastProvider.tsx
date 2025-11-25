'use client'

import { ToastContainer, useToasts } from './Toast'

export default function ToastProvider() {
  const { toasts, removeToast } = useToasts()
  
  return <ToastContainer toasts={toasts} onRemove={removeToast} />
}

