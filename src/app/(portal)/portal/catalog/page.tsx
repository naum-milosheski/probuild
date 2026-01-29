import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { getPortalProducts } from '@/lib/data/portal'
import CatalogGrid from './CatalogGrid'

export default async function CatalogPage() {
    const products = await getPortalProducts()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/portal"
                    className="p-2 -ml-2 hover:bg-bg-tertiary rounded-md transition-colors text-text-secondary hover:text-text-primary"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-orange-500" />
                        Product Catalog
                    </h1>
                    <p className="text-text-secondary">Browse items and build your order.</p>
                </div>
            </div>

            <CatalogGrid initialProducts={products as any} />
        </div>
    )
}
