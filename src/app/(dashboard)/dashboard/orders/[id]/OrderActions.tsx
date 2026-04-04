'use client'

import { useState } from 'react'
import { Printer, FileText, Check, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { getDemoOrders } from '@/lib/demo-orders'
import { generateInvoicePdf, type InvoiceData } from '@/lib/pdf/generate-invoice'

interface OrderActionsProps {
    orderNumber: string
}

export default function OrderActions({ orderNumber }: OrderActionsProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handlePrint = () => {
        window.print()
    }


    const handleInvoice = async () => {
        if (isGenerating) return
        
        setIsGenerating(true)
        setShowSuccess(false)

        try {
            let targetOrder: InvoiceData | null = null

            // 1. Try resolving from local demo orders first
            const demoOrders = getDemoOrders()
            const foundDemo = demoOrders.find(o => o.order_number === orderNumber)
            
            if (foundDemo) {
                targetOrder = foundDemo as unknown as InvoiceData
            } else {
                // 2. Fallback to Supabase for seeded orders
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
                const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                
                if (supabaseUrl && supabaseKey) {
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

                    if (data && !error) {
                        targetOrder = data as unknown as InvoiceData
                    }
                }
            }

            if (!targetOrder) {
                console.error('Order data could not be found for PDF generation.')
                return
            }

            // Generate
            generateInvoicePdf(targetOrder)
            
            // Show brief success toast
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)

        } catch (error) {
            console.error('Failed to generate PDF:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-3 print:hidden">
                <button onClick={handlePrint} className="btn btn-secondary">
                    <Printer className="w-4 h-4" />
                    Print
                </button>
                <button 
                    onClick={handleInvoice} 
                    disabled={isGenerating}
                    className="btn btn-secondary min-w-[100px]"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating
                        </>
                    ) : (
                        <>
                            <FileText className="w-4 h-4" />
                            Invoice
                        </>
                    )}
                </button>
            </div>

            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed bottom-6 right-6 z-50 animate-fade-in print:hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border-default rounded-lg shadow-xl">
                        <div className="p-1.5 bg-green-500/20 rounded-full">
                            <Check className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">Invoice Generated</p>
                            <p className="text-xs text-text-tertiary">Downloaded invoice-{orderNumber}.pdf</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
