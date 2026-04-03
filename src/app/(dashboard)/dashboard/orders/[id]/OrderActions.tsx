'use client'

import { useState } from 'react'
import { Printer, FileText, Check, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { getDemoOrders } from '@/lib/demo-orders'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Define the shape we expect for the invoice data
interface InvoiceData {
    order_number: string
    created_at: string
    subtotal: number
    tax_amount: number
    total: number
    client?: {
        company_name: string
        contact_name: string | null
        email: string | null
        phone: string | null
    } | null
    job_site?: {
        name: string
        address: string | null
        city: string | null
        state: string | null
        zip: string | null
    } | null
    items?: {
        name: string
        sku: string
        quantity: number
        unit: string
        unit_price: number | null
        line_total: number | null
    }[] | null
}

interface OrderActionsProps {
    orderNumber: string
}

export default function OrderActions({ orderNumber }: OrderActionsProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handlePrint = () => {
        window.print()
    }

    const generatePdf = (order: InvoiceData) => {
        const doc = new jsPDF()

        // Brand Header
        doc.setFontSize(22)
        doc.setTextColor(249, 115, 22) // orange-500
        doc.text('ProBuild Supply', 14, 22)

        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('B2B Operating System for Trade Supply', 14, 30)

        // Invoice Meta
        doc.setFontSize(24)
        doc.setTextColor(0, 0, 0)
        doc.text('INVOICE', 140, 22)

        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        doc.text(`Order Number: ${order.order_number}`, 140, 30)
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 36)

        // Bill To section
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('Bill To:', 14, 50)
        
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        let y = 58
        if (order.client) {
            doc.text(order.client.company_name || '', 14, y); y += 6
            if (order.client.contact_name) { doc.text(order.client.contact_name, 14, y); y += 6 }
            if (order.client.email) { doc.text(order.client.email, 14, y); y += 6 }
            if (order.client.phone) { doc.text(order.client.phone, 14, y); y += 6 }
        } else {
            doc.text('N/A', 14, y)
        }

        // Ship To section
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('Deliver To:', 100, 50)
        
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        let sy = 58
        if (order.job_site) {
            doc.text(order.job_site.name || '', 100, sy); sy += 6
            if (order.job_site.address) { doc.text(order.job_site.address, 100, sy); sy += 6 }
            
            // Compose City, State Zip
            const details = [order.job_site.city, order.job_site.state, order.job_site.zip].filter(Boolean).join(', ')
            if (details) { doc.text(details, 100, sy); sy += 6 }
        } else {
            doc.text('No delivery location set', 100, sy)
        }

        // Table
        const maxY = Math.max(y, sy) + 10
        autoTable(doc, {
            startY: maxY,
            head: [['Item', 'SKU', 'Qty', 'Unit Price', 'Total']],
            body: (order.items || []).map(item => [
                item.name,
                item.sku,
                `${item.quantity} ${item.unit}`,
                `$${(item.unit_price || 0).toFixed(2)}`,
                `$${(item.line_total || 0).toFixed(2)}`
            ]),
            theme: 'grid',
            headStyles: { fillColor: [249, 115, 22], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 4 },
        })

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10
        doc.setFontSize(10)
        doc.setTextColor(80, 80, 80)
        doc.text(`Subtotal: $${(order.subtotal || 0).toFixed(2)}`, 140, finalY)
        doc.text(`Tax: $${(order.tax_amount || 0).toFixed(2)}`, 140, finalY + 8)
        
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`Total: $${(order.total || 0).toFixed(2)}`, 140, finalY + 18)

        // Payment Terms Footer
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text('Payment Terms: Net 30', 14, finalY + 18)

        doc.save(`invoice-${order.order_number}.pdf`)
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
            generatePdf(targetOrder)
            
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
