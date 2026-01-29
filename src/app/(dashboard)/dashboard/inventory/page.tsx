import { Plus } from 'lucide-react'
import Link from 'next/link'
import { getProducts, getLowStockProducts, getCategories } from '@/lib/data'
import InventoryClient from './InventoryClient'

export default async function InventoryPage() {
    const [{ data: products, count }, lowStockProducts, categories] = await Promise.all([
        getProducts({ limit: 100 }), // Fetch more, pagination is client-side
        getLowStockProducts(),
        getCategories()
    ])

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Inventory</h1>
                    <p className="text-text-secondary mt-1">Manage products and stock levels</p>
                </div>
                <Link href="/dashboard/inventory/new" className="btn btn-primary w-full md:w-auto justify-center">
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            {/* Client-side interactive content */}
            <InventoryClient
                products={products as any}
                categories={categories}
                lowStockCount={lowStockProducts.length}
                totalCount={count || products.length}
            />
        </div>
    )
}
