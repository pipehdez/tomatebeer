export enum PresentationType {
    BOX = 'box',
    UNIT = 'unit',
    SIXPACK = 'sixpack',
}

export type Product = {
    id?: string
    name: string
    presentation_type: PresentationType
    units_per_presentation: number
    is_active: boolean
    reorder_level?: number
    reorder_quantity: number
    product_prices?: ProductPrice
    product_images?: ProductImages[]
}

export type ProductUpdate = Omit<Product, 'id'>

export type ProductPrice = {
    id?: string
    product_id?: string
    purchase_price_box: number
    purchase_price_unit: number
    sale_price_box: number
    sale_price_unit: number
}

export type ProductImages = {
    id?: string
    product_id?: string
    image_url: string
    is_primary: boolean
    sort_order: number
}