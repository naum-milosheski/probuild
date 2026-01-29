'use client'

import { useState, useMemo } from 'react'
import { Search, ShoppingCart, Plus, Minus, Package, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

interface Product {
    id: string
    name: string
    sku: string
    unit_price: number
    unit: string
    description?: string | null
    image_url?: string | null
}

interface CatalogGridProps {
    initialProducts: Product[]
}

type Cart = Record<string, number>

export default function CatalogGrid({ initialProducts }: CatalogGridProps) {
    const router = useRouter()
    const [search, setSearch] = useState('')

    // Use Global Cart Context
    const { items, addItem, removeItem, updateQuantity, openDrawer, itemCount, cartTotal } = useCart()

    // Filter products
    const filteredProducts = useMemo(() => {
        if (!search) return initialProducts
        const lower = search.toLowerCase()
        return initialProducts.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.sku.toLowerCase().includes(lower)
        )
    }, [initialProducts, search])

    // Helper to get qty from standard items array
    const getQty = (productId: string) => {
        return items.find(i => i.id === productId)?.quantity || 0
    }

    return (
        <div className="relative min-h-[80vh]">
            {/* Search Bar */}
            <div className="sticky top-0 z-30 bg-bg-primary py-4 mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-border-default rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    />
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
                    {filteredProducts.map(product => {
                        const qty = getQty(product.id)
                        return (
                            <div key={product.id} className={`card flex flex-col h-full transition-all duration-200 ${qty > 0 ? 'border-orange-500/50 ring-1 ring-orange-500/20' : ''}`}>
                                {/* Image Placeholder or Actual Image */}
                                <div className="aspect-square bg-white rounded-md mb-4 flex items-center justify-center overflow-hidden border border-border-subtle">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    ) : (
                                        <Package className="w-12 h-12 text-text-tertiary/50" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-text-primary line-clamp-2">{product.name}</h3>
                                    <p className="text-sm text-text-tertiary font-mono mb-2">{product.sku}</p>
                                    <p className="text-xl font-bold text-text-primary">
                                        ${product.unit_price.toFixed(2)}
                                        <span className="text-sm font-normal text-text-secondary ml-1">/{product.unit}</span>
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border-subtle">
                                    {qty === 0 ? (
                                        <button
                                            onClick={() => addItem(product)}
                                            className="w-full py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-default rounded-md text-text-primary font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add to Cart
                                        </button>
                                    ) : (
                                        <div className="flex items-center justify-between bg-bg-tertiary rounded-md p-1 border border-border-default">
                                            <button
                                                onClick={() => updateQuantity(product.id, qty - 1)}
                                                className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-bg-elevated rounded-md transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg text-text-primary">{qty}</span>
                                            <button
                                                onClick={() => addItem(product)}
                                                className="w-10 h-10 flex items-center justify-center text-orange-500 hover:bg-bg-elevated rounded-md transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-text-tertiary text-lg">No products found for "{search}"</p>
                </div>
            )}

            {/* Floating Cart Button (Mobile/Desktop) */}
            {itemCount > 0 && (
                <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40 animate-slide-up">
                    <div className="bg-bg-elevated border border-orange-500/30 shadow-2xl shadow-black/50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="p-3 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/20">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-bg-elevated">
                                    {itemCount}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary">Total Estimated</p>
                                <p className="text-xl font-bold text-text-primary">${cartTotal.toFixed(2)}</p>
                            </div>
                        </div>
                        <button
                            onClick={openDrawer}
                            className="px-6 py-3 bg-white text-black hover:bg-gray-100 font-bold rounded-lg transition-colors cursor-pointer"
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
