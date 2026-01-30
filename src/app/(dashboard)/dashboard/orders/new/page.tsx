'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Sparkles,
    ArrowRight,
    Check,
    X,
    AlertTriangle,
    Loader2,
    Package,
    MapPin,
    FileText,
    ChevronDown,
    Edit2,
    Trash2,
    Users
} from 'lucide-react'
import type { MagicImportResult, MatchedItem, UnmatchedItem, Product } from '@/types'
import { addDemoOrder } from '@/lib/demo-orders'

type Step = 'input' | 'processing' | 'review' | 'confirm'

// Mock products for selection dropdown (same as API)
const MOCK_PRODUCTS: Product[] = [
    {
        id: '1', organization_id: 'org-1', sku: 'COP-050-L',
        name: '1/2" Copper Pipe Type L', description: '', category_id: 'cat-1',
        unit: 'ft', unit_price: 4.50, cost_price: 2.80, stock_qty: 500,
        min_stock_qty: 100, aliases: [], is_active: true,
        created_at: '', updated_at: ''
    },
    {
        id: '2', organization_id: 'org-1', sku: 'WNC-RED-100',
        name: 'Red Wire Nuts (100 pack)', description: '', category_id: 'cat-2',
        unit: 'box', unit_price: 12.99, cost_price: 7.50, stock_qty: 45,
        min_stock_qty: 20, aliases: [], is_active: true,
        created_at: '', updated_at: ''
    },
    {
        id: '3', organization_id: 'org-1', sku: 'ROM-12-2-250',
        name: 'Romex 12/2 NM-B Wire (250ft)', description: '', category_id: 'cat-2',
        unit: 'roll', unit_price: 189.99, cost_price: 145.00, stock_qty: 12,
        min_stock_qty: 5, aliases: [], is_active: true,
        created_at: '', updated_at: ''
    },
    {
        id: '4', organization_id: 'org-1', sku: 'PVC-ELB-075',
        name: '3/4" PVC 90° Elbow', description: '', category_id: 'cat-3',
        unit: 'each', unit_price: 1.25, cost_price: 0.65, stock_qty: 200,
        min_stock_qty: 50, aliases: [], is_active: true,
        created_at: '', updated_at: ''
    },
]

// Mock clients (matching seed data)
const MOCK_CLIENTS = [
    { id: '00000000-0000-0000-0002-000000000001', company_name: 'BuildRight Construction' },
    { id: '00000000-0000-0000-0002-000000000002', company_name: 'City Plumbers Inc' },
    { id: '00000000-0000-0000-0002-000000000003', company_name: 'Comfort Zone HVAC' },
]

export default function MagicImportPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('input')
    const [rawText, setRawText] = useState('')
    const [result, setResult] = useState<MagicImportResult | null>(null)
    const [editedItems, setEditedItems] = useState<MatchedItem[]>([])
    const [resolvedItems, setResolvedItems] = useState<MatchedItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const [selectedClient, setSelectedClient] = useState<typeof MOCK_CLIENTS[0] | null>(null)
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
    const [showClientDropdown, setShowClientDropdown] = useState(false)
    const clientDropdownRef = useRef<HTMLDivElement>(null)

    // Close client dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
                setShowClientDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const exampleTexts = [
        "Send 30ft of half-inch copper pipe and 2 boxes of those red wire nuts to the Job Site A.",
        "Need 500ft romex 12/2 and about 20 PVC elbows for the downtown project",
        "Hey can you drop off 3 boxes of wire nuts and some copper pipe at the Miller residence?"
    ]

    const handleSubmit = async () => {
        if (!rawText.trim()) return

        setStep('processing')
        setError(null)

        try {
            const response = await fetch('/api/ai/parse-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText })
            })

            if (!response.ok) {
                throw new Error('Failed to process order')
            }

            const data: MagicImportResult = await response.json()
            setResult(data)
            setEditedItems([...data.matched])
            setResolvedItems([])
            setStep('review')
        } catch (err) {
            setError('Failed to process order. Please try again.')
            setStep('input')
        }
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-success bg-success/10 border-success/30'
        if (confidence >= 0.7) return 'text-warning bg-warning/10 border-warning/30'
        if (confidence >= 0.5) return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
        return 'text-error bg-error/10 border-error/30'
    }

    const handleQuantityChange = (index: number, value: number) => {
        const updated = [...editedItems]
        updated[index] = { ...updated[index], quantity: value }
        setEditedItems(updated)
    }

    const handleRemoveItem = (index: number) => {
        setEditedItems(editedItems.filter((_, i) => i !== index))
    }

    const handleResolveUnmatched = (unmatched: UnmatchedItem, product: Product) => {
        const newMatched: MatchedItem = {
            extracted: unmatched.extracted,
            product,
            confidence: 1.0, // Manual selection = 100% confidence
            quantity: unmatched.extracted.quantity || 1,
            unit: unmatched.extracted.unit || product.unit
        }
        setResolvedItems([...resolvedItems, newMatched])
    }

    const handleConfirmOrder = () => {
        if (!selectedClient) return

        // Create demo order and save to sessionStorage
        const order = addDemoOrder({
            client: selectedClient,
            items: allItems,
            deliveryLocation: result?.delivery_location || null,
            notes: result?.notes || null,
        })

        setCreatedOrderId(order.id)
        setStep('confirm')
    }

    const allItems = [...editedItems, ...resolvedItems]
    const subtotal = allItems.reduce((sum, item) => sum + (item.product.unit_price * item.quantity), 0)
    const unresolvedCount = result ? result.unmatched.length - resolvedItems.length : 0

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-text-primary">Magic Import</h1>
                        <p className="text-text-secondary">Paste contractor text → AI creates structured order</p>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="overflow-x-auto pb-2 mb-4">
                <div className="flex items-center gap-4 text-sm min-w-max">
                    {['Input', 'Processing', 'Review', 'Confirm'].map((label, index) => {
                        const stepNames: Step[] = ['input', 'processing', 'review', 'confirm']
                        const isActive = step === stepNames[index]
                        const isPast = stepNames.indexOf(step) > index
                        return (
                            <div key={label} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isActive ? 'bg-orange-500 text-bg-primary' :
                                    isPast ? 'bg-success text-bg-primary' :
                                        'bg-bg-tertiary text-text-tertiary'
                                    }`}>
                                    {isPast ? <Check className="w-3 h-3" /> : index + 1}
                                </div>
                                <span className={isActive ? 'text-text-primary' : 'text-text-tertiary'}>
                                    {label}
                                </span>
                                {index < 3 && <ArrowRight className="w-4 h-4 text-text-tertiary" />}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Input Step */}
            {step === 'input' && (
                <div className="card space-y-4">
                    <label className="block">
                        <span className="text-text-secondary text-sm mb-2 block">
                            Paste the contractor&apos;s message below
                        </span>
                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="e.g., Send 30ft of half-inch copper pipe and 2 boxes of those red wire nuts to the Job Site A."
                            className="input min-h-[120px] resize-y"
                            autoFocus
                        />
                    </label>

                    {error && (
                        <div className="flex items-center gap-2 text-error text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-text-tertiary">
                            <span className="text-text-secondary">Try an example:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {exampleTexts.map((text, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setRawText(text)}
                                        className="px-2 py-1 bg-bg-tertiary hover:bg-bg-elevated rounded text-text-secondary hover:text-text-primary transition-colors truncate max-w-[200px]"
                                    >
                                        &quot;{text.slice(0, 30)}...&quot;
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!rawText.trim()}
                            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed justify-center"
                        >
                            <Sparkles className="w-4 h-4" />
                            Parse with AI
                        </button>
                    </div>
                </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
                <div className="card flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <div className="text-center">
                        <p className="text-text-primary font-medium">AI is parsing your order...</p>
                        <p className="text-text-tertiary text-sm mt-1">Extracting items and matching to inventory</p>
                    </div>
                </div>
            )}

            {/* Review Step */}
            {step === 'review' && result && (
                <div className="space-y-6">
                    {/* Original Text */}
                    <div className="card">
                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                            <FileText className="w-4 h-4" />
                            Original Message
                        </div>
                        <p className="text-text-primary bg-bg-tertiary p-3 rounded-md text-sm">
                            &quot;{rawText}&quot;
                        </p>
                        {result.delivery_location && (
                            <div className="flex items-center gap-2 mt-3 text-sm">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                <span className="text-text-secondary">Delivery:</span>
                                <span className="text-text-primary">{result.delivery_location}</span>
                            </div>
                        )}
                    </div>

                    {/* Client Selection */}
                    <div className="card">
                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
                            <Users className="w-4 h-4" />
                            Select Client
                        </div>
                        <div className="relative" ref={clientDropdownRef}>
                            <button
                                onClick={() => setShowClientDropdown(!showClientDropdown)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${selectedClient
                                        ? 'bg-bg-tertiary border-orange-500/50 text-text-primary'
                                        : 'bg-bg-secondary border-border-default text-text-secondary hover:border-border-hover'
                                    }`}
                            >
                                <span className={selectedClient ? 'font-medium' : ''}>
                                    {selectedClient?.company_name || 'Choose a client...'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showClientDropdown && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-20 overflow-hidden">
                                    <div className="p-2 border-b border-border-subtle">
                                        <span className="text-xs text-text-tertiary uppercase tracking-wide">Available Clients</span>
                                    </div>
                                    <div className="p-1 max-h-48 overflow-y-auto">
                                        {MOCK_CLIENTS.map(client => (
                                            <button
                                                key={client.id}
                                                onClick={() => {
                                                    setSelectedClient(client)
                                                    setShowClientDropdown(false)
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded text-sm flex items-center gap-3 transition-colors ${selectedClient?.id === client.id
                                                        ? 'bg-orange-500/10 text-orange-500'
                                                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                                    }`}
                                            >
                                                <Users className="w-4 h-4" />
                                                {client.company_name}
                                                {selectedClient?.id === client.id && (
                                                    <Check className="w-4 h-4 ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {!selectedClient && (
                            <p className="text-xs text-text-tertiary mt-2">
                                Please select a client to continue
                            </p>
                        )}
                    </div>

                    {/* Matched Items */}
                    {editedItems.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5 text-success" />
                                Matched Items ({editedItems.length})
                            </h3>
                            <div className="space-y-3">
                                {editedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-bg-tertiary rounded-lg border border-border-subtle"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getConfidenceColor(item.confidence)}`}>
                                                    {Math.round(item.confidence * 100)}%
                                                </span>
                                                <span className="font-mono text-xs text-text-tertiary">{item.product.sku}</span>
                                            </div>
                                            <p className="text-text-primary mt-1">{item.product.name}</p>
                                            <p className="text-xs text-text-tertiary mt-0.5">
                                                Extracted: &quot;{item.extracted.description}&quot;
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-border-default pt-3 sm:border-0 sm:pt-0">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                                    className="input w-20 text-center"
                                                    min="1"
                                                />
                                                <span className="text-text-secondary text-sm w-12">{item.unit}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-text-primary font-medium w-20 text-right">
                                                    ${(item.product.unit_price * item.quantity).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-2 text-text-tertiary hover:text-error transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unmatched Items */}
                    {result.unmatched.length > 0 && (
                        <div className="card border-warning/30">
                            <h3 className="text-lg font-medium text-warning mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Needs Review ({unresolvedCount} remaining)
                            </h3>
                            <div className="space-y-3">
                                {result.unmatched.map((item, index) => {
                                    const isResolved = resolvedItems.some(
                                        r => r.extracted.description === item.extracted.description
                                    )
                                    if (isResolved) return null

                                    return (
                                        <div
                                            key={index}
                                            className="p-3 bg-bg-tertiary rounded-lg border border-warning/20"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-text-primary">
                                                        &quot;{item.extracted.description}&quot;
                                                        {item.extracted.quantity && (
                                                            <span className="text-text-secondary ml-2">
                                                                × {item.extracted.quantity} {item.extracted.unit}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-text-tertiary mt-1">{item.reason}</p>
                                                </div>
                                            </div>
                                            {item.suggestions.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-text-secondary mb-2">Select a product:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.suggestions.map((suggestion, si) => (
                                                            <button
                                                                key={si}
                                                                onClick={() => handleResolveUnmatched(item, suggestion.product)}
                                                                className="px-3 py-1.5 bg-bg-elevated hover:bg-bg-hover border border-border-subtle hover:border-orange-500/50 rounded text-sm text-text-primary transition-colors"
                                                            >
                                                                {suggestion.product.name}
                                                                <span className="text-text-tertiary ml-2">
                                                                    ({Math.round(suggestion.similarity * 100)}%)
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                <select
                                                    onChange={(e) => {
                                                        const product = MOCK_PRODUCTS.find(p => p.id === e.target.value)
                                                        if (product) handleResolveUnmatched(item, product)
                                                    }}
                                                    className="input text-sm"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Or select from all products...</option>
                                                    {MOCK_PRODUCTS.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.sku} - {p.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Resolved Items */}
                    {resolvedItems.length > 0 && (
                        <div className="card border-success/30">
                            <h3 className="text-lg font-medium text-success mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Manually Resolved ({resolvedItems.length})
                            </h3>
                            <div className="space-y-2">
                                {resolvedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-success/5 rounded border border-success/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-text-tertiary">{item.product.sku}</span>
                                            <span className="text-text-primary">{item.product.name}</span>
                                        </div>
                                        <span className="text-text-secondary">× {item.quantity} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary & Actions */}
                    <div className="card bg-bg-elevated">
                        <div className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-text-secondary">Subtotal ({allItems.length} items)</p>
                                <p className="text-2xl font-semibold text-text-primary">${subtotal.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        setStep('input')
                                        setResult(null)
                                    }}
                                    className="btn btn-secondary w-full sm:w-auto justify-center"
                                >
                                    Start Over
                                </button>
                                <button
                                    onClick={handleConfirmOrder}
                                    disabled={unresolvedCount > 0 || !selectedClient}
                                    className="btn btn-primary disabled:opacity-50 w-full sm:w-auto justify-center"
                                >
                                    {unresolvedCount > 0
                                        ? `Resolve ${unresolvedCount} item${unresolvedCount > 1 ? 's' : ''} first`
                                        : !selectedClient
                                            ? 'Select a client first'
                                            : 'Create Order'
                                    }
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-text-tertiary mt-2">
                            Processed in {result.processing_ms}ms
                        </p>
                    </div>
                </div>
            )}

            {/* Confirm Step */}
            {step === 'confirm' && (
                <div className="card text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-success" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">Order Created!</h2>
                        <p className="text-text-secondary mt-1">
                            {allItems.length} items totaling ${subtotal.toFixed(2)}
                        </p>
                    </div>
                    <div className="flex justify-center gap-3 pt-4">
                        <button
                            onClick={() => {
                                setStep('input')
                                setRawText('')
                                setResult(null)
                                setEditedItems([])
                                setResolvedItems([])
                                setSelectedClient(null)
                                setCreatedOrderId(null)
                            }}
                            className="btn btn-secondary"
                        >
                            <Sparkles className="w-4 h-4" />
                            New Import
                        </button>
                        <button
                            onClick={() => router.push(createdOrderId ? `/dashboard/orders/${createdOrderId}` : '/dashboard/orders')}
                            className="btn btn-primary"
                        >
                            <Package className="w-4 h-4" />
                            View Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
