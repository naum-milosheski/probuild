'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    Filter,
    AlertTriangle,
    Package,
    ChevronRight,
    ChevronDown,
    X,
    ChevronLeft
} from 'lucide-react'
import Link from 'next/link'

interface Product {
    id: string
    sku: string
    name: string
    category_id: string | null
    unit: string
    unit_price: number
    stock_qty: number
    min_stock_qty: number
    is_active: boolean
}

interface Category {
    id: string
    name: string
}

const categoryColors: Record<string, string> = {
    'Plumbing': 'bg-info/10 text-info',
    'Electrical': 'bg-warning/10 text-warning',
    'HVAC': 'bg-orange-500/10 text-orange-400',
    'Tools & Equipment': 'bg-success/10 text-success',
}

function getStockStatus(stock: number, minStock: number): { label: string; class: string } {
    if (stock === 0) return { label: 'Out of Stock', class: 'text-error' }
    if (stock < minStock) return { label: 'Low Stock', class: 'text-warning' }
    return { label: 'In Stock', class: 'text-success' }
}

const ITEMS_PER_PAGE = 10

interface InventoryClientProps {
    products: Product[]
    categories: Category[]
    lowStockCount: number
    totalCount: number
}

export default function InventoryClient({
    products: allProducts,
    categories,
    lowStockCount,
    totalCount
}: InventoryClientProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('')
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [showMoreFilters, setShowMoreFilters] = useState(false)
    const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'in'>('all')
    const [currentPage, setCurrentPage] = useState(1)

    const categoryDropdownRef = useRef<HTMLDivElement>(null)
    const moreFiltersRef = useRef<HTMLDivElement>(null)

    // Create category map
    const categoryMap = useMemo(() =>
        new Map(categories.map(c => [c.id, c])),
        [categories]
    )

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setShowCategoryDropdown(false)
            }
            if (moreFiltersRef.current && !moreFiltersRef.current.contains(event.target as Node)) {
                setShowMoreFilters(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Filter products
    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            // Search filter
            const searchLower = searchQuery.toLowerCase()
            const category = product.category_id ? categoryMap.get(product.category_id) : null
            const matchesSearch = searchQuery === '' ||
                product.sku.toLowerCase().includes(searchLower) ||
                product.name.toLowerCase().includes(searchLower) ||
                category?.name.toLowerCase().includes(searchLower)

            // Category filter
            const matchesCategory = categoryFilter === '' || product.category_id === categoryFilter

            // Stock filter
            let matchesStock = true
            if (stockFilter === 'low') {
                matchesStock = product.stock_qty > 0 && product.stock_qty < product.min_stock_qty
            } else if (stockFilter === 'out') {
                matchesStock = product.stock_qty === 0
            } else if (stockFilter === 'in') {
                matchesStock = product.stock_qty >= product.min_stock_qty
            }

            return matchesSearch && matchesCategory && matchesStock
        })
    }, [allProducts, searchQuery, categoryFilter, stockFilter, categoryMap])

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredProducts, currentPage])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, categoryFilter, stockFilter])

    // Handle row click
    const handleRowClick = (productId: string) => {
        router.push(`/dashboard/inventory/${productId}`)
    }

    const selectedCategory = categoryFilter ? categoryMap.get(categoryFilter) : null
    const hasActiveFilters = searchQuery || categoryFilter || stockFilter !== 'all'

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Alert for low stock */}
            {lowStockCount > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-text-primary font-medium">Low Stock Alert</p>
                        <p className="text-text-secondary text-sm">{lowStockCount} product{lowStockCount !== 1 ? 's are' : ' is'} below minimum stock level</p>
                    </div>
                    <button
                        onClick={() => setStockFilter('low')}
                        className="btn btn-secondary text-sm w-full sm:w-auto justify-center"
                    >
                        View Items
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
                {/* Search Input - takes most space */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by SKU, name, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input w-full pr-10"
                        style={{ paddingLeft: '40px' }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-bg-tertiary rounded"
                        >
                            <X className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Category Dropdown - custom styled */}
                    <div className="relative flex-1 sm:flex-none" ref={categoryDropdownRef}>
                        <button
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            className={`btn flex items-center justify-between w-full sm:w-auto gap-2 min-w-[160px] ${categoryFilter ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            <span className="truncate">{selectedCategory?.name || 'All Categories'}</span>
                            {categoryFilter ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCategoryFilter(''); }}
                                    className="p-0.5 hover:bg-white/20 rounded ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            ) : (
                                <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {showCategoryDropdown && (
                            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-full sm:w-48 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-20">
                                <div className="p-2 border-b border-border-subtle">
                                    <span className="text-xs text-text-tertiary uppercase tracking-wide">Category</span>
                                </div>
                                <div className="p-1 max-h-64 overflow-y-auto">
                                    <button
                                        onClick={() => { setCategoryFilter(''); setShowCategoryDropdown(false); }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm cursor-pointer ${!categoryFilter ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => { setCategoryFilter(cat.id); setShowCategoryDropdown(false); }}
                                            className={`w-full text-left px-3 py-2 rounded text-sm cursor-pointer flex items-center gap-2 ${categoryFilter === cat.id ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                                        >
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[cat.name] || 'bg-bg-tertiary text-text-secondary'}`}>
                                                {cat.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* More Filters Dropdown */}
                    <div className="relative flex-1 sm:flex-none" ref={moreFiltersRef}>
                        <button
                            onClick={() => setShowMoreFilters(!showMoreFilters)}
                            className={`btn flex items-center justify-between w-full sm:w-auto gap-2 ${stockFilter !== 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                <span>
                                    {stockFilter === 'low' && 'Low Stock'}
                                    {stockFilter === 'out' && 'Out of Stock'}
                                    {stockFilter === 'in' && 'In Stock'}
                                    {stockFilter === 'all' && 'More Filters'}
                                </span>
                            </div>
                            {stockFilter !== 'all' ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setStockFilter('all'); }}
                                    className="p-0.5 hover:bg-white/20 rounded ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            ) : (
                                <ChevronDown className={`w-4 h-4 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {showMoreFilters && (
                            <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-full sm:w-48 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-20">
                                <div className="p-2 border-b border-border-subtle">
                                    <span className="text-xs text-text-tertiary uppercase tracking-wide">Stock Status</span>
                                </div>
                                <div className="p-1">
                                    {[
                                        { value: 'all', label: 'All Items' },
                                        { value: 'in', label: 'In Stock' },
                                        { value: 'low', label: 'Low Stock' },
                                        { value: 'out', label: 'Out of Stock' },
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => { setStockFilter(option.value as any); setShowMoreFilters(false); }}
                                            className={`w-full text-left px-3 py-2 rounded text-sm cursor-pointer ${stockFilter === option.value ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active filters indicator */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-tertiary">
                        Showing {filteredProducts.length} of {totalCount} products
                    </span>
                    <button
                        onClick={() => { setSearchQuery(''); setCategoryFilter(''); setStockFilter('all'); }}
                        className="text-orange-500 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Products Table */}
            <div className="card p-0 overflow-hidden border border-border-default">
                <div className="overflow-x-auto">
                    {paginatedProducts.length > 0 ? (
                        <table className="table fixed-layout-table min-w-[1000px]">
                            <colgroup>
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '35%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '6%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '4%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Unit</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map((product) => {
                                    const category = product.category_id ? categoryMap.get(product.category_id) : null
                                    const stockStatus = getStockStatus(product.stock_qty, product.min_stock_qty)

                                    return (
                                        <tr
                                            key={product.id}
                                            onClick={() => handleRowClick(product.id)}
                                            className="group cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
                                        >
                                            <td className="font-mono text-sm truncate">{product.sku}</td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-bg-tertiary rounded-md flex-shrink-0">
                                                        <Package className="w-4 h-4 text-text-tertiary" />
                                                    </div>
                                                    <span className="font-medium truncate">{product.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {category && (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium inline-block truncate max-w-full ${categoryColors[category.name] || 'bg-bg-tertiary text-text-secondary'}`}>
                                                        {category.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-text-secondary truncate">{product.unit}</td>
                                            <td className="font-medium">${product.unit_price.toFixed(2)}</td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className={product.stock_qty < product.min_stock_qty ? 'text-warning' : ''}>
                                                        {product.stock_qty}
                                                    </span>
                                                    <span className="text-text-tertiary text-xs whitespace-nowrap">
                                                        / min {product.min_stock_qty}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${stockStatus.class} whitespace-nowrap`}>
                                                    {stockStatus.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 text-text-tertiary">
                            {allProducts.length === 0 ? (
                                <>
                                    <p>No products yet</p>
                                    <Link href="/dashboard/inventory/new" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
                                        Add your first product
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p>No products match your filters</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setCategoryFilter(''); setStockFilter('all'); }}
                                        className="text-orange-500 hover:underline text-sm mt-2"
                                    >
                                        Clear filters
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm">
                <span className="text-text-tertiary">
                    Showing {filteredProducts.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                </span>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                            className="btn btn-secondary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum: number
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${currentPage === pageNum
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            className="btn btn-secondary flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
