import { Plus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ClientsClient from './ClientsClient'

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'

async function getClientsWithJobSiteCounts() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .order('company_name')

    if (error || !clients) {
        console.error('Error fetching clients:', error?.message)
        return []
    }

    // Get job site counts for each client
    const clientsWithCounts = await Promise.all(
        clients.map(async (client) => {
            const { count } = await supabase
                .from('job_sites')
                .select('*', { count: 'exact', head: true })
                .eq('client_id', client.id)
                .eq('is_active', true)

            return { ...client, jobSiteCount: count || 0 }
        })
    )

    return clientsWithCounts
}

export default async function ClientsPage() {
    const clients = await getClientsWithJobSiteCounts()

    const totalJobSites = clients.reduce((sum, c) => sum + c.jobSiteCount, 0)
    const totalCreditLimit = clients.reduce((sum, c) => sum + (c.credit_limit || 0), 0)

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Clients</h1>
                    <p className="text-text-secondary mt-1">Manage contractor accounts and job sites</p>
                </div>
                <Link href="/dashboard/clients/new" className="btn btn-primary w-full md:w-auto justify-center">
                    <Plus className="w-4 h-4" />
                    Add Client
                </Link>
            </div>

            {/* Client-side interactive content */}
            <ClientsClient
                clients={clients}
                totalJobSites={totalJobSites}
                totalCreditLimit={totalCreditLimit}
            />
        </div>
    )
}
