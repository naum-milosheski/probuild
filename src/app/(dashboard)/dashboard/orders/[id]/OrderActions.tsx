'use client'

import { useState } from 'react'
import { Printer, FileText, Check } from 'lucide-react'

interface OrderActionsProps {
    orderNumber: string
}

export default function OrderActions({ orderNumber }: OrderActionsProps) {
    const [showToast, setShowToast] = useState(false)

    const handlePrint = () => {
        window.print()
    }

    const handleInvoice = () => {
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
    }

    return (
        <>
            <div className="flex items-center gap-3 print:hidden">
                <button onClick={handlePrint} className="btn btn-secondary">
                    <Printer className="w-4 h-4" />
                    Print
                </button>
                <button onClick={handleInvoice} className="btn btn-secondary">
                    <FileText className="w-4 h-4" />
                    Invoice
                </button>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-fade-in print:hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border-default rounded-lg shadow-xl">
                        <div className="p-1.5 bg-green-500/20 rounded-full">
                            <Check className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-primary">Generating Invoice PDF...</p>
                            <p className="text-xs text-text-tertiary">Download started for {orderNumber}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
