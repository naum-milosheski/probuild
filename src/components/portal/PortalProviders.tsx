'use client'

import { CartProvider } from '@/context/CartContext'
import CartDrawer from './CartDrawer'

interface PortalProvidersProps {
    children: React.ReactNode
    clientId: string
}

export default function PortalProviders({ children, clientId }: PortalProvidersProps) {
    return (
        <CartProvider>
            {children}
            <CartDrawer clientId={clientId} />
        </CartProvider>
    )
}
