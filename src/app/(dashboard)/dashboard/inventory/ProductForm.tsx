'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Package, Image as ImageIcon, AlertCircle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CustomSelect from '@/components/ui/CustomSelect'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import { createProduct, updateProduct, deleteProduct, type ProductFormState } from './actions'

interface Category {
    id: string
    name: string
}

interface Product {
    id: string
    sku: string
    name: string
    description: string | null
    category_id: string | null
    unit: string
    unit_price: number
    cost_price: number | null
    stock_qty: number
    min_stock_qty: number
    aliases: string[]
    image_url: string | null
    is_active: boolean
}

interface ProductFormProps {
    product?: Product
    categories: Category[]
}

const UNITS = [
    { value: 'each', label: 'Each' },
    { value: 'ft', label: 'Feet (ft)' },
    { value: 'roll', label: 'Roll' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'tank', label: 'Tank' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'gal', label: 'Gallon' },
]

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus()

    return (
        <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Save className="w-4 h-4" />
            )}
            {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
    )
}

export default function ProductForm({ product, categories }: ProductFormProps) {
    const isEdit = !!product
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [selectedCategory, setSelectedCategory] = useState(product?.category_id || '')
    const [selectedUnit, setSelectedUnit] = useState(product?.unit || '')
    const [imageUrl, setImageUrl] = useState(product?.image_url || '')
    const [uploading, setUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const action = isEdit
        ? updateProduct.bind(null, product.id)
        : createProduct

    const [state, formAction] = useActionState<ProductFormState, FormData>(action, {})

    // Transform categories for CustomSelect
    const categoryOptions = [
        { label: 'Select category...', value: '' },
        ...categories.map(c => ({ label: c.name, value: c.id }))
    ]

    const unitOptions = [
        { label: 'Select unit...', value: '' },
        ...UNITS
    ]

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                return
            }
            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            // Check if bucket exists/is accessible (optimistic)
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Upload Error:', uploadError)
                // Fallback for demo: just set a fake URL or alert
                alert('Storage not configured. Using placeholder image for demo.')
                setImageUrl('/images/products/placeholder.png')
            } else {
                const { data } = supabase.storage.from('products').getPublicUrl(filePath)
                setImageUrl(data.publicUrl)
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // ... (action definition)

    // ... (useEffect / useActionState)

    // ... (handleImageUpload)

    // New: Trigger Modal
    const handleDeleteClick = () => {
        setShowDeleteModal(true)
    }

    // New: Actual Delete Logic
    const confirmDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteProduct(product!.id)
            if (result.success) {
                router.push('/dashboard/inventory')
                router.refresh()
            } else {
                alert('Failed to delete product: ' + result.error)
                setIsDeleting(false)
                setShowDeleteModal(false)
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('An error occurred while deleting the product')
            setIsDeleting(false)
            setShowDeleteModal(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard/inventory"
                    className="p-2 hover:bg-bg-tertiary rounded-md transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-text-secondary" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-text-secondary mt-1">
                        {isEdit ? `Editing ${product.sku}` : 'Create a new product in your inventory'}
                    </p>
                </div>
            </div>

            {/* Error Banner */}
            {state.error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.error}
                </div>
            )}

            <form action={formAction} className="space-y-6">
                {/* Basic Info Card */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Package className="w-5 h-5 text-orange-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-text-primary">Product Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Image Upload - Full Width */}
                        <div className="md:col-span-2 mb-4">
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Product Image
                            </label>
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 bg-bg-tertiary rounded-lg border border-border-default flex items-center justify-center overflow-hidden relative group">
                                    {imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-text-tertiary" />
                                    )}
                                    {/* Overlay for Change */}
                                    {imageUrl && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-xs text-white font-medium">Change</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="block w-full text-sm text-text-secondary
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-orange-500/10 file:text-orange-500
                                            hover:file:bg-orange-500/20
                                            cursor-pointer"
                                        disabled={uploading}
                                    />
                                    <p className="mt-2 text-xs text-text-tertiary">
                                        {uploading ? 'Uploading...' : 'SVG, PNG, JPG or GIF (MAX. 800x400px)'}
                                    </p>
                                    <input type="hidden" name="image_url" value={imageUrl} />
                                </div>
                            </div>
                        </div>

                        {/* SKU */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                SKU <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="sku"
                                defaultValue={product?.sku}
                                placeholder="e.g., COP-050-L"
                                className={`input ${state.fieldErrors?.sku ? 'border-error' : ''}`}
                            />
                            {state.fieldErrors?.sku && (
                                <p className="text-error text-sm mt-1">{state.fieldErrors.sku}</p>
                            )}
                        </div>

                        {/* Category - Custom Select */}
                        <div>
                            <CustomSelect
                                label="Category"
                                name="category_id"
                                value={selectedCategory}
                                options={categoryOptions}
                                onChange={setSelectedCategory}
                            />
                        </div>

                        {/* Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Product Name <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={product?.name}
                                placeholder="e.g., 1/2&quot; Copper Pipe Type L"
                                className={`input ${state.fieldErrors?.name ? 'border-error' : ''}`}
                            />
                            {state.fieldErrors?.name && (
                                <p className="text-error text-sm mt-1">{state.fieldErrors.name}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                defaultValue={product?.description || ''}
                                placeholder="Optional product description..."
                                rows={3}
                                className="input resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing & Units Card */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Pricing & Units</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Unit - Custom Select */}
                        <div>
                            <CustomSelect
                                label="Unit *"
                                name="unit"
                                value={selectedUnit}
                                options={unitOptions}
                                onChange={setSelectedUnit}
                            />
                            {state.fieldErrors?.unit && (
                                <p className="text-error text-sm mt-1">{state.fieldErrors.unit}</p>
                            )}
                        </div>

                        {/* Unit Price */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Unit Price ($) <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                name="unit_price"
                                defaultValue={product?.unit_price}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className={`input ${state.fieldErrors?.unit_price ? 'border-error' : ''}`}
                            />
                            {state.fieldErrors?.unit_price && (
                                <p className="text-error text-sm mt-1">{state.fieldErrors.unit_price}</p>
                            )}
                        </div>

                        {/* Cost Price */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Cost Price ($)
                            </label>
                            <input
                                type="number"
                                name="cost_price"
                                defaultValue={product?.cost_price || ''}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="input"
                            />
                            <p className="text-text-tertiary text-xs mt-1">Your cost, for margin tracking</p>
                        </div>
                    </div>
                </div>

                {/* Inventory Card */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Inventory</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Stock Qty */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Current Stock
                            </label>
                            <input
                                type="number"
                                name="stock_qty"
                                defaultValue={product?.stock_qty || 0}
                                min="0"
                                step="1"
                                className="input"
                            />
                        </div>

                        {/* Min Stock */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1.5">
                                Minimum Stock Level
                            </label>
                            <input
                                type="number"
                                name="min_stock_qty"
                                defaultValue={product?.min_stock_qty || 0}
                                min="0"
                                step="1"
                                className="input"
                            />
                            <p className="text-text-tertiary text-xs mt-1">Alert when stock falls below this</p>
                        </div>
                    </div>
                </div>

                {/* AI Matching Card */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">AI Matching</h2>
                    <p className="text-text-secondary text-sm mb-4">
                        Add aliases to help Magic Import match contractor requests to this product.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            Aliases (comma-separated)
                        </label>
                        <input
                            type="text"
                            name="aliases"
                            defaultValue={product?.aliases?.join(', ') || ''}
                            placeholder="e.g., half inch copper, 1/2 copper pipe, 1/2&quot; copper"
                            className="input"
                        />
                        <p className="text-text-tertiary text-xs mt-1">
                            Common names contractors might use when ordering
                        </p>
                    </div>
                </div>

                {/* Active Status (Edit only) */}
                {isEdit && (
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary">Product Status</h2>
                                <p className="text-text-secondary text-sm">
                                    Inactive products won&apos;t appear in search or Magic Import
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="hidden"
                                    name="is_active"
                                    value={product.is_active ? 'true' : 'false'}
                                />
                                <input
                                    type="checkbox"
                                    defaultChecked={product.is_active}
                                    onChange={(e) => {
                                        const hidden = e.target.previousSibling as HTMLInputElement
                                        hidden.value = e.target.checked ? 'true' : 'false'
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-tertiary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between pt-4 border-t border-border-default mt-8">
                    {/* Delete Product (Left) */}
                    <div className="w-full md:w-auto">
                        {isEdit ? (
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                disabled={isDeleting}
                                className="btn justify-center w-full md:w-auto bg-error/10 text-error hover:bg-error/20 border-transparent transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Product
                            </button>
                        ) : (
                            <div className="hidden md:block"></div> // Spacer only needed on desktop if we strict justify-between
                        )}
                    </div>

                    {/* Submit Actions (Right) */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <Link href="/dashboard/inventory" className="btn btn-secondary justify-center w-full md:w-auto">
                            Cancel
                        </Link>
                        <div className="w-full md:w-auto flex flex-col">
                            <SubmitButton isEdit={isEdit} />
                        </div>
                    </div>
                </div>
            </form>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Product?"
                message={`Are you sure you want to delete "${product?.sku}"? This action cannot be undone and will remove the product from your inventory permanently.`}
                confirmText="Delete Product"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    )
}
