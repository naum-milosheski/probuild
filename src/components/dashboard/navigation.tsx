'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Sparkles,
    Settings,
    LogOut,
    ChevronRight,
    Menu,
    X
} from 'lucide-react'
import { signOut } from '@/app/(auth)/login/actions'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Magic Import', href: '/dashboard/orders/new', icon: Sparkles },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
]

const bottomNav = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 h-[100dvh] bg-bg-secondary border-r border-border-subtle flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo & Close Button */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle">
                    <Link href="/dashboard" className="flex items-center gap-3" onClick={() => window.innerWidth < 1024 && onClose()}>
                        <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                            <Package className="w-5 h-5 text-bg-primary" />
                        </div>
                        <span className="font-semibold text-text-primary text-lg tracking-tight">
                            ProBuild
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 -mr-2 text-text-tertiary hover:text-text-primary"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isExactMatch = pathname === item.href
                        const isChildRoute = item.href !== '/dashboard' &&
                            pathname.startsWith(item.href + '/')
                        const hasMoreSpecificMatch = navigation.some(other =>
                            other.href !== item.href &&
                            other.href.startsWith(item.href) &&
                            (pathname === other.href || pathname.startsWith(other.href))
                        )
                        const isActive = isExactMatch || (isChildRoute && !hasMoreSpecificMatch)
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                <span>{item.name}</span>
                                {item.name === 'Magic Import' && (
                                    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-orange-500 text-bg-primary rounded">
                                        AI
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Navigation */}
                <div className="px-3 py-4 border-t border-border-subtle space-y-1">
                    {bottomNav.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}

                    <form action={signOut}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:text-error-500 hover:bg-error-500/10 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Log Out</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}

interface HeaderProps {
    onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname()

    // Generate breadcrumbs from pathname
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        return { href, label }
    })

    return (
        <header className="h-16 bg-bg-secondary border-b border-border-subtle flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-md flex-shrink-0"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm overflow-hidden whitespace-nowrap mask-linear-fade flex-1 min-w-0">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.href} className="flex items-center min-w-0">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 mx-1 md:mx-2 text-text-tertiary flex-shrink-0" />
                            )}
                            {index === breadcrumbs.length - 1 ? (
                                <span className="text-text-primary font-medium truncate">{crumb.label}</span>
                            ) : (
                                <Link
                                    href={crumb.href}
                                    className="text-text-secondary hover:text-text-primary transition-colors hidden sm:block truncate"
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>


        </header>
    )
}
