'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

interface CartItem {
    id: string
    quantity: number
    unit_price: number
    unit: string
    name: string
    sku: string
}

export async function submitOrderAction(clientId: string, items: CartItem[]) {
    // Note: In a real app, we would derive clientId from the authenticated session
    // to prevent spoofing. For this demo/phase, passing it is acceptable.

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    const taxRate = 0.0825 // Mock tax rate
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    // 2. Get client details for defaults (job site, etc)
    // For MVP, we pick the first active job site or null
    const { data: jobSites } = await supabase
        .from('job_sites')
        .select('id')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .limit(1)

    const jobSiteId = jobSites?.[0]?.id || null

    // 3. Create Order
    // Generate a simple order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    const { data: client } = await supabase.from('clients').select('organization_id').eq('id', clientId).single()
    if (!client) return { error: 'Client not found' }

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            organization_id: client.organization_id,
            client_id: clientId,
            job_site_id: jobSiteId,
            order_number: orderNumber,
            status: 'pending',
            source: 'client_portal',
            subtotal,
            tax_amount: taxAmount,
            total,
            notes: 'Submitted via Portal'
        })
        .select()
        .single()

    if (orderError) {
        console.error('Order creation failed:', orderError)
        return { error: 'Failed to create order' }
    }

    // 4. Create Order Items
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price
    }))

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

    if (itemsError) {
        console.error('Order items failed:', itemsError)
        // Ideally we would rollback here
        return { error: 'Failed to add items to order' }
    }

    revalidatePath('/portal')
    return { success: true, orderId: order.id }
}
