'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
    Sparkles,
    ArrowRight,
    Check,
    X,
    AlertTriangle,
    Loader2,
    Package,
    MapPin,
    FileText,
    ChevronDown,
    Trash2,
    Users,
    RefreshCw,
    Printer,
    Undo2,
    UploadCloud,
    File as FileIcon
} from 'lucide-react'
import type { MagicImportResult, MatchedItem, UnmatchedItem, Product } from '@/types'
import { addDemoOrder, getDemoOrders, clearDemoOrders } from '@/lib/demo-orders'
import ProductSearchDropdown from '@/components/dashboard/ProductSearchDropdown'
import ConfirmOrderModal from '@/components/dashboard/ConfirmOrderModal'

type Step = 'input' | 'processing' | 'review' | 'confirm'

// All 30 seed products for manual resolution searches
const ALL_PRODUCTS: Product[] = [
    // Plumbing
    { id: '00000000-0000-0000-0001-000000000001', organization_id: 'org-1', sku: 'COP-050-L', name: '1/2" Copper Pipe Type L', description: 'Half inch copper pipe, Type L', category_id: 'cat-1', unit: 'ft', unit_price: 4.50, cost_price: 2.80, stock_qty: 500, min_stock_qty: 100, aliases: ['half inch copper pipe', '1/2 copper'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000002', organization_id: 'org-1', sku: 'COP-075-L', name: '3/4" Copper Pipe Type L', description: 'Three quarter inch copper pipe', category_id: 'cat-1', unit: 'ft', unit_price: 6.75, cost_price: 4.20, stock_qty: 400, min_stock_qty: 80, aliases: ['3/4 copper pipe', 'three quarter copper'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000003', organization_id: 'org-1', sku: 'COP-100-L', name: '1" Copper Pipe Type L', description: 'One inch copper pipe', category_id: 'cat-1', unit: 'ft', unit_price: 12.50, cost_price: 8.00, stock_qty: 200, min_stock_qty: 50, aliases: ['1 inch copper', 'one inch copper pipe'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000004', organization_id: 'org-1', sku: 'PVC-ELB-050', name: '1/2" PVC 90° Elbow Sch40', description: 'Schedule 40 PVC elbow', category_id: 'cat-1', unit: 'each', unit_price: 0.85, cost_price: 0.35, stock_qty: 500, min_stock_qty: 100, aliases: ['half inch PVC elbow', 'PVC 90'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000005', organization_id: 'org-1', sku: 'PVC-ELB-075', name: '3/4" PVC 90° Elbow Sch40', description: 'Schedule 40 PVC elbow', category_id: 'cat-1', unit: 'each', unit_price: 1.25, cost_price: 0.55, stock_qty: 400, min_stock_qty: 75, aliases: ['3/4 PVC elbow', 'PVC elbow'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000006', organization_id: 'org-1', sku: 'PVC-TEE-075', name: '3/4" PVC Tee Sch40', description: 'Schedule 40 PVC tee', category_id: 'cat-1', unit: 'each', unit_price: 1.75, cost_price: 0.80, stock_qty: 300, min_stock_qty: 60, aliases: ['3/4 PVC tee', 'PVC T fitting'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000007', organization_id: 'org-1', sku: 'SHK-BITE-050', name: '1/2" SharkBite Coupling', description: 'Push-to-connect coupling', category_id: 'cat-1', unit: 'each', unit_price: 8.99, cost_price: 5.50, stock_qty: 150, min_stock_qty: 30, aliases: ['sharkbite', 'push fit coupling'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000008', organization_id: 'org-1', sku: 'SHK-BITE-075', name: '3/4" SharkBite Coupling', description: 'Push-to-connect coupling', category_id: 'cat-1', unit: 'each', unit_price: 12.99, cost_price: 8.00, stock_qty: 120, min_stock_qty: 25, aliases: ['3/4 sharkbite', 'shark bite coupling'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000009', organization_id: 'org-1', sku: 'WTR-HTR-50G', name: 'Rheem 50 Gallon Water Heater', description: 'Rheem Performance 50 gal electric', category_id: 'cat-1', unit: 'each', unit_price: 549.00, cost_price: 380.00, stock_qty: 8, min_stock_qty: 3, aliases: ['water heater', 'hot water heater', '50 gallon'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000010', organization_id: 'org-1', sku: 'FLXHSE-SS-24', name: '24" Stainless Steel Flex Hose', description: 'Braided stainless steel water supply line', category_id: 'cat-1', unit: 'each', unit_price: 12.99, cost_price: 7.00, stock_qty: 75, min_stock_qty: 20, aliases: ['flex hose', 'water supply line', 'braided hose'], is_active: true, created_at: '', updated_at: '' },
    // HVAC
    { id: '00000000-0000-0000-0001-000000000011', organization_id: 'org-1', sku: 'HVAC-FILT-20x20', name: '20x20x1 HVAC Air Filter MERV 8', description: 'Pleated air filter', category_id: 'cat-2', unit: 'each', unit_price: 8.99, cost_price: 4.50, stock_qty: 200, min_stock_qty: 50, aliases: ['20x20 filter', 'HVAC filter', 'air filter 20x20'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000012', organization_id: 'org-1', sku: 'HVAC-FILT-16x25', name: '16x25x1 HVAC Air Filter MERV 8', description: 'Pleated air filter', category_id: 'cat-2', unit: 'each', unit_price: 9.99, cost_price: 5.00, stock_qty: 175, min_stock_qty: 40, aliases: ['16x25 filter', 'air filter'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000013', organization_id: 'org-1', sku: 'FLEX-DUCT-6', name: '6" Insulated Flexible Duct (25ft)', description: 'R-6 insulated flexible aluminum duct', category_id: 'cat-2', unit: 'roll', unit_price: 45.99, cost_price: 28.00, stock_qty: 35, min_stock_qty: 10, aliases: ['6 inch flex duct', 'flexible duct', 'flex duct'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000014', organization_id: 'org-1', sku: 'FLEX-DUCT-8', name: '8" Insulated Flexible Duct (25ft)', description: 'R-6 insulated flexible aluminum duct', category_id: 'cat-2', unit: 'roll', unit_price: 59.99, cost_price: 38.00, stock_qty: 25, min_stock_qty: 8, aliases: ['8 inch flex duct', '8" duct'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000015', organization_id: 'org-1', sku: 'THERMO-HW-T6', name: 'Honeywell T6 Pro Thermostat', description: 'Programmable thermostat with WiFi', category_id: 'cat-2', unit: 'each', unit_price: 129.99, cost_price: 85.00, stock_qty: 24, min_stock_qty: 6, aliases: ['honeywell thermostat', 't6 thermostat', 'smart thermostat'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000016', organization_id: 'org-1', sku: 'THERMO-NEST-3', name: 'Nest Learning Thermostat 3rd Gen', description: 'Smart thermostat with auto-schedule', category_id: 'cat-2', unit: 'each', unit_price: 249.99, cost_price: 180.00, stock_qty: 12, min_stock_qty: 4, aliases: ['nest thermostat', 'nest 3rd gen'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000017', organization_id: 'org-1', sku: 'REF-R410A-25', name: 'R-410A Refrigerant (25lb)', description: 'R-410A refrigerant, 25 pound cylinder', category_id: 'cat-2', unit: 'tank', unit_price: 189.99, cost_price: 140.00, stock_qty: 18, min_stock_qty: 5, aliases: ['R410A', 'refrigerant', 'puron', '410A freon'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000018', organization_id: 'org-1', sku: 'COND-PUMP-LT', name: 'Little Giant Condensate Pump', description: 'Automatic condensate removal pump', category_id: 'cat-2', unit: 'each', unit_price: 79.99, cost_price: 52.00, stock_qty: 20, min_stock_qty: 5, aliases: ['condensate pump', 'little giant', 'AC pump'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000019', organization_id: 'org-1', sku: 'CAP-RUN-45', name: '45/5 MFD Run Capacitor', description: 'Dual run capacitor 45/5 MFD 440V', category_id: 'cat-2', unit: 'each', unit_price: 24.99, cost_price: 14.00, stock_qty: 45, min_stock_qty: 10, aliases: ['run capacitor', '45/5 capacitor', 'AC capacitor'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000020', organization_id: 'org-1', sku: 'MOTOR-COND-1/4', name: '1/4 HP Condenser Fan Motor', description: 'Universal replacement condenser fan motor', category_id: 'cat-2', unit: 'each', unit_price: 89.99, cost_price: 55.00, stock_qty: 15, min_stock_qty: 4, aliases: ['condenser motor', 'fan motor', '1/4 HP motor'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000021', organization_id: 'org-1', sku: 'LNSET-3/8-50', name: '3/8" x 3/4" Lineset 50ft', description: 'Pre-charged insulated copper lineset', category_id: 'cat-2', unit: 'set', unit_price: 149.99, cost_price: 95.00, stock_qty: 12, min_stock_qty: 3, aliases: ['lineset', 'mini split line', 'copper lineset'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000022', organization_id: 'org-1', sku: 'PAD-COND-24x24', name: '24x24 Condenser Pad', description: 'Plastic condenser mounting pad', category_id: 'cat-2', unit: 'each', unit_price: 34.99, cost_price: 20.00, stock_qty: 25, min_stock_qty: 8, aliases: ['condenser pad', 'AC pad', 'equipment pad'], is_active: true, created_at: '', updated_at: '' },
    // Electrical
    { id: '00000000-0000-0000-0001-000000000023', organization_id: 'org-1', sku: 'WNC-RED-100', name: 'Red Wire Nuts (100 pack)', description: 'Red wire connectors for 10-14 AWG', category_id: 'cat-3', unit: 'box', unit_price: 12.99, cost_price: 7.50, stock_qty: 85, min_stock_qty: 20, aliases: ['red wire nuts', 'wire connectors', 'red caps'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000024', organization_id: 'org-1', sku: 'WNC-YEL-100', name: 'Yellow Wire Nuts (100 pack)', description: 'Yellow wire connectors for 12-18 AWG', category_id: 'cat-3', unit: 'box', unit_price: 11.99, cost_price: 6.50, stock_qty: 90, min_stock_qty: 20, aliases: ['yellow wire nuts', 'yellow caps'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000025', organization_id: 'org-1', sku: 'ROM-12-2-250', name: 'Romex 12/2 NM-B Wire (250ft)', description: '12/2 Non-metallic sheathed cable', category_id: 'cat-3', unit: 'roll', unit_price: 189.99, cost_price: 145.00, stock_qty: 18, min_stock_qty: 5, aliases: ['romex 12/2', '12-2 romex', '12/2 wire'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000026', organization_id: 'org-1', sku: 'ROM-14-2-250', name: 'Romex 14/2 NM-B Wire (250ft)', description: '14/2 Non-metallic sheathed cable', category_id: 'cat-3', unit: 'roll', unit_price: 149.99, cost_price: 110.00, stock_qty: 22, min_stock_qty: 6, aliases: ['romex 14/2', '14-2 romex', '14/2 wire'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000027', organization_id: 'org-1', sku: 'TAPE-ELEC-BLK', name: 'Black Electrical Tape (10 pack)', description: '3/4" x 60ft vinyl electrical tape', category_id: 'cat-3', unit: 'pack', unit_price: 14.99, cost_price: 8.00, stock_qty: 60, min_stock_qty: 15, aliases: ['electrical tape', 'black tape', 'vinyl tape'], is_active: true, created_at: '', updated_at: '' },
    // Tools
    { id: '00000000-0000-0000-0001-000000000028', organization_id: 'org-1', sku: 'TOOL-CUTTER-M', name: 'Ridgid Copper Tube Cutter', description: 'Heavy duty copper and brass tube cutter', category_id: 'cat-4', unit: 'each', unit_price: 34.99, cost_price: 22.00, stock_qty: 15, min_stock_qty: 4, aliases: ['tube cutter', 'pipe cutter', 'copper cutter'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000029', organization_id: 'org-1', sku: 'TOOL-TORCH-KT', name: 'Bernzomatic Torch Kit', description: 'Self-igniting propane torch', category_id: 'cat-4', unit: 'each', unit_price: 44.99, cost_price: 28.00, stock_qty: 12, min_stock_qty: 3, aliases: ['torch', 'propane torch', 'bernzomatic'], is_active: true, created_at: '', updated_at: '' },
    { id: '00000000-0000-0000-0001-000000000030', organization_id: 'org-1', sku: 'TOOL-MANIF-DG', name: 'Digital Manifold Gauge Set', description: '4-port digital manifold with vacuum gauge', category_id: 'cat-4', unit: 'each', unit_price: 289.99, cost_price: 195.00, stock_qty: 6, min_stock_qty: 2, aliases: ['manifold gauges', 'HVAC gauges', 'digital manifold'], is_active: true, created_at: '', updated_at: '' },
]

type ClientOption = { id: string; company_name: string; contact_name: string | null; email: string | null; phone: string | null }

// Staged processing messages
const PROCESSING_MESSAGES = [
    { text: 'Extracting items from document...', icon: FileText },
    { text: 'Matching to inventory catalog...', icon: Package },
    { text: 'Calculating confidence scores...', icon: Sparkles },
]

// Track original quantities for visual diff
interface EditableMatchedItem extends MatchedItem {
    originalQuantity: number
}

export default function MagicImportPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('input')
    const [rawText, setRawText] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<MagicImportResult | null>(null)
    const [editedItems, setEditedItems] = useState<EditableMatchedItem[]>([])
    const [resolvedItems, setResolvedItems] = useState<EditableMatchedItem[]>([])
    const [error, setError] = useState<string | null>(null)
    const [clients, setClients] = useState<ClientOption[]>([])
    const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
    const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null)
    const [showClientDropdown, setShowClientDropdown] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [swapIndex, setSwapIndex] = useState<number | null>(null)
    const [processingMessageIndex, setProcessingMessageIndex] = useState(0)
    const [showUndoToast, setShowUndoToast] = useState(false)
    const [toastExiting, setToastExiting] = useState(false)
    const clientDropdownRef = useRef<HTMLDivElement>(null)
    const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Close client dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
                setShowClientDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch clients from Supabase on mount
    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (!supabaseUrl || !supabaseKey) return
        const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
        supabase
            .from('clients')
            .select('id, company_name, contact_name, email, phone')
            .order('company_name')
            .then(({ data }) => { if (data) setClients(data) })
    }, [])

    // Cycle processing messages
    useEffect(() => {
        if (step !== 'processing') return
        setProcessingMessageIndex(0)
        const interval = setInterval(() => {
            setProcessingMessageIndex(prev =>
                prev < PROCESSING_MESSAGES.length - 1 ? prev + 1 : prev
            )
        }, 1200)
        return () => clearInterval(interval)
    }, [step])

    // Cleanup undo timer
    useEffect(() => {
        return () => {
            if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
        }
    }, [])

    const exampleTexts = [
        "Send 30ft of half-inch copper pipe and 2 boxes of those red wire nuts to the Job Site A.",
        "Need 500ft romex 12/2 and about 20 PVC elbows for the downtown project",
        "Hey can you drop off 3 boxes of wire nuts and some copper pipe at the Miller residence?"
    ]

    const handleSubmit = async () => {
        if ((!rawText.trim() && !file) || !selectedClient) return

        setStep('processing')
        setError(null)

        try {
            let fileData = undefined;
            if (file) {
                 const base64 = await new Promise<string>((resolve, reject) => {
                     const reader = new FileReader();
                     reader.onload = () => {
                         const result = reader.result as string;
                         resolve(result.split(',')[1]);
                     };
                     reader.onerror = reject;
                     reader.readAsDataURL(file);
                 });
                 fileData = {
                     base64,
                     mimeType: file.type
                 };
            }

            const response = await fetch('/api/ai/parse-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rawText, file: fileData })
            })

            if (!response.ok) {
                throw new Error('Failed to process order')
            }

            const data: MagicImportResult = await response.json()
            setResult(data)
            setEditedItems(data.matched.map(item => ({
                ...item,
                originalQuantity: item.quantity,
            })))
            setResolvedItems([])
            setStep('review')
        } catch {
            setError('Failed to process order. Please try again.')
            setStep('input')
        }
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-success bg-success/10 border-success/30'
        if (confidence >= 0.7) return 'text-warning bg-warning/10 border-warning/30'
        if (confidence >= 0.5) return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
        return 'text-error bg-error/10 border-error/30'
    }

    const handleQuantityChange = (index: number, value: number) => {
        const updated = [...editedItems]
        updated[index] = { ...updated[index], quantity: value }
        setEditedItems(updated)
    }

    const handleRemoveItem = (index: number) => {
        setEditedItems(editedItems.filter((_, i) => i !== index))
    }

    const handleSwapProduct = (index: number, product: Product) => {
        const updated = [...editedItems]
        updated[index] = {
            ...updated[index],
            product,
            confidence: 1.0, // Manual swap = full confidence
            unit: updated[index].extracted.unit || product.unit,
        }
        setEditedItems(updated)
        setSwapIndex(null)
    }

    const handleResolveUnmatched = (unmatched: UnmatchedItem, product: Product) => {
        const newMatched: EditableMatchedItem = {
            extracted: unmatched.extracted,
            product,
            confidence: 1.0,
            quantity: unmatched.extracted.quantity || 1,
            unit: unmatched.extracted.unit || product.unit,
            originalQuantity: unmatched.extracted.quantity || 1,
        }
        setResolvedItems([...resolvedItems, newMatched])
    }

    const handleConfirmOrder = useCallback(() => {
        if (!selectedClient) return

        const order = addDemoOrder({
            client: selectedClient,
            items: allItems,
            deliveryLocation: result?.delivery_location || null,
            notes: result?.notes || null,
        })

        setCreatedOrderId(order.id)
        setCreatedOrderNumber(order.order_number)
        setShowConfirmModal(false)
        setStep('confirm')

        // Show undo toast for 5 seconds
        setShowUndoToast(true)
        setToastExiting(false)
        undoTimerRef.current = setTimeout(() => {
            setToastExiting(true)
            setTimeout(() => setShowUndoToast(false), 300)
        }, 5000)
    }, [selectedClient, result, editedItems, resolvedItems])

    const handleUndo = () => {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
        // Remove the last demo order
        const orders = getDemoOrders()
        const filtered = orders.filter(o => o.id !== createdOrderId)
        if (filtered.length === 0) {
            clearDemoOrders()
        } else {
            sessionStorage.setItem('probuild_demo_orders', JSON.stringify(filtered))
        }
        setShowUndoToast(false)
        setCreatedOrderId(null)
        setCreatedOrderNumber(null)
        setStep('review')
    }

    const resetWizard = () => {
        setStep('input')
        setRawText('')
        setFile(null)
        setResult(null)
        setEditedItems([])
        setResolvedItems([])
        setSelectedClient(null)
        setCreatedOrderId(null)
        setCreatedOrderNumber(null)
        setError(null)
        setShowUndoToast(false)
    }

    const allItems = [...editedItems, ...resolvedItems]
    const subtotal = allItems.reduce((sum, item) => sum + (item.product.unit_price * item.quantity), 0)
    const unresolvedCount = result ? result.unmatched.length - resolvedItems.length : 0

    const ProcessingIcon = PROCESSING_MESSAGES[processingMessageIndex]?.icon || Loader2

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Sparkles className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-text-primary">Magic Import</h1>
                        <p className="text-text-secondary">Paste text, upload a PDF, or photograph a handwritten note → AI creates a structured order</p>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="overflow-x-auto pb-2 mb-4">
                <div className="flex items-center gap-4 text-sm min-w-max">
                    {['Input', 'Processing', 'Review', 'Confirm'].map((label, index) => {
                        const stepNames: Step[] = ['input', 'processing', 'review', 'confirm']
                        const isActive = step === stepNames[index]
                        const isPast = stepNames.indexOf(step) > index
                        return (
                            <div key={label} className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${isActive ? 'bg-orange-500 text-bg-primary' :
                                    isPast ? 'bg-success text-bg-primary' :
                                        'bg-bg-tertiary text-text-tertiary'
                                    }`}>
                                    {isPast ? <Check className="w-3 h-3" /> : index + 1}
                                </div>
                                <span className={isActive ? 'text-text-primary' : 'text-text-tertiary'}>
                                    {label}
                                </span>
                                {index < 3 && <ArrowRight className="w-4 h-4 text-text-tertiary" />}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ============================
                STEP 1: INPUT (Client + Text)
               ============================ */}
            {step === 'input' && (
                <div className="space-y-4">
                    {/* Client Selection - FIRST */}
                    <div className="card">
                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
                            <Users className="w-4 h-4" />
                            Who is ordering?
                        </div>
                        <div className="relative" ref={clientDropdownRef}>
                            <button
                                onClick={() => setShowClientDropdown(!showClientDropdown)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors cursor-pointer ${selectedClient
                                    ? 'bg-bg-tertiary border-orange-500/50 text-text-primary'
                                    : 'bg-bg-secondary border-border-default text-text-secondary hover:border-border-hover'
                                    }`}
                            >
                                <span className={selectedClient ? 'font-medium' : ''}>
                                    {selectedClient?.company_name || 'Select a client...'}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showClientDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showClientDropdown && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-bg-secondary border border-border-default rounded-lg shadow-xl z-20 overflow-hidden animate-fade-in">
                                    <div className="p-2 border-b border-border-subtle">
                                        <span className="text-xs text-text-tertiary uppercase tracking-wide">Available Clients</span>
                                    </div>
                                    <div className="p-1 max-h-48 overflow-y-auto">
                                        {clients.map(client => (
                                            <button
                                                key={client.id}
                                                onClick={() => {
                                                    setSelectedClient(client)
                                                    setShowClientDropdown(false)
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded text-sm flex items-center gap-3 transition-colors cursor-pointer ${selectedClient?.id === client.id
                                                    ? 'bg-orange-500/10 text-orange-500'
                                                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                                    }`}
                                            >
                                                <Users className="w-4 h-4" />
                                                {client.company_name}
                                                {selectedClient?.id === client.id && (
                                                    <Check className="w-4 h-4 ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Input */}
                    <div className="card space-y-4">
                        <label className="block">
                            <span className="text-text-secondary text-sm mb-2 block">
                                Paste the contractor&apos;s message, or upload a PDF/Image below
                            </span>
                            <textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                placeholder="e.g., Send 30ft of half-inch copper pipe and 2 boxes of those red wire nuts to the Job Site A."
                                className="input min-h-[120px] resize-y"
                                autoFocus
                            />
                        </label>
                        
                        <div className="border border-dashed border-border-default rounded-lg p-4 bg-bg-tertiary">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-bg-secondary rounded">
                                    <UploadCloud className="w-5 h-5 text-text-tertiary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-text-secondary">Or upload a document</p>
                                    <p className="text-xs text-text-tertiary">Supports PDF, JPG, PNG, WEBP</p>
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        id="file-upload" 
                                        className="hidden" 
                                        accept=".pdf,image/jpeg,image/png,image/webp"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <button 
                                      onClick={() => document.getElementById('file-upload')?.click()}
                                      className="btn btn-secondary text-sm py-1.5"
                                    >
                                        Browse
                                    </button>
                                </div>
                            </div>
                            {file && (
                                <div className="mt-3 flex items-center justify-between bg-bg-elevated border border-border-default p-2 rounded text-sm">
                                    <div className="flex items-center gap-2 text-text-primary overflow-hidden">
                                        <FileIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => setFile(null)}
                                        className="p-1 hover:text-error text-text-tertiary transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Format hints */}
                        <p className="text-xs text-text-tertiary">
                            Works with plain sentences, bullet lists, handwritten notes, PDFs, or any informal contractor language.
                        </p>

                        {error && (
                            <div className="flex items-center gap-2 text-error text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-text-tertiary">
                                <span className="text-text-secondary">Try an example:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {exampleTexts.map((text, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setRawText(text)}
                                            className="px-2 py-1 bg-bg-tertiary hover:bg-bg-elevated rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer truncate text-left max-w-full sm:max-w-[200px]"
                                        >
                                            &quot;{text}&quot;
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={(!rawText.trim() && !file) || !selectedClient}
                                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed justify-center"
                                title={!selectedClient ? 'Select a client first' : (!rawText.trim() && !file) ? 'Enter order text or upload a file' : ''}
                            >
                                <Sparkles className="w-4 h-4" />
                                {!selectedClient ? 'Select a client first' : 'Parse with AI'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================
                STEP 2: PROCESSING (Staged)
               ============================ */}
            {step === 'processing' && (
                <div className="card flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="relative">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                    <div className="text-center space-y-3">
                        {PROCESSING_MESSAGES.map((msg, index) => {
                            const Icon = msg.icon
                            const isActive = index === processingMessageIndex
                            const isDone = index < processingMessageIndex
                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-center gap-2 text-sm transition-all duration-300 ${isActive ? 'text-text-primary' :
                                        isDone ? 'text-success' :
                                            'text-text-muted'
                                        }`}
                                >
                                    {isDone ? (
                                        <Check className="w-4 h-4 text-success" />
                                    ) : isActive ? (
                                        <Icon className="w-4 h-4 text-orange-500" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    {msg.text}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ============================
                STEP 3: REVIEW
               ============================ */}
            {step === 'review' && result && (
                <div className="space-y-6">
                    {/* Original Text */}
                    <div className="card">
                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                            <FileText className="w-4 h-4" />
                            Original Message
                            <span className="ml-auto text-xs text-text-tertiary">
                                for {selectedClient?.company_name}
                            </span>
                        </div>
                        <p className="text-text-primary bg-bg-tertiary p-3 rounded-md text-sm">
                            {(rawText || !file) ? `"${rawText}"` : `[Uploaded Document: ${result.raw_text === '[Uploaded File]' ? 'File parsed successfully' : result.raw_text}]`}
                        </p>
                        {result.delivery_location && (
                            <div className="flex items-center gap-2 mt-3 text-sm">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                <span className="text-text-secondary">Delivery:</span>
                                <span className="text-text-primary">{result.delivery_location}</span>
                            </div>
                        )}
                    </div>

                    {/* Matched Items */}
                    {editedItems.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-medium text-text-primary mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5 text-success" />
                                Matched Items ({editedItems.length})
                            </h3>
                            <div className="space-y-3">
                                {editedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-bg-tertiary rounded-lg border border-border-subtle"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getConfidenceColor(item.confidence)}`}>
                                                    {Math.round(item.confidence * 100)}%
                                                </span>
                                                <span className="font-mono text-xs text-text-tertiary">{item.product.sku}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-text-primary">{item.product.name}</p>
                                                {/* Change product button */}
                                                <button
                                                    onClick={() => setSwapIndex(swapIndex === index ? null : index)}
                                                    className="p-1 text-text-tertiary hover:text-orange-400 transition-colors"
                                                    title="Change product"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-text-tertiary mt-0.5">
                                                Extracted: &quot;{item.extracted.description}&quot;
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-border-default pt-3 sm:border-0 sm:pt-0">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                                    className="input w-20 text-center"
                                                    min="1"
                                                />
                                                <span className="text-text-secondary text-sm w-12">{item.unit}</span>
                                            </div>
                                            {/* Visual diff: show original if changed */}
                                            {item.quantity !== item.originalQuantity && (
                                                <span className="text-xs text-text-tertiary line-through">
                                                    was {item.originalQuantity}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="text-text-primary font-medium w-20 text-right">
                                                    ${(item.product.unit_price * item.quantity).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="p-2 text-text-tertiary hover:text-error transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product swap dropdown */}
                                        {swapIndex === index && (
                                            <ProductSearchDropdown
                                                products={ALL_PRODUCTS}
                                                onSelect={(product) => handleSwapProduct(index, product)}
                                                onClose={() => setSwapIndex(null)}
                                                placeholder="Search for replacement product..."
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unmatched Items */}
                    {result.unmatched.length > 0 && (
                        <div className="card border-warning/30">
                            <h3 className="text-lg font-medium text-warning mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Needs Review ({unresolvedCount} remaining)
                            </h3>
                            <div className="space-y-3">
                                {result.unmatched.map((item, index) => {
                                    const isResolved = resolvedItems.some(
                                        r => r.extracted.description === item.extracted.description
                                    )
                                    if (isResolved) return null

                                    return (
                                        <UnmatchedItemCard
                                            key={index}
                                            item={item}
                                            allProducts={ALL_PRODUCTS}
                                            onResolve={handleResolveUnmatched}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Resolved Items */}
                    {resolvedItems.length > 0 && (
                        <div className="card border-success/30">
                            <h3 className="text-lg font-medium text-success mb-4 flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Manually Resolved ({resolvedItems.length})
                            </h3>
                            <div className="space-y-2">
                                {resolvedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-success/5 rounded border border-success/20"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-text-tertiary">{item.product.sku}</span>
                                            <span className="text-text-primary">{item.product.name}</span>
                                        </div>
                                        <span className="text-text-secondary">× {item.quantity} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Summary & Actions */}
                    <div className="card bg-bg-elevated">
                        <div className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-text-secondary">Subtotal ({allItems.length} items)</p>
                                <p className="text-2xl font-semibold text-text-primary">${subtotal.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        setStep('input')
                                        setResult(null)
                                    }}
                                    className="btn btn-secondary w-full sm:w-auto justify-center"
                                >
                                    Start Over
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    disabled={allItems.length === 0 || !selectedClient}
                                    className="btn btn-primary disabled:opacity-50 w-full sm:w-auto justify-center"
                                >
                                    {allItems.length === 0
                                        ? 'No items to order'
                                        : 'Create Order'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-text-tertiary mt-2">
                            Processed in {result.processing_ms}ms
                            {unresolvedCount > 0 && (
                                <span className="text-warning ml-2">
                                    • {unresolvedCount} unmatched item{unresolvedCount !== 1 ? 's' : ''} will be excluded
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* ============================
                STEP 4: CONFIRMATION
               ============================ */}
            {step === 'confirm' && (
                <div className="card text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-success" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">Order Created!</h2>
                        {createdOrderNumber && (
                            <p className="text-orange-400 font-mono text-sm mt-1">{createdOrderNumber}</p>
                        )}
                        <p className="text-text-secondary mt-1">
                            {allItems.length} items totaling ${subtotal.toFixed(2)} for {selectedClient?.company_name}
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <button
                            onClick={() => window.print()}
                            className="btn btn-secondary"
                        >
                            <Printer className="w-4 h-4" />
                            Print Pick Ticket
                        </button>
                        <button
                            onClick={resetWizard}
                            className="btn btn-secondary"
                        >
                            <Sparkles className="w-4 h-4" />
                            New Import
                        </button>
                        <button
                            onClick={() => router.push(createdOrderId ? `/dashboard/orders/${createdOrderId}` : '/dashboard/orders')}
                            className="btn btn-primary"
                        >
                            <Package className="w-4 h-4" />
                            View Order
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && selectedClient && (
                <ConfirmOrderModal
                    clientName={selectedClient.company_name}
                    itemCount={allItems.length}
                    subtotal={subtotal}
                    unresolvedCount={unresolvedCount}
                    onConfirm={handleConfirmOrder}
                    onCancel={() => setShowConfirmModal(false)}
                />
            )}

            {/* Undo Toast */}
            {showUndoToast && (
                <div className={`fixed bottom-6 right-6 z-50 ${toastExiting ? 'toast-exit' : 'toast'}`}>
                    <div className="flex items-center gap-3 bg-bg-elevated border border-border-default rounded-lg shadow-xl px-4 py-3">
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                        <p className="text-sm text-text-primary">Order created</p>
                        <button
                            onClick={handleUndo}
                            className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors ml-2"
                        >
                            <Undo2 className="w-3.5 h-3.5" />
                            Undo
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Extracted component for unmatched items (with its own product search state)
function UnmatchedItemCard({
    item,
    allProducts,
    onResolve,
}: {
    item: UnmatchedItem
    allProducts: Product[]
    onResolve: (item: UnmatchedItem, product: Product) => void
}) {
    const [showSearch, setShowSearch] = useState(false)

    return (
        <div className="relative p-3 bg-bg-tertiary rounded-lg border border-warning/20">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-text-primary">
                        &quot;{item.extracted.description}&quot;
                        {item.extracted.quantity && (
                            <span className="text-text-secondary ml-2">
                                × {item.extracted.quantity} {item.extracted.unit}
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">{item.reason}</p>
                </div>
            </div>

            {/* AI suggestions as quick-select buttons */}
            {item.suggestions.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs text-text-secondary mb-2">Suggested matches:</p>
                    <div className="flex flex-wrap gap-2">
                        {item.suggestions.map((suggestion, si) => (
                            <button
                                key={si}
                                onClick={() => onResolve(item, suggestion.product)}
                                className="px-3 py-1.5 bg-bg-elevated hover:bg-bg-hover border border-border-subtle hover:border-orange-500/50 rounded text-sm text-text-primary transition-colors cursor-pointer"
                            >
                                {suggestion.product.name}
                                <span className="text-text-tertiary ml-2">
                                    ({Math.round(suggestion.similarity * 100)}%)
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Searchable product picker */}
            <div className="mt-2 relative">
                <button
                    onClick={() => setShowSearch(!showSearch)}
                    className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                >
                    {showSearch ? 'Close search' : 'Or search all products...'}
                </button>
                {showSearch && (
                    <ProductSearchDropdown
                        products={allProducts}
                        onSelect={(product) => {
                            onResolve(item, product)
                            setShowSearch(false)
                        }}
                        onClose={() => setShowSearch(false)}
                    />
                )}
            </div>
        </div>
    )
}
