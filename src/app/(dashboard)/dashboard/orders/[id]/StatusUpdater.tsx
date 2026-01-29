'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { updateOrderStatus } from '../actions'

const statusConfig: Record<string, { label: string; class: string }> = {
    draft: { label: 'Draft', class: 'badge-info' },
    pending: { label: 'Pending', class: 'badge-warning' },
    confirmed: { label: 'Confirmed', class: 'badge-info' },
    in_progress: { label: 'In Progress', class: 'badge-orange' },
    ready: { label: 'Ready', class: 'badge-success' },
    delivered: { label: 'Delivered', class: 'badge-success' },
    invoiced: { label: 'Invoiced', class: 'badge-info' },
    paid: { label: 'Paid', class: 'badge-success' },
    cancelled: { label: 'Cancelled', class: 'badge-error' },
}

// Status workflow - what status comes next
const statusWorkflow: Record<string, string[]> = {
    draft: ['pending', 'cancelled'],
    pending: ['confirmed', 'cancelled'],
    confirmed: ['in_progress', 'cancelled'],
    in_progress: ['ready', 'cancelled'],
    ready: ['delivered', 'cancelled'],
    delivered: ['invoiced'],
    invoiced: ['paid'],
    paid: [],
    cancelled: [],
}

interface StatusUpdaterProps {
    orderId: string
    currentStatus: string
}

export default function StatusUpdater({ orderId, currentStatus }: StatusUpdaterProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState(currentStatus)

    const availableStatuses = statusWorkflow[status] || []
    const currentConfig = statusConfig[status] || { label: status, class: 'badge-info' }

    const handleStatusChange = (newStatus: string) => {
        setIsOpen(false)
        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus)
            if (result.success) {
                setStatus(newStatus)
            }
        })
    }

    return (
        <div className="relative">
            <button
                onClick={() => availableStatuses.length > 0 && setIsOpen(!isOpen)}
                disabled={isPending || availableStatuses.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${availableStatuses.length === 0
                        ? 'cursor-default opacity-80'
                        : 'hover:opacity-90 cursor-pointer'
                    } ${currentConfig.class.replace('badge-', 'bg-').replace('warning', 'yellow-500/20 text-yellow-400').replace('success', 'green-500/20 text-green-400').replace('error', 'red-500/20 text-red-400').replace('info', 'blue-500/20 text-blue-400').replace('orange', 'orange-500/20 text-orange-400')}`}
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <span className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-yellow-400' :
                            status === 'delivered' || status === 'ready' || status === 'paid' ? 'bg-green-400' :
                                status === 'cancelled' ? 'bg-red-400' :
                                    status === 'in_progress' ? 'bg-orange-400' :
                                        'bg-blue-400'
                        }`} />
                )}
                {currentConfig.label}
                {availableStatuses.length > 0 && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && availableStatuses.length > 0 && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-48 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-20">
                        <div className="p-2 border-b border-border-subtle">
                            <span className="text-xs text-text-tertiary uppercase tracking-wide">Change Status To</span>
                        </div>
                        <div className="p-1">
                            {availableStatuses.map(newStatus => (
                                <button
                                    key={newStatus}
                                    onClick={() => handleStatusChange(newStatus)}
                                    className="w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                                >
                                    <span className={`badge ${statusConfig[newStatus]?.class}`}>
                                        {statusConfig[newStatus]?.label || newStatus}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
