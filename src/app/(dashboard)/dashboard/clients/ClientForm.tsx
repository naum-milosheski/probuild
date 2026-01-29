'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Building2 } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import { createClientAction, updateClientAction, type ClientFormState } from './actions'

interface Client {
    id: string
    company_name: string
    contact_name: string | null
    email: string | null
    phone: string | null
    credit_limit: number
    payment_terms: number
    notes: string | null
}

interface ClientFormProps {
    client?: Client
}

const PAYMENT_TERMS = [
    { value: '0', label: 'Due on Receipt' },
    { value: '15', label: 'NET 15' },
    { value: '30', label: 'NET 30' },
    { value: '45', label: 'NET 45' },
    { value: '60', label: 'NET 60' },
]

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus()

    return (
        <button type="submit" disabled={pending} className="btn btn-primary justify-center w-full md:w-auto">
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Save className="w-4 h-4" />
            )}
            {isEdit ? 'Save Changes' : 'Create Client'}
        </button>
    )
}

export default function ClientForm({ client }: ClientFormProps) {
    const isEdit = !!client

    const action = isEdit
        ? updateClientAction.bind(null, client.id)
        : createClientAction

    const [paymentTerms, setPaymentTerms] = useState(client?.payment_terms?.toString() || '30')

    const [state, formAction] = useActionState<ClientFormState, FormData>(action, {})

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/clients"
                    className="p-2 hover:bg-bg-tertiary rounded-md transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text-secondary" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">
                        {isEdit ? 'Edit Client' : 'Add New Client'}
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {isEdit ? `Editing ${client.company_name}` : 'Create a new contractor account'}
                    </p>
                </div>
            </div>

            {/* Error Banner */}
            {state.error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                    {state.error}
                </div>
            )}

            <form action={formAction} className="space-y-6">
                {/* Company Info Card */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Building2 className="w-5 h-5 text-orange-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary">Company Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Company Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Company Name <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                defaultValue={client?.company_name}
                                placeholder="e.g., BuildRight Construction"
                                className={`input ${state.fieldErrors?.company_name ? 'border-error' : ''}`}
                            />
                            {state.fieldErrors?.company_name && (
                                <p className="text-error text-sm mt-1">{state.fieldErrors.company_name}</p>
                            )}
                        </div>

                        {/* Contact Name */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Contact Name
                            </label>
                            <input
                                type="text"
                                name="contact_name"
                                defaultValue={client?.contact_name || ''}
                                placeholder="e.g., Mike Rodriguez"
                                className="input"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                defaultValue={client?.phone || ''}
                                placeholder="(555) 123-4567"
                                className="input"
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                defaultValue={client?.email || ''}
                                placeholder="contact@company.com"
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Billing & Credit Card */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Billing & Credit</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Credit Limit */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Credit Limit ($)
                            </label>
                            <input
                                type="number"
                                name="credit_limit"
                                defaultValue={client?.credit_limit || 0}
                                placeholder="0"
                                min="0"
                                step="100"
                                className="input"
                            />
                            <p className="text-text-tertiary text-xs mt-1">Maximum outstanding balance allowed</p>
                        </div>

                        {/* Payment Terms */}
                        <div>
                            <CustomSelect
                                label="Payment Terms"
                                name="payment_terms"
                                value={paymentTerms}
                                options={PAYMENT_TERMS}
                                onChange={setPaymentTerms}
                            />
                        </div>
                    </div>
                </div>

                {/* Notes Card */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Notes</h2>

                    <textarea
                        name="notes"
                        defaultValue={client?.notes || ''}
                        placeholder="Internal notes about this client..."
                        rows={4}
                        className="input resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between pt-4">
                    <Link href="/dashboard/clients" className="btn btn-secondary justify-center">
                        Cancel
                    </Link>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <SubmitButton isEdit={isEdit} />
                    </div>
                </div>
            </form>
        </div>
    )
}
