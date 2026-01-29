import { getOrders } from '@/lib/data'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
    const { data: orders } = await getOrders({ limit: 50 })

    return <OrdersClient orders={orders as any} />
}
