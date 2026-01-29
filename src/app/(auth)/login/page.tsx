'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { login } from './actions'

const initialState: { error: string | null } = {
    error: null,
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                            ProBuild Supply
                        </h1>
                    </div>
                    <p className="mt-2 text-text-secondary">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <form action={formAction} className="card space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm text-text-secondary mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@company.com"
                                className="input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm text-text-secondary mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input w-full pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {state?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2 text-red-500 text-sm animate-fade-in">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{state.error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                            <input type="checkbox" className="rounded border-border-default bg-bg-tertiary" />
                            Remember me
                        </label>
                        <a href="#" className="text-orange-500 hover:text-orange-400">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="btn btn-primary w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-2" />
                            </>
                        )}
                    </button>

                    <div className="mt-6 pt-6 border-t border-border-subtle">
                        <p className="text-xs text-text-tertiary text-center mb-3">
                            Portfolio Demo Access
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-2 bg-bg-tertiary rounded border border-border-subtle">
                                <span className="block font-medium text-orange-500 mb-1">Admin View</span>
                                <div className="text-text-secondary select-all">admin@test.com</div>
                                <div className="text-text-tertiary font-mono"><span className="text-text-secondary opacity-50 select-none">password:</span> admin</div>
                            </div>
                            <div className="p-2 bg-bg-tertiary rounded border border-border-subtle">
                                <span className="block font-medium text-blue-500 mb-1">Client View</span>
                                <div className="text-text-secondary select-all">client@test.com</div>
                                <div className="text-text-tertiary font-mono"><span className="text-text-secondary opacity-50 select-none">password:</span> client</div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
