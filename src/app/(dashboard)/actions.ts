'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function linkUserToDemoClient() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Link current user to 'BuildRight Construction'
    const { error } = await supabase
        .from('clients')
        .update({ auth_id: user.id })
        .eq('company_name', 'BuildRight Construction')

    if (error) {
        console.error('Error linking client:', error)
        return { error: error.message }
    }

    // Redirect to portal (Sorting Hat will now accept them)
    redirect('/portal')
}
