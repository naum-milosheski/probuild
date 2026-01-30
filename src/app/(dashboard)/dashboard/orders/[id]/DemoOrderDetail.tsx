'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Package,
    Building2,
    Sparkles,
    MapPin,
    Calendar
} from 'lucide-react'
import { getDemoOrderById, type DemoOrder } from '@/lib/demo-orders'

interface DemoOrderDetailProps {
    orderId: string
}

const statusConfig: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'badge-warning' },
    confirmed: { label: 'Confirmed', class: 'badge-info' },
    in_progress: { label: 'In Progress', class: 'badge-orange' },
    ready: { label: 'Ready', class: 'badge-success' },
    delivered: { label: 'Delivered', class: 'badge-success' },
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })
}

export default function DemoOrderDetail({ orderId }: DemoOrderDetailProps) {
    const router = useRouter()
    const [order, setOrder] = useState<DemoOrder | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const demoOrder = getDemoOrderById(orderId)
        if (!demoOrder) {
            // Demo order not found, redirect to orders list
            router.push('/dashboard/orders')
            return
        }
        setOrder(demoOrder)
        setLoading(false)
    }, [orderId, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!order) {
        return null
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 w-full">
                    <Link
                        href="/dashboard/orders"
                        className="p-2 hover:bg-bg-tertiary rounded-md transition-colors flex-shrink-0 self-start mt-1"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-secondary" />
                    </Link>
                    <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h1 className="text-2xl font-semibold text-text-primary font-mono break-all leading-tight">
                                {order.order_number}
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded flex-shrink-0">
                                <Sparkles className="w-3 h-3" />
                                AI Import
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-500 rounded flex-shrink-0">
                                Demo
                            </span>
                        </div>
                        <p className="text-text-secondary mt-1">
                            Created {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Demo Notice */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-purple-300 text-sm">
                    <strong>Demo Order:</strong> This order was created in your browser session and is not saved to the database.
                    It will disappear when you close this browser tab.
                </p>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items - Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="card">
                        <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-sm text-text-tertiary uppercase tracking-wide">Order Status</h2>
                            </div>
                            <span className={`badge ${statusConfig[order.status]?.class || 'badge-info'}`}>
                                {statusConfig[order.status]?.label || order.status}
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-text-primary">
                                Order Items ({order.items?.length || 0})
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            {order.items && order.items.length > 0 ? (
                                <table className="table min-w-[800px]">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th className="text-right">Qty</th>
                                            <th className="text-right">Unit Price</th>
                                            <th className="text-right">Total</th>
                                            <th className="text-right">AI Conf.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-bg-tertiary rounded-md">
                                                            <Package className="w-4 h-4 text-text-tertiary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-text-primary">{item.name}</p>
                                                            <p className="text-xs text-text-tertiary font-mono">{item.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <span className="font-medium">{item.quantity}</span>
                                                    <span className="text-text-tertiary ml-1">{item.unit}</span>
                                                </td>
                                                <td className="text-right text-text-secondary">
                                                    ${item.unit_price?.toFixed(2)}
                                                </td>
                                                <td className="text-right font-medium">
                                                    ${item.line_total?.toFixed(2)}
                                                </td>
                                                <td className="text-right">
                                                    {item.ai_confidence ? (
                                                        <span className={`text-sm ${item.ai_confidence >= 0.9 ? 'text-green-400' :
                                                            item.ai_confidence >= 0.7 ? 'text-yellow-400' :
                                                                'text-orange-400'
                                                            }`}>
                                                            {Math.round(item.ai_confidence * 100)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-text-tertiary">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-text-tertiary">
                                    No items in this order
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="mt-4 pt-4 border-t border-border-subtle">
                            <div className="flex justify-end">
                                <div className="w-full lg:w-64 space-y-2">
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Subtotal</span>
                                        <span>${order.subtotal?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-text-secondary">
                                        <span>Tax</span>
                                        <span>${order.tax_amount?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold text-text-primary pt-2 border-t border-border-subtle">
                                        <span>Total</span>
                                        <span>${order.total?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="card">
                            <h2 className="text-lg font-semibold text-text-primary mb-2">Notes</h2>
                            <p className="text-text-secondary">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <div className="card">
                        <h2 className="text-sm text-text-tertiary uppercase tracking-wide mb-3">Client</h2>
                        {order.client ? (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-bg-tertiary rounded-lg">
                                    <Building2 className="w-5 h-5 text-text-secondary" />
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{order.client.company_name}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-text-tertiary">No client assigned</p>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="card">
                        <h2 className="text-sm text-text-tertiary uppercase tracking-wide mb-3">Timeline</h2>
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-bg-tertiary rounded">
                                <Calendar className="w-4 h-4 text-text-tertiary" />
                            </div>
                            <div className="text-sm">
                                <p className="text-text-secondary">Created</p>
                                <p className="text-text-tertiary">{formatDate(order.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
