'use client'

import { useState } from 'react'
import { Sidebar, Header } from './navigation'

export function DashboardShell({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

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
