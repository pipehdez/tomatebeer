import { DataTable } from '@/components/commons/table/data-table'
import { Product } from '../types'
import { ColumnDef } from '@tanstack/react-table'

const ProductTable = ({ products,columns,onCreate }: { products: Product[],columns: ColumnDef<Product>[], onCreate: () => void }) => {
    
    return (
        <div className="container mx-auto py-10">
            <DataTable
                columns={columns}
                data={products}
                filterColumn="name"
                filterPlaceholder="Filtrar por nombre..."
                onCreate={() => onCreate()}
            />
        </div>
    )
}

export default ProductTable