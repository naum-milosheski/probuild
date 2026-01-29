'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrganizationAction(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 2. Get User's Organization
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('auth_id', user.id)
        .single()

    if (!userData?.organization_id) {
        return { error: 'Organization not found' }
    }

    const organizationId = userData.organization_id

    // 3. Extract Data
    const name = formData.get('name') as string
    const supportEmail = formData.get('supportEmail') as string
    const supportPhone = formData.get('supportPhone') as string
    const address = formData.get('address') as string

    // Notifications (checkboxes usually send 'on' if checked, null if not)
    // We want boolean values
    const notifications = {
        newOrderAlerts: formData.get('notify_newOrderAlerts') === 'on',
        inventoryWarnings: formData.get('notify_inventoryWarnings') === 'on',
        weeklyReports: formData.get('notify_weeklyReports') === 'on',
    }

    try {
        // 4. Update Database
        // We update the 'name' column directly, and everything else goes into 'settings' JSONB
        const settingsUpdate = {
            supportEmail,
            supportPhone,
            address,
            // Regional settings removed per user request
            notifications
        }

        const { error } = await supabase
            .from('organizations')
            .update({
                name,
                settings: settingsUpdate // This replaces the object. If we wanted deep merge we'd read first, but replace is fine here as this form controls all settings.
            })
            .eq('id', organizationId)

        if (error) throw error

        revalidatePath('/dashboard/settings')
        return { success: true, message: 'Settings saved successfully' }

    } catch (error: any) {
        console.error('Update Org Error:', error)
        return { error: error.message || 'Failed to update settings' }
    }
}
