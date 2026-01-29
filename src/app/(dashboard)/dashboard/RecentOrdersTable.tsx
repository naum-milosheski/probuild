'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'

interface Order {
    id: string
    order_number: string
    total: number
    status: string
    source: string
    created_at: string
    client?: { company_name: string }
}

const statusColors: Record<string, string> = {
    draft: 'badge-info',
    pending: 'badge-warning',
    confirmed: 'badge-info',
    in_progress: 'badge-orange',
    ready: 'badge-success',
    delivered: 'badge-success',
    invoiced: 'badge-info',
    paid: 'badge-success',
    cancelled: 'badge-error',
}

function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
}

export default function RecentOrdersTable({ orders }: { orders: Order[] }) {
    const router = useRouter()

    const handleRowClick = (orderId: string) => {
        router.push(`/dashboard/orders/${orderId}`)
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-8 text-text-tertiary">
                <p>No orders yet</p>
                <Link href="/dashboard/orders/new" className="text-orange-500 hover:underline text-sm">
                    Create your first order
                </Link>
            </div>
        )
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr
                        key={order.id}
                        onClick={() => handleRowClick(order.id)}
                        className="cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
                    >
                        <td className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{order.order_number}</span>
                                {order.source === 'magic_import' && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded">
                                        AI
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="whitespace-nowrap">{order.client?.company_name || 'Unknown'}</td>
                        <td className="font-medium whitespace-nowrap">${order.total?.toLocaleString()}</td>
                        <td>
                            <span className={`badge ${statusColors[order.status] || 'badge-info'}`}>
                                {order.status.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="text-text-tertiary">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(order.created_at)}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
