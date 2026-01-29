import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentPortalClient, getPortalOrders } from '@/lib/data/portal'
import { notFound } from 'next/navigation'
import OrdersList from './OrdersList'

export default async function PortalOrdersPage() {
    const client = await getCurrentPortalClient()
    if (!client) {
        return notFound()
    }

    const orders = await getPortalOrders(client.id)

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
                        <h1 className="text-2xl font-bold text-text-primary">Order History</h1>
                        <p className="text-text-secondary">Track past and current orders.</p>
                    </div>
                </div>
            </div>

            {/* Interactive Orders List */}
            <OrdersList initialOrders={orders as any} />
        </div>
    )
}
