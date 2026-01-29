import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Clock, Download, Package, FileText, CheckCircle } from 'lucide-react'
import { getCurrentPortalClient, getPortalOrder } from '@/lib/data/portal'
import { notFound } from 'next/navigation'

export default async function PortalOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const client = await getCurrentPortalClient()
    if (!client) return notFound()

    const order = await getPortalOrder(id, client.id)
    if (!order) return notFound()

    return (
        <div className="space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link
                    href="/portal/orders"
                    className="p-2 -ml-2 hover:bg-bg-tertiary rounded-md transition-colors text-text-secondary hover:text-text-primary"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <h1 className="text-2xl font-bold text-text-primary">Order {order.order_number}</h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                            {order.status}
                        </span>
                    </div>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Line Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-bg-tertiary/20 border border-border-default rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-border-default bg-bg-tertiary/50">
                            <h2 className="font-semibold text-text-primary flex items-center gap-2">
                                <Package className="w-5 h-5 text-orange-500" />
                                Order Items
                            </h2>
                        </div>
                        <div className="divide-y divide-border-default">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-text-primary">{item.name}</p>
                                        <p className="text-sm text-text-tertiary font-mono">{item.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-text-secondary">
                                            {item.quantity} {item.unit} x ${item.unit_price.toFixed(2)}
                                        </p>
                                        <p className="font-semibold text-text-primary">
                                            ${item.line_total?.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-bg-tertiary/30 border-t border-border-default">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-text-secondary">Subtotal</span>
                                <span className="text-text-primary font-mono">${order.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-3">
                                <span className="text-text-secondary">Tax</span>
                                <span className="text-text-primary font-mono">${order.tax_amount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-border-subtle">
                                <span className="text-text-primary">Total</span>
                                <span className="text-orange-500 font-mono">${order.total?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Updates Placeholder */}
                    {order.status !== 'pending' && (
                        <div className="bg-bg-tertiary/20 border border-border-default rounded-lg p-6">
                            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-text-secondary" />
                                Order Timeline
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                                        <div className="w-0.5 h-full bg-border-default my-1"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">Order Created</p>
                                        <p className="text-xs text-text-tertiary">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                {/* Mock second step */}
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">Current Status: {order.status}</p>
                                        <p className="text-xs text-text-tertiary">Updated recently</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Meta Info */}
                <div className="space-y-6">
                    <div className="bg-bg-tertiary/20 border border-border-default rounded-lg p-6">
                        <h3 className="font-semibold text-text-primary mb-4">Delivery Details</h3>

                        {order.job_site ? (
                            <div className="flex gap-3 mb-4">
                                <MapPin className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-text-primary text-sm">{order.job_site.name}</p>
                                    <p className="text-sm text-text-secondary">{order.job_site.address}</p>
                                    <p className="text-sm text-text-secondary">
                                        {order.job_site.city}, {order.job_site.state} {order.job_site.zip}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-text-tertiary italic">No specific job site linked.</p>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-border-subtle">
                            <Calendar className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                            <div>
                                <p className="text-xs text-text-tertiary uppercase">Order Date</p>
                                <p className="text-sm text-text-primary">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-bg-tertiary/20 border border-border-default rounded-lg p-6">
                        <h3 className="font-semibold text-text-primary mb-4">Documents</h3>
                        <div className="space-y-2">
                            {(order.status === 'delivered' || order.status === 'paid' || order.status === 'invoiced') ? (
                                <button className="w-full flex items-center justify-between p-3 rounded-md bg-bg-elevated border border-border-default hover:border-orange-500/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-red-500/10 rounded">
                                            <FileText className="w-4 h-4 text-red-500" />
                                        </div>
                                        <span className="text-sm font-medium text-text-primary">Invoice.pdf</span>
                                    </div>
                                    <Download className="w-4 h-4 text-text-tertiary group-hover:text-text-primary" />
                                </button>
                            ) : (
                                <p className="text-sm text-text-tertiary">Invoice will be available once updated.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
