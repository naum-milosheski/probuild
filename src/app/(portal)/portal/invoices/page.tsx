import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, DollarSign } from 'lucide-react'
import { getCurrentPortalClient, getPortalOrders } from '@/lib/data/portal'
import { notFound } from 'next/navigation'
import InvoiceDownloadButton from '@/components/portal/InvoiceDownloadButton'

export default async function PortalInvoicesPage() {
    const client = await getCurrentPortalClient()
    if (!client) return notFound()

    const allOrders = await getPortalOrders(client.id)

    // Filter for "Invoice-ready" statuses
    const invoices = allOrders.filter((o: any) =>
        ['delivered', 'paid', 'invoiced', 'confirmed'].includes(o.status)
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/portal"
                        className="p-2 -ml-2 hover:bg-bg-tertiary rounded-md transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Invoices</h1>
                        <p className="text-text-secondary">View and download billing statements.</p>
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                {invoices.length > 0 ? (
                    invoices.map((order: any) => (
                        <div
                            key={order.id}
                            className="bg-bg-tertiary/20 border border-border-subtle rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <FileText className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Invoice #{order.order_number}</h3>
                                    <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                                        <Calendar className="w-4 h-4 text-text-tertiary" />
                                        <span>Issued: {new Date(order.created_at).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-border-default mx-1"></span>
                                        <span className="uppercase text-xs font-semibold tracking-wide text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                                            {order.status === 'paid' ? 'PAID' : 'DUE'}
                                        </span>
                                    </div>
                                    {order.job_site && (
                                        <p className="text-xs text-text-tertiary mt-1">Ref: {order.job_site.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 sm:justify-end">
                                <div className="text-right">
                                    <p className="text-xs text-text-tertiary uppercase font-medium">Amount</p>
                                    <p className="text-lg font-bold text-text-primary font-mono">${order.total?.toFixed(2)}</p>
                                </div>
                                <InvoiceDownloadButton orderNumber={order.order_number} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-bg-tertiary/20 rounded-lg border-2 border-dashed border-border-subtle">
                        <DollarSign className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-text-primary">No invoices found</h3>
                        <p className="text-text-secondary mb-6">Completed orders will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
