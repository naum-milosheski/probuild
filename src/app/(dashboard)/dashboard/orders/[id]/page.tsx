import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Package,
    MapPin,
    Calendar,
    Building2,
    Sparkles
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import StatusUpdater from './StatusUpdater'
import OrderActions from './OrderActions'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

async function getOrderDetails(orderId: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      client:clients(*),
      job_site:job_sites(*),
      items:order_items(
        *,
        product:products(*)
      )
    `)
        .eq('id', orderId)
        .eq('organization_id', DEFAULT_ORG_ID)
        .single()

    if (error || !order) {
        return null
    }

    return order
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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const order = await getOrderDetails(id)

    if (!order) {
        notFound()
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
                            {order.source === 'magic_import' && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-500 rounded flex-shrink-0">
                                    <Sparkles className="w-3 h-3" />
                                    AI Import
                                </span>
                            )}
                        </div>
                        <p className="text-text-secondary mt-1">
                            Created {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>

                <OrderActions orderNumber={order.order_number} />
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
                                <p className="text-text-secondary text-sm mt-1">
                                    Click to update status as you process this order
                                </p>
                            </div>
                            <StatusUpdater orderId={order.id} currentStatus={order.status} />
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
                                            {order.source === 'magic_import' && <th className="text-right">AI Conf.</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item: any) => (
                                            <tr key={item.id}>
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
                                                {order.source === 'magic_import' && (
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
                                                )}
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
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-bg-tertiary rounded-lg">
                                        <Building2 className="w-5 h-5 text-text-secondary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">{order.client.company_name}</p>
                                        <p className="text-sm text-text-secondary">{order.client.contact_name}</p>
                                    </div>
                                </div>
                                {order.client.email && (
                                    <p className="text-sm text-text-secondary">{order.client.email}</p>
                                )}
                                {order.client.phone && (
                                    <p className="text-sm text-text-secondary">{order.client.phone}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-text-tertiary">No client assigned</p>
                        )}
                    </div>

                    {/* Delivery Info */}
                    <div className="card">
                        <h2 className="text-sm text-text-tertiary uppercase tracking-wide mb-3">Delivery</h2>
                        {order.job_site ? (
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-bg-tertiary rounded-lg">
                                    <MapPin className="w-5 h-5 text-text-secondary" />
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{order.job_site.name}</p>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {order.job_site.address}
                                        {order.job_site.city && `, ${order.job_site.city}`}
                                        {order.job_site.state && `, ${order.job_site.state}`}
                                        {order.job_site.zip && ` ${order.job_site.zip}`}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-text-tertiary">No delivery location set</p>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="card">
                        <h2 className="text-sm text-text-tertiary uppercase tracking-wide mb-3">Timeline</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-bg-tertiary rounded">
                                    <Calendar className="w-4 h-4 text-text-tertiary" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-text-secondary">Created</p>
                                    <p className="text-text-tertiary">{formatDate(order.created_at)}</p>
                                </div>
                            </div>
                            {order.updated_at !== order.created_at && (
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-bg-tertiary rounded">
                                        <Calendar className="w-4 h-4 text-text-tertiary" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-text-secondary">Last Updated</p>
                                        <p className="text-text-tertiary">{formatDate(order.updated_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
