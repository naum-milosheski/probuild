import Link from 'next/link'
import { LogOut, AlertCircle } from 'lucide-react'
import { getCurrentPortalClient } from '@/lib/data/portal'
import PortalProviders from '@/components/portal/PortalProviders'
import { signOut } from '@/app/(auth)/login/actions'

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const client = await getCurrentPortalClient()

    if (!client) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-text-tertiary" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary">Access Denied</h1>
                <p className="text-text-secondary mt-2 max-w-md mx-auto">
                    We could not identify your client account. Please try logging in again.
                </p>
                <form action={signOut}>
                    <button type="submit" className="btn btn-primary mt-8">
                        Back to Login
                    </button>
                </form>
            </div>
        )
    }

    return (
        <PortalProviders clientId={client.id}>
            <div className="min-h-screen bg-bg-primary text-text-primary">
                {/* Top Navigation */}
                <header className="bg-bg-secondary border-b border-border-default sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        {/* Brand */}
                        <Link href="/portal" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <span className="font-mono font-bold text-white text-lg">P</span>
                            </div>
                            <span className="font-semibold text-lg tracking-tight text-text-primary">ProBuild Portal</span>
                        </Link>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block text-sm text-text-secondary">
                                <span className="text-text-tertiary">Account:</span> {client.company_name}
                            </div>
                            <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>
                            <form action={signOut}>
                                <button type="submit" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in pb-24">
                    {children}
                </main>
            </div>
        </PortalProviders>
    )
}
