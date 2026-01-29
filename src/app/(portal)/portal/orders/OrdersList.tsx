'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Calendar, MapPin, ChevronRight, Package, X } from 'lucide-react'

interface Order {
    id: string
    order_number: string
    created_at: string
    status: string
    total: number
    job_site?: {
        name: string
    } | null
}

interface OrdersListProps {
    initialOrders: Order[]
}

export default function OrdersList({ initialOrders }: OrdersListProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string | null>(null) // null, 'active', 'completed'
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const filterRef = useRef<HTMLDivElement>(null)

    // Close filter when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [filterRef])

    const filteredOrders = useMemo(() => {
        return initialOrders.filter(order => {
            // 1. Search Match
            const searchLower = search.toLowerCase()
            const matchesSearch =
                order.order_number.toLowerCase().includes(searchLower) ||
                order.job_site?.name.toLowerCase().includes(searchLower)

            if (!matchesSearch) return false

            // 2. Status Filter
            if (statusFilter === 'active') {
                return !['delivered', 'cancelled'].includes(order.status)
            }
            if (statusFilter === 'completed') {
                return ['delivered', 'cancelled'].includes(order.status)
            }

            return true
        })
    }, [initialOrders, search, statusFilter])

    return (
        <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search by order # or job site..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-bg-tertiary border border-border-default rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-2 border rounded-md transition-colors cursor-pointer ${statusFilter
                            ? 'bg-orange-500/10 border-orange-500 text-orange-500'
                            : 'bg-bg-tertiary border-border-default text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>

                    {/* Filter Dropdown */}
                    {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-bg-elevated border border-border-default rounded-lg shadow-xl z-20 animate-fade-in p-1">
                            <button
                                onClick={() => { setStatusFilter(null); setIsFilterOpen(false) }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${!statusFilter ? 'bg-orange-500/10 text-orange-500 font-medium' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                            >
                                All Orders
                            </button>
                            <button
                                onClick={() => { setStatusFilter('active'); setIsFilterOpen(false) }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${statusFilter === 'active' ? 'bg-orange-500/10 text-orange-500 font-medium' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                            >
                                Active / Pending
                            </button>
                            <button
                                onClick={() => { setStatusFilter('completed'); setIsFilterOpen(false) }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${statusFilter === 'completed' ? 'bg-orange-500/10 text-orange-500 font-medium' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                            >
                                Completed History
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/portal/orders/${order.id}`} // Ensure this matches [id] folder structure
                            className="block bg-bg-tertiary/30 hover:bg-bg-tertiary/60 border border-border-subtle hover:border-orange-500/30 rounded-lg p-4 transition-all group relative"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    {/* Icon Box */}
                                    <div className={`p-3 rounded-full mt-1 flex-shrink-0 ${order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        <Package className="w-6 h-6" />
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3 mb-1">
                                            <h3 className="font-semibold text-text-primary text-lg">{order.order_number}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${order.status === 'delivered' || order.status === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-text-secondary">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-text-tertiary" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                            {order.job_site && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-text-tertiary" />
                                                    {order.job_site.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Total & Arrow */}
                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:pl-4 sm:border-l border-border-subtle mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-dashed sm:border-solid">
                                    <div className="text-right">
                                        <p className="text-xs text-text-tertiary uppercase font-medium">Total</p>
                                        <p className="text-xl font-bold text-text-primary font-mono">${order.total?.toFixed(2)}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-orange-500 transition-colors transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-12 bg-bg-tertiary/20 rounded-lg border-2 border-dashed border-border-subtle">
                        <Package className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-text-primary">No orders found</h3>
                        <p className="text-text-secondary mb-6">
                            {search || statusFilter ? 'Try adjusting your filters.' : 'Start your first order from the catalog.'}
                        </p>
                        {!search && !statusFilter && (
                            <Link href="/portal/catalog" className="btn btn-primary">
                                Browse Catalog
                            </Link>
                        )}
                        {(search || statusFilter) && (
                            <button
                                onClick={() => { setSearch(''); setStatusFilter(null) }}
                                className="text-orange-500 hover:underline font-medium"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
