"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from '../../types'
import { formatCurrency } from '@/lib/formatCurrency'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/commons/table/data-table-column-header'

interface ColumnsProductProps {
    onEdit: (product: Product) => void
}

export const createColumns = ({ onEdit }: ColumnsProductProps): ColumnDef<Product>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Name" />
            )
        },
        cell: ({ row }) => row.original.name,
        enableSorting: true,
    },
    {
        accessorKey: "presentation_type",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Presentation Type" />
            )
        },
        cell: ({ row }) => row.original.presentation_type,
        enableSorting: true,
    },
    {
        accessorKey: "units_per_presentation",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Units per Presentation" />
            )
        },
        cell: ({ row }) => row.original.units_per_presentation,
        enableSorting: true,
    },
    {
        accessorKey: "purchase_price_box",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Purchase Price per Box" />
            )
        },
        cell: ({ row }) => formatCurrency(row.original.product_prices?.purchase_price_box || 0),
        enableSorting: true,
    },
    {
        accessorKey: "purchase_price_unit",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Purchase Price per Unit" />
            )
        },      
        cell: ({ row }) => formatCurrency(row.original.product_prices?.purchase_price_unit || 0),
        enableSorting: true,
    },
    {
        accessorKey: "sale_price_box",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Sale Price per Box" />
            )
        },
        cell: ({ row }) => formatCurrency(row.original.product_prices?.sale_price_box || 0),
        enableSorting: true,
    },
    {
        accessorKey: "sale_price_unit",
        header: ({ column }) => {
            return (
                <DataTableColumnHeader column={column} title="Sale Price per Unit" />
            )
        },
        cell: ({ row }) => formatCurrency(row.original.product_prices?.sale_price_unit || 0),
        enableSorting: true,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(product?.id || '')}
                        >
                            Copy product ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(product)}>Edit product</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]