'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    Filter,
    X,
    Clock,
    Sparkles,
    ChevronRight,
    ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { getDemoOrders, type DemoOrder } from '@/lib/demo-orders'

interface Order {
    id: string
    order_number: string
    status: string
    total: number
    source: string
    created_at: string
    client?: { company_name: string }
    job_site?: { name: string }
    isDemo?: boolean
}

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

function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function OrdersClient({ orders: initialOrders }: { orders: Order[] }) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [demoOrders, setDemoOrders] = useState<Order[]>([])

    // Load demo orders from sessionStorage on mount
    useEffect(() => {
        const orders = getDemoOrders()
        // Convert DemoOrder to Order format
        const converted: Order[] = orders.map(o => ({
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            total: o.total,
            source: o.source,
            created_at: o.created_at,
            client: o.client,
            job_site: o.job_site,
            isDemo: true,
        }))
        setDemoOrders(converted)
    }, [])

    // Merge demo orders with Supabase orders (demo first, sorted by date)
    const allOrders = useMemo(() => {
        return [...demoOrders, ...initialOrders].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }, [demoOrders, initialOrders])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowFilters(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Filter orders based on search and status
    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch = searchQuery === '' ||
                order.order_number.toLowerCase().includes(searchLower) ||
                order.client?.company_name?.toLowerCase().includes(searchLower) ||
                order.job_site?.name?.toLowerCase().includes(searchLower)

            const matchesStatus = statusFilter === '' || order.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [allOrders, searchQuery, statusFilter])

    // Get unique statuses for filter dropdown
    const availableStatuses = useMemo(() => {
        const statuses = new Set(allOrders.map(o => o.status))
        return Array.from(statuses)
    }, [allOrders])

    // Handle row click - navigate to order detail
    const handleRowClick = (orderId: string) => {
        router.push(`/dashboard/orders/${orderId}`)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Orders</h1>
                    <p className="text-text-secondary mt-1">Manage and track all customer orders</p>
                </div>
                <Link href="/dashboard/orders/new" className="btn btn-primary w-full lg:w-auto justify-center">
                    <Sparkles className="w-4 h-4" />
                    New Order
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
                {/* Search Input - Icon always visible unless there's text */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by order ID, client, or job site..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input w-full pl-10 pr-10"
                        style={{ paddingLeft: '40px' }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-tertiary rounded"
                        >
                            <X className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
                        </button>
                    )}
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn w-full lg:w-auto flex items-center justify-between lg:justify-start gap-2 ${statusFilter ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            {statusFilter ? statusConfig[statusFilter]?.label : 'Status'}
                        </div>
                        {statusFilter ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); setStatusFilter(''); }}
                                className="p-0.5 hover:bg-white/20 rounded ml-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        ) : (
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {showFilters && (
                        <div className="absolute right-0 top-full mt-2 w-full lg:w-48 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-20">
                            <div className="p-2 border-b border-border-subtle">
                                <span className="text-xs text-text-tertiary uppercase tracking-wide">Filter by Status</span>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={() => { setStatusFilter(''); setShowFilters(false); }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm ${!statusFilter ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                                >
                                    All Statuses
                                </button>
                                {availableStatuses.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => { setStatusFilter(status); setShowFilters(false); }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${statusFilter === status ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                                    >
                                        <span className={`badge ${statusConfig[status]?.class}`}>
                                            {statusConfig[status]?.label || status}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Active filters indicator */}
            {(searchQuery || statusFilter) && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-tertiary">Showing {filteredOrders.length} of {allOrders.length} orders</span>
                    <button
                        onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                        className="text-orange-500 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Orders Table */}
            <div className="card p-0 overflow-hidden border border-border-default">
                <div className="overflow-x-auto">
                    {filteredOrders.length > 0 ? (
                        <table className="table min-w-[1000px]">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Client</th>
                                    <th>Job Site</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => handleRowClick(order.id)}
                                        className="group cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
                                    >
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-medium">{order.order_number}</span>
                                                {order.source === 'magic_import' && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded">
                                                        AI
                                                    </span>
                                                )}
                                                {order.isDemo && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-500 rounded">
                                                        Demo
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="font-medium">{order.client?.company_name || 'Unknown'}</td>
                                        <td className="text-text-secondary">{order.job_site?.name || '-'}</td>
                                        <td className="font-medium">${order.total?.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${statusConfig[order.status]?.class || 'badge-info'}`}>
                                                {statusConfig[order.status]?.label || order.status}
                                            </span>
                                        </td>
                                        <td className="text-text-tertiary">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(order.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                                <ChevronRight className="w-4 h-4 text-text-tertiary" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 text-text-tertiary">
                            {initialOrders.length === 0 ? (
                                <>
                                    <p>No orders yet</p>
                                    <Link href="/dashboard/orders/new" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
                                        Create your first order with Magic Import
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p>No orders match your filters</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                                        className="text-orange-500 hover:underline text-sm mt-2"
                                    >
                                        Clear filters
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">
                    Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    )
}
