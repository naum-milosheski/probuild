import { notFound } from 'next/navigation'
import { getProductById, getCategories } from '@/lib/data'
import ProductForm from '../ProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const [product, categories] = await Promise.all([
        getProductById(id),
        getCategories()
    ])

    if (!product) {
        notFound()
    }

    return <ProductForm product={product as any} categories={categories} />
}
