'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    Filter,
    Building2,
    Phone,
    Mail,
    MapPin,
    ChevronRight,
    ChevronDown,
    ChevronLeft,
    X
} from 'lucide-react'
import Link from 'next/link'

interface Client {
    id: string
    company_name: string
    contact_name: string | null
    email: string | null
    phone: string | null
    credit_limit: number | null
    payment_terms: number | null
    jobSiteCount: number
}

const ITEMS_PER_PAGE = 4

interface ClientsClientProps {
    clients: Client[]
    totalJobSites: number
    totalCreditLimit: number
}

export default function ClientsClient({
    clients: allClients,
    totalJobSites,
    totalCreditLimit
}: ClientsClientProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [paymentTermsFilter, setPaymentTermsFilter] = useState<number | ''>('')
    const [currentPage, setCurrentPage] = useState(1)

    const filtersRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
                setShowFilters(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Filter clients
    const filteredClients = useMemo(() => {
        return allClients.filter(client => {
            // Search filter
            const searchLower = searchQuery.toLowerCase()
            const matchesSearch = searchQuery === '' ||
                client.company_name.toLowerCase().includes(searchLower) ||
                client.contact_name?.toLowerCase().includes(searchLower) ||
                client.email?.toLowerCase().includes(searchLower)

            // Payment terms filter
            const matchesPaymentTerms = paymentTermsFilter === '' ||
                client.payment_terms === paymentTermsFilter

            return matchesSearch && matchesPaymentTerms
        })
    }, [allClients, searchQuery, paymentTermsFilter])

    // Pagination
    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredClients.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredClients, currentPage])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, paymentTermsFilter])

    // Handle card click
    const handleCardClick = (clientId: string) => {
        router.push(`/dashboard/clients/${clientId}`)
    }

    const hasActiveFilters = searchQuery || paymentTermsFilter !== ''

    // Get unique payment terms for filter
    const availablePaymentTerms = useMemo(() => {
        const terms = new Set(allClients.map(c => c.payment_terms).filter(Boolean))
        return Array.from(terms).sort((a, b) => (a || 0) - (b || 0))
    }, [allClients])

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                    <p className="text-text-secondary text-sm">Total Clients</p>
                    <p className="text-2xl font-semibold text-text-primary mt-1">{allClients.length}</p>
                </div>
                <div className="card">
                    <p className="text-text-secondary text-sm">Total Job Sites</p>
                    <p className="text-2xl font-semibold text-text-primary mt-1">{totalJobSites}</p>
                </div>
                <div className="card">
                    <p className="text-text-secondary text-sm">Total Credit Limit</p>
                    <p className="text-2xl font-semibold text-text-primary mt-1">
                        ${totalCreditLimit.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by company, contact, or email..."
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

                {/* Filters Dropdown */}
                <div className="relative" ref={filtersRef}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn flex items-center justify-between w-full md:w-auto gap-2 ${paymentTermsFilter !== '' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <span>
                                {paymentTermsFilter !== '' ? `NET ${paymentTermsFilter}` : 'Filters'}
                            </span>
                        </div>
                        {paymentTermsFilter !== '' ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); setPaymentTermsFilter(''); }}
                                className="p-0.5 hover:bg-white/20 rounded ml-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        ) : (
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {showFilters && (
                        <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-20">
                            <div className="p-2 border-b border-border-subtle">
                                <span className="text-xs text-text-tertiary uppercase tracking-wide">Payment Terms</span>
                            </div>
                            <div className="p-1 max-h-64 overflow-y-auto">
                                <button
                                    onClick={() => { setPaymentTermsFilter(''); setShowFilters(false); }}
                                    className={`w-full text-left px-3 py-2 rounded text-sm cursor-pointer ${paymentTermsFilter === '' ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                                >
                                    All Terms
                                </button>
                                {availablePaymentTerms.map(term => (
                                    <button
                                        key={term}
                                        onClick={() => { setPaymentTermsFilter(term as number); setShowFilters(false); }}
                                        className={`w-full text-left px-3 py-2 rounded text-sm cursor-pointer ${paymentTermsFilter === term ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'}`}
                                    >
                                        NET {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Active filters indicator */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-tertiary">
                        Showing {filteredClients.length} of {allClients.length} clients
                    </span>
                    <button
                        onClick={() => { setSearchQuery(''); setPaymentTermsFilter(''); }}
                        className="text-orange-500 hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* Clients Grid */}
            {paginatedClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedClients.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => handleCardClick(client.id)}
                            className="card hover:border-orange-500/50 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-bg-tertiary rounded-lg group-hover:bg-orange-500/10 transition-colors">
                                        <Building2 className="w-5 h-5 text-text-secondary group-hover:text-orange-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-text-primary group-hover:text-orange-500 transition-colors">{client.company_name}</h3>
                                        <p className="text-sm text-text-secondary">{client.contact_name || 'No contact'}</p>
                                    </div>
                                </div>
                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm">
                                {client.email && (
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <Mail className="w-4 h-4" />
                                        {client.email}
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <Phone className="w-4 h-4" />
                                        {client.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <MapPin className="w-4 h-4" />
                                    {client.jobSiteCount} job site{client.jobSiteCount !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between text-sm">
                                <div>
                                    <span className="text-text-tertiary">Credit: </span>
                                    <span className="font-medium text-text-primary">
                                        ${(client.credit_limit || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-text-tertiary">
                                    NET {client.payment_terms || 30}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12 text-text-tertiary">
                    {allClients.length === 0 ? (
                        <>
                            <p>No clients yet</p>
                            <Link href="/dashboard/clients/new" className="text-orange-500 hover:underline text-sm mt-2 inline-block">
                                Add your first client
                            </Link>
                        </>
                    ) : (
                        <>
                            <p>No clients match your filters</p>
                            <button
                                onClick={() => { setSearchQuery(''); setPaymentTermsFilter(''); }}
                                className="text-orange-500 hover:underline text-sm mt-2"
                            >
                                Clear filters
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Pagination */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm">
                <span className="text-text-tertiary">
                    Showing {filteredClients.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredClients.length)} of {filteredClients.length} clients
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
