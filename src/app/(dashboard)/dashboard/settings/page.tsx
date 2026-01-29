import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: organization } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001') // Todo: multitenant context
        .single()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
                <p className="text-text-secondary mt-1">Manage your organization and account preferences.</p>
            </div>

            <SettingsForm user={user} organization={organization} />
        </div>
    )
}
