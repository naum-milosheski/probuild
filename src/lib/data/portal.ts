import { createClient } from '@/lib/supabase/server'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

export interface PortalStats {
    activeOrders: number
    outstandingBalance: number
    totalSpendYTD: number
}

// Helper to get the authenticated, cookie-aware Supabase client
async function getSupabase() {
    return await createClient()
}

export async function getCurrentPortalClient() {
    const supabase = await getSupabase()

    // 1. Get logged in user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: client } = await supabase
            .from('clients')
            .select('*')
            .eq('auth_id', user.id)
            .single()
        if (client) return client
    }

    return null
}

export async function getPortalStats(clientId: string): Promise<PortalStats> {
    const supabase = await getSupabase()

    // Active Orders (Not delivered/cancelled)
    const { count: activeCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .neq('status', 'delivered')
        .neq('status', 'cancelled')

    // Outstanding Balance (Pending orders) - simplistic calculation
    const { data: pendingOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('client_id', clientId)
        .in('status', ['pending', 'invoiced', 'draft'])

    const outstandingBalance = pendingOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

    // Total Spend (Paid/Delivered orders)
    const { data: completedOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('client_id', clientId)
        .in('status', ['paid', 'delivered'])

    const totalSpendYTD = completedOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

    return {
        activeOrders: activeCount || 0,
        outstandingBalance,
        totalSpendYTD
    }
}

export async function getPortalRecentOrders(clientId: string, limit = 5) {
    const supabase = await getSupabase()

    const { data } = await supabase
        .from('orders')
        .select(`
            *,
            job_site:job_sites(name, address)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit)

    return data || []
}

export async function getPortalProducts(query = '') {
    const supabase = await getSupabase()

    let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('is_active', true)

    if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`)
    }

    const { data } = await queryBuilder.order('name')

    // Add fallback for missing images
    const productsWithImages = data?.map(p => ({
        ...p,
        image_url: p.image_url || `/images/products/${p.sku.toLowerCase().replace(/[-/]/g, '_')}.png`
    }))

    return productsWithImages || []
}

export async function getPortalOrders(clientId: string) {
    const supabase = await getSupabase()

    const { data } = await supabase
        .from('orders')
        .select(`
            *,
            job_site:job_sites(name, address)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

    return data || []
}

export async function getPortalOrder(orderId: string, clientId: string) {
    const supabase = await getSupabase()

    const { data: order } = await supabase
        .from('orders')
        .select(`
            *,
            job_site:job_sites(name, address, city, state, zip),
            items:order_items(*)
        `)
        .eq('id', orderId)
        .eq('client_id', clientId)
        .single()

    return order
}
