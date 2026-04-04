import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    AlertTriangle,
    Clock,
    Sparkles,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, getRecentOrders } from '@/lib/data'
import RecentOrdersTable from './RecentOrdersTable'

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

export default async function DashboardPage() {
    const [stats, recentOrders] = await Promise.all([
        getDashboardStats(),
        getRecentOrders(5)
    ])

    const statCards = [
        {
            name: 'Pending Orders',
            value: stats.pendingOrders.toString(),
            change: 'Needs attention',
            icon: ShoppingCart,
            href: '/dashboard/orders?status=pending'
        },
        {
            name: 'Low Stock Items',
            value: stats.lowStockCount.toString(),
            change: stats.lowStockCount > 0 ? 'Reorder needed' : 'All stocked',
            icon: AlertTriangle,
            color: stats.lowStockCount > 0 ? 'warning' : undefined,
            href: '/dashboard/inventory?filter=low-stock'
        },
        {
            name: 'Active Clients',
            value: stats.activeClients.toString(),
            change: 'Total accounts',
            icon: Users,
            href: '/dashboard/clients'
        },
        {
            name: 'Revenue (MTD)',
            value: `$${stats.monthlyRevenue.toLocaleString()}`,
            change: 'This month',
            icon: TrendingUp,
            color: 'success',
            // No href - not clickable
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
                    <p className="text-text-secondary mt-1">Welcome back. Here&apos;s what&apos;s happening today.</p>
                </div>
                <Link
                    href="/dashboard/orders/new"
                    className="btn btn-primary w-full md:w-auto justify-center"
                >
                    <Sparkles className="w-4 h-4" />
                    Magic Import
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon
                    const cardContent = (
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-text-secondary text-sm">{stat.name}</p>
                                <p className="text-2xl font-semibold text-text-primary mt-1">{stat.value}</p>
                                <p className={`text-xs mt-2 ${stat.color === 'success' ? 'text-success' :
                                    stat.color === 'warning' ? 'text-warning' :
                                        'text-text-tertiary'
                                    }`}>
                                    {stat.change}
                                </p>
                            </div>
                            <div className={`p-2 rounded-md ${stat.color === 'warning' ? 'bg-warning/10' :
                                stat.color === 'success' ? 'bg-success/10' :
                                    'bg-bg-tertiary'
                                }`}>
                                <Icon className={`w-5 h-5 ${stat.color === 'warning' ? 'text-warning' :
                                    stat.color === 'success' ? 'text-success' :
                                        'text-text-secondary group-hover:text-orange-500'
                                    } transition-colors`} />
                            </div>
                        </div>
                    )

                    // Clickable stat
                    if (stat.href) {
                        return (
                            <Link
                                key={stat.name}
                                href={stat.href}
                                className="card hover:border-border-default transition-colors group"
                            >
                                {cardContent}
                            </Link>
                        )
                    }

                    // Non-clickable stat (like Revenue)
                    return (
                        <div key={stat.name} className="card">
                            {cardContent}
                        </div>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text-primary">Recent Orders</h2>
                        <Link
                            href="/dashboard/orders"
                            className="text-sm text-text-secondary hover:text-orange-500 flex items-center gap-1 transition-colors"
                        >
                            View all
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <RecentOrdersTable orders={recentOrders as any} />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <Link
                            href="/dashboard/orders/new"
                            className="flex items-center gap-3 p-3 rounded-md border transition-colors group"
                            style={{
                                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                borderColor: 'rgba(212, 175, 55, 0.3)'
                            }}
                        >
                            <div className="p-2 rounded-md" style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)' }}>
                                <Sparkles className="w-4 h-4" style={{ color: '#D4AF37' }} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Magic Import</p>
                                <p className="text-xs text-text-tertiary">Paste or upload → Create order</p>
                            </div>
                            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#D4AF37' }} />
                        </Link>

                        <Link
                            href="/dashboard/orders/new?mode=manual"
                            className="flex items-center gap-3 p-3 rounded-md border border-border-subtle hover:bg-bg-tertiary transition-colors group"
                        >
                            <div className="p-2 bg-bg-tertiary rounded-md">
                                <ShoppingCart className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">New Order</p>
                                <p className="text-xs text-text-tertiary">Create manually</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link
                            href="/dashboard/inventory/new"
                            className="flex items-center gap-3 p-3 rounded-md border border-border-subtle hover:bg-bg-tertiary transition-colors group"
                        >
                            <div className="p-2 bg-bg-tertiary rounded-md">
                                <Package className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Add Product</p>
                                <p className="text-xs text-text-tertiary">New inventory item</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <Link
                            href="/dashboard/clients/new"
                            className="flex items-center gap-3 p-3 rounded-md border border-border-subtle hover:bg-bg-tertiary transition-colors group"
                        >
                            <div className="p-2 bg-bg-tertiary rounded-md">
                                <Users className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Add Client</p>
                                <p className="text-xs text-text-tertiary">New contractor</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
