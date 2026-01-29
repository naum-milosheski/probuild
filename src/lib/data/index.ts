import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Product, Client, Order, OrderItem, Category, JobSite } from '@/types'

// Direct Supabase client for server-side data fetching
// This bypasses cookie-based auth for simpler read operations
function getSupabaseClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Default organization ID for demo (matches seed data)
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

// ============================================
// PRODUCTS
// ============================================

export async function getProducts(options?: {
    categoryId?: string
    search?: string
    limit?: number
    offset?: number
}): Promise<{ data: Product[], count: number }> {
    const supabase = getSupabaseClient()

    let query = supabase
        .from('products')
        .select('*, category:categories(*)', { count: 'exact' })
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('is_active', true)
        .order('name')

    if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId)
    }

    if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options?.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching products:', error.message, error.code)
        return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
}

export async function getProductById(id: string): Promise<Product | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error.message)
        return null
    }

    return data
}

export async function getLowStockProducts(): Promise<Product[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('is_active', true)
        .order('stock_qty')

    if (error) {
        console.error('Error fetching low stock products:', error.message)
        return []
    }

    // Manual filter since Supabase doesn't support column-to-column comparisons easily
    return (data || []).filter(p => p.stock_qty < p.min_stock_qty)
}

// ============================================
// CLIENTS
// ============================================

export async function getClients(options?: {
    search?: string
    limit?: number
    offset?: number
}): Promise<{ data: Client[], count: number }> {
    const supabase = getSupabaseClient()

    let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('organization_id', DEFAULT_ORG_ID)
        .order('company_name')

    if (options?.search) {
        query = query.or(`company_name.ilike.%${options.search}%,contact_name.ilike.%${options.search}%`)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options?.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching clients:', error.message)
        return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
}

export async function getClientById(id: string): Promise<Client | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching client:', error.message)
        return null
    }

    return data
}

export async function getClientJobSites(clientId: string): Promise<JobSite[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('job_sites')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('name')

    if (error) {
        console.error('Error fetching job sites:', error.message)
        return []
    }

    return data || []
}

// ============================================
// ORDERS
// ============================================

export async function getOrders(options?: {
    status?: string
    clientId?: string
    limit?: number
    offset?: number
}): Promise<{ data: Order[], count: number }> {
    const supabase = getSupabaseClient()

    let query = supabase
        .from('orders')
        .select('*, client:clients(*), job_site:job_sites(*)', { count: 'exact' })
        .eq('organization_id', DEFAULT_ORG_ID)
        .order('created_at', { ascending: false })

    if (options?.status) {
        query = query.eq('status', options.status)
    }

    if (options?.clientId) {
        query = query.eq('client_id', options.clientId)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options?.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching orders:', error.message, error.code, error.hint)
        return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
}

export async function getRecentOrders(limit = 5): Promise<Order[]> {
    const { data } = await getOrders({ limit })
    return data
}

export async function getOrderById(id: string): Promise<Order | null> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('orders')
        .select('*, client:clients(*), job_site:job_sites(*), items:order_items(*, product:products(*))')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching order:', error.message)
        return null
    }

    return data
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('order_items')
        .select('*, product:products(*)')
        .eq('order_id', orderId)
        .order('created_at')

    if (error) {
        console.error('Error fetching order items:', error.message)
        return []
    }

    return data || []
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories(): Promise<Category[]> {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .order('name')

    if (error) {
        console.error('Error fetching categories:', error.message)
        return []
    }

    return data || []
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
    const supabase = getSupabaseClient()

    // Pending orders count
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', DEFAULT_ORG_ID)
        .in('status', ['pending', 'confirmed'])

    // Low stock count
    const { data: allProducts } = await supabase
        .from('products')
        .select('stock_qty, min_stock_qty')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('is_active', true)

    const lowStockCount = (allProducts || []).filter(p => p.stock_qty < p.min_stock_qty).length

    // Active clients count
    const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', DEFAULT_ORG_ID)

    // Revenue this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('organization_id', DEFAULT_ORG_ID)
        .gte('created_at', startOfMonth.toISOString())
        .in('status', ['delivered', 'invoiced', 'paid'])

    const monthlyRevenue = (monthOrders || []).reduce((sum, o) => sum + (o.total || 0), 0)

    return {
        pendingOrders: pendingOrders || 0,
        lowStockCount,
        activeClients: activeClients || 0,
        monthlyRevenue
    }
}
