/* Database Types for ProBuild Supply */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

/* ============================================
   Core Entity Types
   ============================================ */

export interface Organization {
    id: string
    name: string
    slug: string
    settings: Json
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    organization_id: string
    email: string
    full_name: string
    role: 'owner' | 'admin' | 'staff'
    avatar_url: string | null
    created_at: string
}

export interface Client {
    id: string
    organization_id: string
    company_name: string
    contact_name: string | null
    email: string | null
    phone: string | null
    credit_limit: number
    payment_terms: number
    notes: string | null
    created_at: string
    updated_at: string
}

export interface JobSite {
    id: string
    client_id: string
    name: string
    address: string
    city: string | null
    state: string | null
    zip: string | null
    notes: string | null
    is_active: boolean
    created_at: string
}

export interface Category {
    id: string
    organization_id: string
    name: string
    slug: string
    parent_id: string | null
    created_at: string
}

export interface Product {
    id: string
    organization_id: string
    sku: string
    name: string
    description: string | null
    category_id: string | null
    unit: string
    unit_price: number
    cost_price: number | null
    stock_qty: number
    min_stock_qty: number
    aliases: string[]
    is_active: boolean
    created_at: string
    updated_at: string
    // Joined fields
    category?: Category
}

export type OrderStatus =
    | 'draft'
    | 'pending'
    | 'confirmed'
    | 'in_progress'
    | 'ready'
    | 'delivered'
    | 'invoiced'
    | 'paid'
    | 'cancelled'

export type OrderSource = 'manual' | 'magic_import' | 'client_portal'

export interface Order {
    id: string
    organization_id: string
    client_id: string | null
    job_site_id: string | null
    order_number: string
    status: OrderStatus
    subtotal: number
    tax_amount: number
    total: number
    notes: string | null
    source: OrderSource
    created_by: string | null
    created_at: string
    updated_at: string
    // Joined fields
    client?: Client
    job_site?: JobSite
    items?: OrderItem[]
}

export interface OrderItem {
    id: string
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
    created_at: string
    // Joined fields
    product?: Product
}

export interface MagicImportLog {
    id: string
    organization_id: string
    order_id: string | null
    raw_input: string
    parsed_result: ParsedOrderResult
    matched_items: MatchedItem[]
    unmatched_items: UnmatchedItem[]
    model_used: string | null
    processing_ms: number | null
    created_by: string | null
    created_at: string
}

/* ============================================
   Magic Import / AI Types
   ============================================ */

export interface ExtractedItem {
    description: string
    quantity: number | null
    unit: string | null
}

export interface ParsedOrderResult {
    items: ExtractedItem[]
    delivery_location: string | null
    notes: string | null
    raw_text: string
}

export interface ProductMatch {
    product: Product
    similarity: number
}

export interface MatchedItem {
    extracted: ExtractedItem
    product: Product
    confidence: number
    quantity: number
    unit: string
}

export interface UnmatchedItem {
    extracted: ExtractedItem
    suggestions: ProductMatch[]
    reason: string
}

export interface MagicImportResult {
    matched: MatchedItem[]
    unmatched: UnmatchedItem[]
    delivery_location: string | null
    notes: string | null
    processing_ms: number
    debug_method?: string
}

/* ============================================
   API Response Types
   ============================================ */

export interface ApiResponse<T> {
    data: T | null
    error: string | null
}

export interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    pageSize: number
    totalPages: number
}

/* ============================================
   Form Types
   ============================================ */

export interface CreateOrderFormData {
    client_id: string
    job_site_id?: string
    notes?: string
    items: {
        product_id: string
        quantity: number
        notes?: string
    }[]
}

export interface CreateProductFormData {
    sku: string
    name: string
    description?: string
    category_id?: string
    unit: string
    unit_price: number
    cost_price?: number
    stock_qty?: number
    min_stock_qty?: number
    aliases?: string[]
}

export interface CreateClientFormData {
    company_name: string
    contact_name?: string
    email?: string
    phone?: string
    credit_limit?: number
    payment_terms?: number
    notes?: string
}
