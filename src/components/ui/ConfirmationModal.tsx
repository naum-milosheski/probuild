'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
    variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'danger'
}: ConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isVisible) return null

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={isLoading ? undefined : onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-bg-primary border border-border-default rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-200 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Close Button */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-text-tertiary hover:text-text-primary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="p-6">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full flex-shrink-0 ${variant === 'danger' ? 'bg-red-500/10 text-red-500' :
                                variant === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                    'bg-blue-500/10 text-blue-500'
                            }`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">
                            {title}
                        </h3>
                    </div>

                    {/* Message */}
                    <p className="text-text-secondary leading-relaxed mb-8">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="btn btn-secondary"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`btn flex items-center gap-2 ${variant === 'danger'
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    : 'btn-primary'
                                }`}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
