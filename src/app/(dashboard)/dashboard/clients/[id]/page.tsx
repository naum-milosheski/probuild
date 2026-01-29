import { notFound } from 'next/navigation'
import { getClientById } from '@/lib/data'
import ClientForm from '../ClientForm'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const client = await getClientById(id)

    if (!client) {
        notFound()
    }

    return <ClientForm client={client as any} />
}
