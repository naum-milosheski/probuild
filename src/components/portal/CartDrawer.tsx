'use client'

import { useCart } from '@/context/CartContext'
import { X, Minus, Plus, Trash2, Loader2, CheckCircle, Package } from 'lucide-react'
import { submitOrderAction } from '@/app/(portal)/portal/actions'
import { useState } from 'react'

interface CartDrawerProps {
    clientId: string
}

export default function CartDrawer({ clientId }: CartDrawerProps) {
    const {
        isDrawerOpen,
        closeDrawer,
        items,
        updateQuantity,
        removeItem,
        cartTotal,
        clearCart
    } = useCart()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!isDrawerOpen) return null

    const handleCheckout = async () => {
        setIsSubmitting(true)
        try {
            const result = await submitOrderAction(clientId, items)
            if (result.success) {
                setIsSuccess(true)
                setTimeout(() => {
                    clearCart()
                    setIsSuccess(false)
                    closeDrawer()
                }, 2000)
            } else {
                alert('Failed to submit order: ' + result.error)
            }
        } catch (err) {
            alert('An error occurred. Please try again.')
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={closeDrawer}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-md bg-bg-primary h-full shadow-2xl animate-slide-in-right flex flex-col border-l border-border-default">
                {/* Header */}
                <div className="p-4 border-b border-border-default flex items-center justify-between bg-bg-secondary">
                    <h2 className="font-semibold text-lg text-text-primary flex items-center gap-2">
                        Your Order
                        <span className="bg-orange-500/10 text-orange-500 text-xs px-2 py-0.5 rounded-full">
                            {items.length} items
                        </span>
                    </h2>
                    <button
                        onClick={closeDrawer}
                        className="p-2 hover:bg-bg-tertiary rounded-md text-text-secondary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-text-tertiary">
                            <Package className="w-16 h-16 mb-4 text-bg-tertiary" />
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <p className="text-sm">Start adding items from the catalog.</p>
                            <button
                                onClick={closeDrawer}
                                className="mt-6 text-orange-500 hover:text-orange-400 font-medium"
                            >
                                Browse Catalog
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 bg-bg-tertiary/50 rounded-lg border border-border-subtle">
                                {/* Thumbnail */}
                                <div className="w-16 h-16 bg-white rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 border border-border-subtle">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Package className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-text-primary truncate">{item.name}</h3>
                                    <p className="text-sm text-text-tertiary mb-2">{item.sku}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-bg-primary rounded-md border border-border-default px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="hover:text-orange-500"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-mono w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="hover:text-orange-500"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <p className="font-medium text-text-primary">
                                            ${(item.unit_price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-border-default bg-bg-secondary space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-text-secondary">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span>Est. Tax (8.25%)</span>
                                <span>${(cartTotal * 0.0825).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border-subtle">
                                <span>Total</span>
                                <span>${(cartTotal * 1.0825).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting || isSuccess}
                            className={`w-full py-3 rounded-lg font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer
                                ${isSuccess
                                    ? 'bg-green-500 text-white'
                                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                }
                                ${isSubmitting ? 'opacity-80 cursor-wait' : ''}
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : isSuccess ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Order Submitted!
                                </>
                            ) : (
                                'Submit Order'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
