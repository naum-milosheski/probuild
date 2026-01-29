import Link from 'next/link'
import { Package, Clock, CreditCard, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react'
import { getCurrentPortalClient, getPortalStats, getPortalRecentOrders } from '@/lib/data/portal'

export default async function ClientPortalPage() {
    const client = await getCurrentPortalClient()

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <AlertCircle className="w-12 h-12 text-text-tertiary mb-4" />
                <h1 className="text-2xl font-bold text-text-primary">Account Not Found</h1>
                <p className="text-text-secondary mt-2 max-w-md">
                    We couldn&apos;t identify your client account. Please contact ProBuild support or try logging in again.
                </p>
                <Link href="/login" className="btn btn-primary mt-6">
                    Back to Login
                </Link>
            </div>
        )
    }

    const [stats, recentOrders] = await Promise.all([
        getPortalStats(client.id),
        getPortalRecentOrders(client.id)
    ])

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Welcome, {client.company_name}</h1>
                <p className="text-text-secondary mt-1">Here is what&apos;s happening with your account today.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-md">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="font-medium text-text-secondary">Active Orders</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{stats.activeOrders}</p>
                    <p className="text-xs text-text-tertiary mt-1">Expected Deliveries</p>
                </div>

                <div className="card hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/10 rounded-md">
                            <CreditCard className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="font-medium text-text-secondary">Outstanding Balance</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">
                        ${stats.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                        Credit Limit: ${client.credit_limit?.toLocaleString()}
                    </p>
                </div>

                <div className="card hover:border-orange-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/10 rounded-md">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="font-medium text-text-secondary">Total Spend (YTD)</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">
                        ${stats.totalSpendYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">Lifetime value</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-text-primary">Recent Orders</h2>
                    <Link href="/portal/orders" className="text-sm text-orange-500 hover:text-orange-400 font-medium">
                        View all history
                    </Link>
                </div>

                <div className="space-y-4">
                    {recentOrders.length > 0 ? (
                        recentOrders.map((order: any) => (
                            <Link
                                href={`/portal/orders/${order.id}`}
                                key={order.id}
                                className="block"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg-tertiary/50 rounded-lg border border-border-subtle hover:border-border-default transition-colors group cursor-pointer hover:bg-bg-tertiary gap-4 sm:gap-0">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="p-2 bg-bg-elevated rounded-full flex-shrink-0">
                                            <Package className="w-5 h-5 text-text-secondary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-text-primary group-hover:text-orange-500 transition-colors truncate">
                                                {order.order_number}
                                            </p>
                                            <p className="text-sm text-text-tertiary truncate">
                                                {order.job_site?.name ? `Job Site: ${order.job_site.name}` : 'No job site'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-auto flex items-center justify-between sm:block sm:text-right pl-11 sm:pl-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' || order.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <p className="text-sm text-text-secondary font-mono sm:mt-1">
                                            ${order.total?.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-text-tertiary text-center py-4">No recent orders found.</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/portal/catalog" className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors flex items-center justify-between group">
                    <div>
                        <h3 className="font-semibold text-text-primary">Start New Order</h3>
                        <p className="text-sm text-text-secondary">Browse catalog & reorder items</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link href="/portal/invoices" className="p-4 rounded-lg bg-bg-elevated border border-border-default hover:border-text-tertiary transition-colors flex items-center justify-between group">
                    <div>
                        <h3 className="font-semibold text-text-primary">View Invoices</h3>
                        <p className="text-sm text-text-secondary">Download PDF statements</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-text-tertiary group-hover:text-text-primary group-hover:translate-x-1 transition-all" />
                </Link>
            </div>
        </div>
    )
}
