'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { generateInvoicePdf } from '@/lib/pdf/generate-invoice'

interface InvoiceDownloadButtonProps {
    orderNumber: string
}

export default function InvoiceDownloadButton({ orderNumber }: InvoiceDownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        if (isGenerating) return
        setIsGenerating(true)

        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            if (!supabaseUrl || !supabaseKey) {
                console.error('Supabase credentials not available')
                return
            }

            const supabase = createClient(supabaseUrl, supabaseKey)
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    order_number,
                    created_at,
                    subtotal,
                    tax_amount,
                    total,
                    client:clients (company_name, contact_name, email, phone),
                    job_site:job_sites (name, address, city, state, zip),
                    items:order_items (name, sku, quantity, unit, unit_price, line_total)
                `)
                .eq('order_number', orderNumber)
                .single()

            if (!data || error) {
                console.error('Order data could not be found for PDF generation.')
                return
            }

            generateInvoicePdf(data as any)
        } catch (error) {
            console.error('Failed to generate PDF:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="p-2 bg-bg-elevated border border-border-default hover:border-orange-500/50 hover:text-orange-500 rounded-md transition-all group"
            aria-label="Download PDF"
        >
            {isGenerating
                ? <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
                : <Download className="w-5 h-5 text-text-secondary group-hover:text-orange-500" />
            }
        </button>
    )
}
