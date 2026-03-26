'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, Package, Users, X } from 'lucide-react'

interface ConfirmOrderModalProps {
    clientName: string
    itemCount: number
    subtotal: number
    unresolvedCount: number
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmOrderModal({
    clientName,
    itemCount,
    subtotal,
    unresolvedCount,
    onConfirm,
    onCancel,
}: ConfirmOrderModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)

    // Close on Escape
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onCancel()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onCancel])

    // Close on backdrop click
    function handleBackdropClick(event: React.MouseEvent) {
        if (event.target === event.currentTarget) {
            onCancel()
        }
    }

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const taxRate = 0.0825
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-bg-secondary border border-border-default rounded-xl shadow-2xl w-full max-w-md animate-slide-up"
            >
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 hover:bg-bg-tertiary rounded-md transition-colors"
                >
                    <X className="w-4 h-4 text-text-tertiary" />
                </button>

                {/* Content */}
                <div className="p-6 space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">Confirm Order</h2>
                        <p className="text-sm text-text-secondary mt-1">
                            Review the summary before creating this order.
                        </p>
                    </div>

                    {/* Summary cards */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
                            <div className="p-2 bg-bg-elevated rounded-md">
                                <Users className="w-4 h-4 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs text-text-tertiary">Client</p>
                                <p className="font-medium text-text-primary">{clientName}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-bg-tertiary rounded-lg">
                            <div className="p-2 bg-bg-elevated rounded-md">
                                <Package className="w-4 h-4 text-orange-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-text-tertiary">Order Summary</p>
                                <p className="font-medium text-text-primary">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-text-tertiary">Total</p>
                                <p className="font-semibold text-text-primary">${total.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Price breakdown */}
                        <div className="px-3 space-y-1 text-sm">
                            <div className="flex justify-between text-text-tertiary">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-text-tertiary">
                                <span>Tax (8.25%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {unresolvedCount > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                            <p className="text-warning">
                                {unresolvedCount} unresolved item{unresolvedCount !== 1 ? 's' : ''} will be excluded from this order.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onCancel}
                            className="btn btn-secondary flex-1 justify-center"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="btn btn-primary flex-1 justify-center"
                        >
                            Create Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
