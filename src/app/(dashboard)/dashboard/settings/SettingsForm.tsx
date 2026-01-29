'use client'

import { useActionState, useState, useEffect } from 'react'
import { Building2, User, Bell, Shield, Mail, Phone, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateOrganizationAction } from './actions'

interface SettingsFormProps {
    user: any
    organization: any
}

// Helper to safely access JSONB settings
const getSetting = (org: any, path: string[], defaultValue: any = '') => {
    let current = org?.settings || {}
    for (const key of path) {
        if (current[key] === undefined) return defaultValue
        current = current[key]
    }
    return current
}

export default function SettingsForm({ user, organization }: SettingsFormProps) {
    const [state, formAction, isPending] = useActionState(updateOrganizationAction, null)
    const [showSuccess, setShowSuccess] = useState(false)

    // Initial State to check against
    const initialValues = {
        name: organization?.name || '',
        supportEmail: getSetting(organization, ['supportEmail']),
        supportPhone: getSetting(organization, ['supportPhone']),
        address: getSetting(organization, ['address']),
        notify_newOrderAlerts: getSetting(organization, ['notifications', 'newOrderAlerts'], true),
        notify_inventoryWarnings: getSetting(organization, ['notifications', 'inventoryWarnings'], true),
        notify_weeklyReports: getSetting(organization, ['notifications', 'weeklyReports'], true),
    }

    const [formData, setFormData] = useState(initialValues)
    const [isDirty, setIsDirty] = useState(false)

    // Check for dirty state whenever formData changes
    useEffect(() => {
        const isModified = JSON.stringify(formData) !== JSON.stringify(initialValues)
        setIsDirty(isModified)
    }, [formData, initialValues])

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Show success toast on successful server action
    useEffect(() => {
        if (state?.success) {
            setShowSuccess(true)
            // Reset "initial" to current so button disables again? 
            // Ideally we'd revalidate path and props would update, but strict equality check might fail.
            // For now, let's just show toast. Reloading page resets state.
            const timer = setTimeout(() => setShowSuccess(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [state])

    return (
        <form action={formAction} className="space-y-6 pb-24 lg:pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Organization */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Organization Profile */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-default">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary">Organization Profile</h2>
                                <p className="text-sm text-text-tertiary">Company details and branding</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Company Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    className="input w-full"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Company Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Slug</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">probuild.com/</span>
                                    <input
                                        type="text"
                                        className="input w-full pl-28 bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                                        value={organization?.slug || ''}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Support Email</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                                        <Mail className="w-4 h-4 text-text-tertiary" />
                                    </div>
                                    <input
                                        name="supportEmail"
                                        type="email"
                                        className="input w-full pl-12"
                                        value={formData.supportEmail}
                                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                                        placeholder="support@company.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Support Phone</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                                        <Phone className="w-4 h-4 text-text-tertiary" />
                                    </div>
                                    <input
                                        name="supportPhone"
                                        type="tel"
                                        className="input w-full pl-12"
                                        value={formData.supportPhone}
                                        onChange={(e) => handleChange('supportPhone', e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Address</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3 w-5 h-5 flex items-center justify-center pointer-events-none">
                                        <MapPin className="w-4 h-4 text-text-tertiary" />
                                    </div>
                                    <textarea
                                        name="address"
                                        className="input w-full pl-12 min-h-[80px] py-2"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="123 Business St, Suite 100&#10;City, State 12345"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 justify-end hidden lg:flex">
                            {/* Success / Error Messages near button */}
                            {state?.error && (
                                <div className="text-sm text-red-500 flex items-center gap-2 mr-4 animate-fade-in">
                                    <AlertCircle className="w-4 h-4" />
                                    {state.error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending || !isDirty}
                                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center transition-all"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - User & Preferences */}
                <div className="space-y-6">
                    {/* User Profile */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-default">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary">My Account</h2>
                                <p className="text-sm text-text-tertiary">ProBuild Admin</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl font-bold">
                                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-text-primary">Avatar</div>
                                    <p className="text-xs text-text-tertiary mb-2">JPG, GIF or PNG. Max 1MB.</p>
                                    <button type="button" className="text-xs text-orange-500 hover:text-orange-400 font-medium cursor-not-allowed opacity-50" title="Coming soon">Upload new picture</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Email</label>
                                <input
                                    type="email"
                                    className="input w-full bg-bg-tertiary text-text-tertiary cursor-not-allowed"
                                    value={user?.email || ''}
                                    readOnly
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">Role</label>
                                <div className="flex items-center gap-2 max-w-max px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-xs font-medium text-orange-500">
                                    <Shield className="w-3 h-3" />
                                    Administrator
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-default">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                <Bell className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'newOrderAlerts', label: 'New Order Alerts', desc: 'Email when a client places an order' },
                                { key: 'inventoryWarnings', label: 'Inventory Warnings', desc: 'When stock drops below minimum' },
                                { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Summary of sales and activity' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-text-secondary">{item.label}</div>
                                        <div className="text-xs text-text-tertiary">{item.desc}</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        {/* We use hidden input to control value because checkboxes are tricky with simple state binding in map */}
                                        <input
                                            type="hidden"
                                            name={`notify_${item.key}`}
                                            value={formData[`notify_${item.key}` as keyof typeof formData] ? 'on' : 'off'}
                                        />
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData[`notify_${item.key}` as keyof typeof formData] as boolean}
                                            onChange={(e) => handleChange(`notify_${item.key}`, e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Save Button (Fixed at bottom or end of flow) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-bg-primary border-t border-border-default z-10 flex flex-col gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0 md:mt-6">
                {/* Success / Error Messages for mobile */}
                {state?.error && (
                    <div className="text-sm text-red-500 flex items-center gap-2 mb-2 animate-fade-in">
                        <AlertCircle className="w-4 h-4" />
                        {state.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending || !isDirty}
                    className="btn btn-primary w-full justify-center py-3 text-base shadow-lg md:shadow-none bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>

            {/* Success Toast */}
            {
                showSuccess && (
                    <div className="fixed bottom-6 right-6 z-50 bg-bg-secondary border border-green-500/20 shadow-lg rounded-lg p-4 flex items-center gap-3 text-sm animate-slide-up-fade">
                        <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-text-primary">Success</h4>
                            <p className="text-text-secondary">Changes saved successfully.</p>
                        </div>
                    </div>
                )
            }
        </form >
    )
}
