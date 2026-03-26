'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Package, X } from 'lucide-react'
import type { Product } from '@/types'

interface ProductSearchDropdownProps {
    products: Product[]
    onSelect: (product: Product) => void
    onClose: () => void
    placeholder?: string
}

export default function ProductSearchDropdown({
    products,
    onSelect,
    onClose,
    placeholder = 'Search by name or SKU...'
}: ProductSearchDropdownProps) {
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    // Close on Escape
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const filtered = useMemo(() => {
        if (!query.trim()) return products.slice(0, 10)
        const q = query.toLowerCase()
        return products
            .filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.aliases.some(a => a.toLowerCase().includes(q))
            )
            .slice(0, 10)
    }, [query, products])

    return (
        <div ref={containerRef} className="absolute left-0 right-0 top-full mt-1 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-30 overflow-hidden animate-fade-in">
            {/* Search input */}
            <div className="p-2 border-b border-border-subtle">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="input pl-8 pr-8 py-1.5 text-sm"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-bg-tertiary rounded cursor-pointer"
                        >
                            <X className="w-3 h-3 text-text-tertiary" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="max-h-52 overflow-y-auto p-1">
                {filtered.length > 0 ? (
                    filtered.map(product => (
                        <button
                            key={product.id}
                            onClick={() => {
                                onSelect(product)
                                onClose()
                            }}
                            className="w-full text-left px-3 py-2 rounded text-sm hover:bg-bg-tertiary transition-colors flex items-center gap-3 group cursor-pointer"
                        >
                            <div className="p-1.5 bg-bg-tertiary rounded group-hover:bg-bg-elevated flex-shrink-0">
                                <Package className="w-3.5 h-3.5 text-text-tertiary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-text-primary truncate">{product.name}</p>
                                <p className="text-xs text-text-tertiary font-mono">{product.sku}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-text-secondary text-sm">${product.unit_price.toFixed(2)}</p>
                                <p className="text-xs text-text-tertiary">/{product.unit}</p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center py-4 text-text-tertiary text-sm">
                        No products match &quot;{query}&quot;
                    </div>
                )}
            </div>
        </div>
    )
}
