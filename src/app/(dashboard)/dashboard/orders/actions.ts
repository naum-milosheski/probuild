'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
        .from('orders')
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('organization_id', DEFAULT_ORG_ID)

    if (error) {
        console.error('Error updating order status:', error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/orders')
    revalidatePath(`/dashboard/orders/${orderId}`)

    return { success: true }
}
