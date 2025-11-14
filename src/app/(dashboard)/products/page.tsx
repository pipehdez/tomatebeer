"use client"

import { Modal } from '@/components/commons/modal'
import ProductForm from '@/features/products/components/product-form'
import ProductTable from '@/features/products/components/product-table'
import { createColumns } from '@/features/products/components/table/columns'
import { getProducts } from '@/features/products/services/product.services'
import { Product } from '@/features/products/types'
import { useEffect, useState } from 'react'

export default function Products() {

    const [products, setProducts] = useState<Product[]>([])
    const [product, setProduct] = useState<Product>()

    const [isOpenCreated, setIsOpenCreated] = useState(false)
    const [isOpenEdited, setIsOpenEdited] = useState(false)

    console.log('products', products)
    useEffect(() => {
        const fetchProducts = async () => {
            const response = await getProducts()
            if (response.success) {
                setProducts(response.success && 'data' in response ? response.data : [])
            }
        }
        fetchProducts()
    },[])

    const handleSubmit = () => {
        setIsOpenCreated(true)
    }

    const handleEdit = (product: Product) => {
        setProduct(product)
        setIsOpenEdited(true)
    }

    const columns = createColumns({ onEdit: handleEdit })

    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px]">
            <main className="flex flex-col gap-[32px] row-start-2 sm:items-start">
                <ProductTable
                    products={products}
                    columns={columns}
                    onCreate={() => handleSubmit()}
                />
                <Modal
                    title="Create Product"
                    description="Create a new product"
                    isOpen={isOpenCreated}
                    onClose={() => setIsOpenCreated(false)}
                    onSubmit={handleSubmit}
                    component={
                        <ProductForm 
                            onClose={() => setIsOpenCreated(false)} 
                        />
                    }
                />
                <Modal
                    title="Edit Product"
                    description="Edit the selected product"
                    isOpen={isOpenEdited}
                    onClose={() => setIsOpenEdited(false)}
                    onSubmit={handleSubmit}
                    component={
                        <ProductForm 
                            data={product} 
                            onClose={() => setIsOpenEdited(false)}
                        />}
                />
            </main>
        </div>
    )
}