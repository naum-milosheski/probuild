'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export type ProductFormState = {
    success?: boolean
    error?: string
    fieldErrors?: Record<string, string>
}

export async function createProduct(
    prevState: ProductFormState,
    formData: FormData
): Promise<ProductFormState> {
    const supabase = getSupabase()

    const sku = formData.get('sku') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('category_id') as string
    const unit = formData.get('unit') as string
    const unitPrice = parseFloat(formData.get('unit_price') as string)
    const costPrice = parseFloat(formData.get('cost_price') as string) || null
    const stockQty = parseFloat(formData.get('stock_qty') as string) || 0
    const minStockQty = parseFloat(formData.get('min_stock_qty') as string) || 0
    const aliasesRaw = formData.get('aliases') as string
    const aliases = aliasesRaw ? aliasesRaw.split(',').map(a => a.trim()).filter(Boolean) : []
    const imageUrl = formData.get('image_url') as string

    // Validation
    const fieldErrors: Record<string, string> = {}
    if (!sku) fieldErrors.sku = 'SKU is required'
    if (!name) fieldErrors.name = 'Product name is required'
    if (!unit) fieldErrors.unit = 'Unit is required'
    if (isNaN(unitPrice) || unitPrice <= 0) fieldErrors.unit_price = 'Valid price is required'

    if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors }
    }

    const { error } = await supabase.from('products').insert({
        organization_id: DEFAULT_ORG_ID,
        sku,
        name,
        description: description || null,
        category_id: categoryId || null,
        unit,
        unit_price: unitPrice,
        cost_price: costPrice,
        stock_qty: stockQty,
        min_stock_qty: minStockQty,
        aliases,
        image_url: imageUrl || null,
        is_active: true,
    })

    if (error) {
        if (error.code === '23505') {
            return { error: 'A product with this SKU already exists' }
        }
        return { error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    redirect('/dashboard/inventory')
}

export async function updateProduct(
    productId: string,
    prevState: ProductFormState,
    formData: FormData
): Promise<ProductFormState> {
    const supabase = getSupabase()

    const sku = formData.get('sku') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('category_id') as string
    const unit = formData.get('unit') as string
    const unitPrice = parseFloat(formData.get('unit_price') as string)
    const costPrice = parseFloat(formData.get('cost_price') as string) || null
    const stockQty = parseFloat(formData.get('stock_qty') as string) || 0
    const minStockQty = parseFloat(formData.get('min_stock_qty') as string) || 0
    const aliasesRaw = formData.get('aliases') as string
    const aliases = aliasesRaw ? aliasesRaw.split(',').map(a => a.trim()).filter(Boolean) : []
    const isActive = formData.get('is_active') === 'true'
    const imageUrl = formData.get('image_url') as string

    // Validation
    const fieldErrors: Record<string, string> = {}
    if (!sku) fieldErrors.sku = 'SKU is required'
    if (!name) fieldErrors.name = 'Product name is required'
    if (!unit) fieldErrors.unit = 'Unit is required'
    if (isNaN(unitPrice) || unitPrice <= 0) fieldErrors.unit_price = 'Valid price is required'

    if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors }
    }

    const { error } = await supabase
        .from('products')
        .update({
            sku,
            name,
            description: description || null,
            category_id: categoryId || null,
            unit,
            unit_price: unitPrice,
            cost_price: costPrice,
            stock_qty: stockQty,
            min_stock_qty: minStockQty,
            aliases,
            image_url: imageUrl || null,
            is_active: isActive,
            updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .eq('organization_id', DEFAULT_ORG_ID)

    if (error) {
        if (error.code === '23505') {
            return { error: 'A product with this SKU already exists' }
        }
        return { error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    revalidatePath(`/dashboard/inventory/${productId}`)
    redirect('/dashboard/inventory')
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase()

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('organization_id', DEFAULT_ORG_ID)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/inventory')
    return { success: true }
}
