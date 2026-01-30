'use client'

import { useState, useEffect } from 'react'
import { Sidebar, Header } from './navigation'

export function DashboardShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Prevent body scrolling when sidebar is open on mobile (iOS Safari fix)
    useEffect(() => {
        if (sidebarOpen) {
            // Store current scroll position
            const scrollY = window.scrollY

            // Lock the body
            document.body.style.position = 'fixed'
            document.body.style.top = `-${scrollY}px`
            document.body.style.left = '0'
            document.body.style.right = '0'
            document.body.style.overflow = 'hidden'

            return () => {
                // Restore scroll position when sidebar closes
                document.body.style.position = ''
                document.body.style.top = ''
                document.body.style.left = ''
                document.body.style.right = ''
                document.body.style.overflow = ''
                window.scrollTo(0, scrollY)
            }
        }
    }, [sidebarOpen])

    return (
        <div className="min-h-screen bg-bg-primary">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            {/* Added transition for the margin-left on desktop if we ever want to make sidebar collapsible there too */}
            <div className="lg:pl-64 transition-[padding] duration-200">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
