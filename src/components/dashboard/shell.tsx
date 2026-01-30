'use client'

import { useState, useEffect } from 'react'
import { Sidebar, Header } from './navigation'

export function DashboardShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Prevent body scrolling when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = ''
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
