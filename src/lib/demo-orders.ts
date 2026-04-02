/**
 * Demo Orders - SessionStorage utility for Magic Import orders
 * 
 * Stores orders created via Magic Import in the browser session.
 * These orders appear in the Orders list but aren't persisted to Supabase.
 */

import type { Order, OrderItem, Client, MatchedItem } from '@/types'

const STORAGE_KEY = 'probuild_demo_orders'

export interface DemoOrderItem {
    order_id: string
    product_id: string | null
    sku: string
    name: string
    quantity: number
    unit: string
    unit_price: number
    line_total: number
    notes: string | null
    ai_confidence: number | null
}

export interface DemoOrder {
    id: string
    client_id: string | null
    job_site_id: string | null
    order_number: string
    status: 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered'
    subtotal: number
    tax_amount: number
    total: number
    notes: string | null
    source: 'magic_import'
    created_at: string
    isDemo: true
    items: DemoOrderItem[]
    client?: {
        id: string
        company_name: string
        contact_name: string | null
        email: string | null
        phone: string | null
    }
    job_site?: {
        name: string
        address: string | null
        city: string | null
        state: string | null
        zip: string | null
    }
}

/**
 * Get all demo orders from sessionStorage
 */
export function getDemoOrders(): DemoOrder[] {
    if (typeof window === 'undefined') return []

    try {
        const stored = sessionStorage.getItem(STORAGE_KEY)
        if (!stored) return []
        return JSON.parse(stored)
    } catch {
        return []
    }
}

/**
 * Get a single demo order by ID
 */
export function getDemoOrderById(id: string): DemoOrder | null {
    const orders = getDemoOrders()
    return orders.find(order => order.id === id) || null
}

/**
 * Generate a unique order number for demo orders
 */
function generateOrderNumber(): string {
    const orders = getDemoOrders()
    const demoCount = orders.length + 1
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
    return `ORD-DEMO-${timestamp}-${demoCount.toString().padStart(3, '0')}`
}

/**
 * Generate a UUID for the order
 */
function generateId(): string {
    return `demo-${crypto.randomUUID()}`
}

interface CreateDemoOrderParams {
    client: Pick<Client, 'id' | 'company_name' | 'contact_name' | 'email' | 'phone'>
    items: MatchedItem[]
    deliveryLocation: string | null
    notes: string | null
}

/**
 * Create a new demo order and save to sessionStorage
 */
export function addDemoOrder(params: CreateDemoOrderParams): DemoOrder {
    const { client, items, deliveryLocation, notes } = params

    const orderId = generateId()
    const orderNumber = generateOrderNumber()

    // Calculate totals
    const subtotal = items.reduce(
        (sum, item) => sum + (item.product.unit_price * item.quantity),
        0
    )
    const taxRate = 0.0825 // 8.25% Texas tax rate from seed
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    // Build order items
    const orderItems: DemoOrderItem[] = items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.product.unit_price,
        line_total: item.product.unit_price * item.quantity,
        notes: null,
        ai_confidence: item.confidence,
    }))

    // Build full order
    const order: DemoOrder = {
        id: orderId,
        client_id: client.id,
        job_site_id: null,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        tax_amount: taxAmount,
        total,
        notes: notes || null,
        source: 'magic_import',
        created_at: new Date().toISOString(),
        isDemo: true,
        items: orderItems,
        // Add client info for display
        client: {
            id: client.id,
            company_name: client.company_name,
            contact_name: client.contact_name ?? null,
            email: client.email ?? null,
            phone: client.phone ?? null,
        },
        // Add job site from AI-extracted delivery location (clean punctuation)
        job_site: deliveryLocation ? {
            name: deliveryLocation.replace(/[?!.]+$/, '').trim(),
            address: null,
            city: null,
            state: null,
            zip: null,
        } : undefined,
    }

    // Save to sessionStorage
    const existingOrders = getDemoOrders()
    const updatedOrders = [order, ...existingOrders]

    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders))
    } catch (e) {
        console.error('Failed to save demo order:', e)
    }

    return order
}

/**
 * Clear all demo orders (useful for testing)
 */
export function clearDemoOrders(): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(STORAGE_KEY)
}
