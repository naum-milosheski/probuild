'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export type ClientFormState = {
    success?: boolean
    error?: string
    fieldErrors?: Record<string, string>
}

export async function createClientAction(
    prevState: ClientFormState,
    formData: FormData
): Promise<ClientFormState> {
    const supabase = getSupabase()

    const companyName = formData.get('company_name') as string
    const contactName = formData.get('contact_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const creditLimit = parseFloat(formData.get('credit_limit') as string) || 0
    const paymentTerms = parseInt(formData.get('payment_terms') as string) || 30
    const notes = formData.get('notes') as string

    // Validation
    const fieldErrors: Record<string, string> = {}
    if (!companyName) fieldErrors.company_name = 'Company name is required'

    if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors }
    }

    const { error } = await supabase.from('clients').insert({
        organization_id: DEFAULT_ORG_ID,
        company_name: companyName,
        contact_name: contactName || null,
        email: email || null,
        phone: phone || null,
        credit_limit: creditLimit,
        payment_terms: paymentTerms,
        notes: notes || null,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/clients')
    redirect('/dashboard/clients')
}

export async function updateClientAction(
    clientId: string,
    prevState: ClientFormState,
    formData: FormData
): Promise<ClientFormState> {
    const supabase = getSupabase()

    const companyName = formData.get('company_name') as string
    const contactName = formData.get('contact_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const creditLimit = parseFloat(formData.get('credit_limit') as string) || 0
    const paymentTerms = parseInt(formData.get('payment_terms') as string) || 30
    const notes = formData.get('notes') as string

    // Validation
    const fieldErrors: Record<string, string> = {}
    if (!companyName) fieldErrors.company_name = 'Company name is required'

    if (Object.keys(fieldErrors).length > 0) {
        return { fieldErrors }
    }

    const { error } = await supabase
        .from('clients')
        .update({
            company_name: companyName,
            contact_name: contactName || null,
            email: email || null,
            phone: phone || null,
            credit_limit: creditLimit,
            payment_terms: paymentTerms,
            notes: notes || null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('organization_id', DEFAULT_ORG_ID)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/clients')
    revalidatePath(`/dashboard/clients/${clientId}`)
    redirect('/dashboard/clients')
}

export async function deleteClientAction(clientId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase()

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('organization_id', DEFAULT_ORG_ID)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}
