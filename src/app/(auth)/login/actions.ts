'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Auth successful! Now let's find out who they are (Sorting Hat)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // Check if user is a client
        const { data: client } = await supabase
            .from('clients')
            .select('id')
            .eq('auth_id', user.id)
            .single()

        // "Sorting Hat" Logic
        if (client) {
            redirect('/portal')
        } else {
            redirect('/dashboard')
        }
    }

    redirect('/') // Fallback if something weird happens (shouldn't reach here)
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
