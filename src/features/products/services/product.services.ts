import { createClient } from '@/utils/supabase/client'
import { createErrorResponse } from '@/utils/supabase/errors'
import { Product, ProductImages, ProductUpdate } from '../types'
import { type RequestResponse } from '@/types/request'
import { createSuccessResponse, getSuccessResponse, updateSuccessResponse } from '@/utils/supabase/success'
import { CREATE_PRODUCT_WITH_PRICE, TABLE, UPDATE_PRODUCT_WITH_PRICE } from '../constants'

const supabase = createClient()

export const getProducts = async (): Promise<RequestResponse<Product[]>> => {
  try {
      const { data,error } = await supabase.from(TABLE).select(`
        *, 
        product_prices (*),
        product_images (*)`)
    if (error) return createErrorResponse(error, 'No se pudieron obtener los productos')
    if (!data) return createErrorResponse(new Error('Sin datos'), 'No se encontraron productos')

    return getSuccessResponse(data as Product[])
  } catch (err) {
    return createErrorResponse(err, 'Error de red al obtener productos')
  }
}

export const getOneProduct = async (id: string): Promise<RequestResponse<Product>> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select(`
        *, 
        product_prices (*),
        product_images (*)`)
      .eq('id', id)
      .single()

    if (error) return createErrorResponse(error, 'No se pudo obtener el producto')
    if (!data) return createErrorResponse(new Error('Sin datos'), 'Producto no encontrado')

    return getSuccessResponse(data as Product)
  } catch (err) {
    return createErrorResponse(err, 'Error de red al obtener producto')
  }
}

export const syncProductImages = async (images: ProductImages[]): Promise<RequestResponse<ProductImages[]>> => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .insert(images)
      .select()

    if (error) return createErrorResponse(error, 'No se pudieron sincronizar las imágenes del producto')
    if (!data) return createErrorResponse(new Error('Sin datos'), 'No se encontraron imágenes sincronizadas')

    return getSuccessResponse(data as ProductImages[])
  } catch (err) {
    return createErrorResponse(err, 'Error de red al sincronizar imágenes del producto')
  }
}

export const updateProduct = async (data: Product): Promise<RequestResponse<Product>> => {
  console.log('data updateProduct', data)
  try {
      const formData = {
          _id: data.id,
          _is_active: data.is_active,
          _name: data.name,
          _presentation_type: data.presentation_type,
          _product_price_id: data.product_prices?.id,
          _purchase_price_box: data.product_prices?.purchase_price_box,
          _purchase_price_unit: data.product_prices?.purchase_price_unit,
          _reorder_quantity: data.reorder_quantity,
          _sale_price_box: data.product_prices?.sale_price_box,
          _sale_price_unit: data.product_prices?.sale_price_unit,
          _units_per_presentation: data.units_per_presentation,
          // _reorder_level: data.reorder_level,
          // _product_images: data.product_images?.map((item) => ({
          //   id: item.id,
          //   image_url: item.image_url || '',
          //   is_primary: item.is_primary || false,
          //   sort_order: item.sort_order || 0,
          // })) || [],
      }
      console.log('formData', formData)
    const { data: updated,error } = await supabase.rpc(UPDATE_PRODUCT_WITH_PRICE,formData)

    if (error) return createErrorResponse(error, 'No se pudo actualizar el producto')
    if (!updated) return createErrorResponse(new Error('Actualización sin retorno'), 'Producto no encontrado tras actualizar')

    return updateSuccessResponse(updated as Product)
  } catch (err) {
    return createErrorResponse(err, 'Error de red al actualizar producto')
  }
}

export const createProduct = async (data: Product): Promise<RequestResponse<Product>> => {
    console.log('data', data)
  try {
      const formData = {
          _name: data.name,
          _presentation_type: data.presentation_type,
          _units_per_presentation: data.units_per_presentation,
          _is_active: data.is_active,
          _reorder_level: data.reorder_level,
          _reorder_quantity: data.reorder_quantity,
          _purchase_price_box: data.product_prices?.purchase_price_box,
          _purchase_price_unit: data.product_prices?.purchase_price_unit,
          _sale_price_box: data.product_prices?.sale_price_box,
          _sale_price_unit: data.product_prices?.sale_price_unit,
          _product_images: data.product_images?.map((item) => ({
              image_url: item.image_url || '',
              is_primary: item.is_primary || false,
              sort_order: item.sort_order || 0,
          })) || [],
      }
      const { data: created,error } = await supabase.rpc(CREATE_PRODUCT_WITH_PRICE,formData);

    console.log('created', created)
    if (error) return createErrorResponse(error, 'No se pudo crear el producto')
    if (!created) return createErrorResponse(new Error('Inserción sin retorno'), 'No se obtuvo el producto creado')

    return createSuccessResponse(created as Product)
  } catch (err) {
    return createErrorResponse(err, 'Error de red al crear producto')
  }
}


