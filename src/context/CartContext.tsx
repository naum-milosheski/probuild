'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Define simple types since we are in a hurry, or use shared types
export interface CartItem {
    id: string
    name: string
    sku: string
    unit_price: number
    quantity: number
    image_url?: string | null
    unit: string
}

interface CartContextType {
    items: CartItem[]
    isDrawerOpen: boolean
    openDrawer: () => void
    closeDrawer: () => void
    addItem: (product: any) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    cartTotal: number
    itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const openDrawer = () => setIsDrawerOpen(true)
    const closeDrawer = () => setIsDrawerOpen(false)

    const addItem = (product: any) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                sku: product.sku,
                unit_price: product.unit_price,
                image_url: product.image_url,
                unit: product.unit,
                quantity: 1
            }]
        })
        openDrawer()
    }

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        setItems(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ))
    }

    const clearCart = () => setItems([])

    const cartTotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CartContext.Provider value={{
            items,
            isDrawerOpen,
            openDrawer,
            closeDrawer,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            cartTotal,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
