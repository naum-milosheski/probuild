import { getCategories } from '@/lib/data'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
    const categories = await getCategories()

    return <ProductForm categories={categories} />
}
