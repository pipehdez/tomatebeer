"use client"

import { z } from 'zod'
import { PresentationType, Product, ProductImages } from '../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller,useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Card,CardContent,CardFooter } from '@/components/ui/card'
import { Field,FieldError,FieldGroup,FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { createProduct, syncProductImages, updateProduct } from '../services/product.services'
import { Separator } from "@/components/ui/separator"
import { log } from '@/lib/logs'
import { createClient } from '@/utils/supabase/client'
import { generateNameImage } from '@/utils/generateNameImage'
import Image from 'next/image'

const formSchema = z.object({
    id: z.string().optional(),
    images: z.array(z.instanceof(File)).optional(),
    name: z.string(),
    presentation_type: z.string(),
    units_per_presentation: z.number(),
    is_active: z.boolean(),
    reorder_level: z.number(),
    reorder_quantity: z.number(),
    product_prices: z.object({
        id: z.string().optional(),
        product_id: z.string(),
        purchase_price_box: z.number(),
        purchase_price_unit: z.number(),
        sale_price_box: z.number(),
        sale_price_unit: z.number(),
    }),
    product_images: z.array(z.object({
        id: z.string().optional(),
        product_id: z.string(),
        image_url: z.string(),
        is_primary: z.boolean(),
        sort_order: z.number(),
    })),
})

const initialValues: Product = {
    name: '',
    presentation_type: PresentationType.BOX,
    units_per_presentation: 0,
    is_active: true,
    reorder_level: 0,
    reorder_quantity: 0,
    product_prices: {
        id: '',
        product_id: '',
        purchase_price_box: 0,
        purchase_price_unit: 0,
        sale_price_box: 0,
        sale_price_unit: 0,
    },
    product_images: [
        {
            id: '',
            product_id: '',
            image_url: '',
            is_primary: false,
            sort_order: 0,
        },
    ],
}

interface ProductFormProps { data?: Product; onClose: () => void }

// const uploadedImages : ProductImages[] = []

export default function ProductForm({ data,onClose }: ProductFormProps) {
    const supabase = createClient()
    const [loading,setLoading] = useState(false)
    const [imagePreview,setImagePreview] = useState<string[]>([])
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    })

    useEffect(() => {
        log('form with images', form.getValues().images)
    }, [form.getValues().images])

    useEffect(() => {
        log('data form', data)
        if (data) {
            form.setValue('id', data.id)
            form.setValue('name', data.name)
            form.setValue('presentation_type', data.presentation_type)
            form.setValue('units_per_presentation', data.units_per_presentation)
            form.setValue('is_active', data.is_active)
            form.setValue('reorder_quantity', data.reorder_quantity)
            form.setValue('product_prices.id', data.product_prices?.id || '')
            form.setValue('product_prices.product_id', data.product_prices?.product_id || '')
            form.setValue('product_prices.purchase_price_box', data.product_prices?.purchase_price_box || 0)
            form.setValue('product_prices.purchase_price_unit', data.product_prices?.purchase_price_unit || 0)
            form.setValue('product_prices.sale_price_box', data.product_prices?.sale_price_box || 0)
            form.setValue('product_prices.sale_price_unit', data.product_prices?.sale_price_unit || 0)
            form.setValue('product_images', data.product_images?.map((item) => ({
                id: item.id || '',
                product_id: data.id || '',
                image_url: item.image_url || '',
                is_primary: item.is_primary || false,
                sort_order: item.sort_order || 0,
            })) || [])
        }
        data?.product_images?.forEach((item) => {
            downloadImage(item.image_url)
        })
    }, [form, data])

    async function downloadImage(path: string) {
        try {
            const { data,error } = await supabase.storage.from('product-images').download(path)
            if (error) {
                throw error
            }

            const url = URL.createObjectURL(data)
            setImagePreview((prev) => [...prev,url])
        } catch (error) {
            console.log('Error downloading image: ',error)
        }
    }

    
    // useEffect(() => {
    //     if (data?.product_images?.length) {
    //         data?.product_images.forEach((item) => {
    //             console.log('item', item)
    //             downloadImage(item.image_url)
    //         })
    //     }
    // }, [data])


    async function handleSave(data: z.infer<typeof formSchema>) {
        setLoading(true)
        log('data save', data)
        try {
            // Sube imágenes si existen
            const uploadedImages = await Promise.all(
                Array.from(data.images || []).map(async (file,index) => {
                    const filePath = generateNameImage(file,data.id || '')
                    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath,file)
                    if (uploadError) throw uploadError

                    // downloadImage(filePath)
                    // const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(filePath)
                    return {
                        product_id: data.id || '',
                        image_url: filePath,
                        is_primary: index === 0,
                        sort_order: index,
                    }
                })
            )

            // Actualiza lista final de imágenes
            // Combina las imágenes existentes con las nuevas, evitando duplicados por product_id
            // const existingImages = (data.product_images || []).filter(img => img.image_url);
            // const allImages = [...existingImages, ...uploadedImages];

            // log('allImages', allImages)
            const product: Product = {
                ...data,
                product_prices: {
                    ...data.product_prices,
                    product_id: data.id,
                },
                presentation_type: data.presentation_type as PresentationType,
            }

            log('product', product)
            
            const res = data.id ? await updateProduct(product) : await createProduct(product)
            if (res.success) {
                if (uploadedImages.length > 0) {
                    const syncRes = await syncProductImages(uploadedImages)
                    if (syncRes.error) {
                        toast.error(syncRes.error)
                        return
                    }
                }
            }

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(`Product ${data.id ? 'updated' : 'created'} successfully`)
                onClose()
            }
        } catch (err: any) {
            toast.error(err.message || 'Unexpected error')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <Card>
            <form id='form-rhf-product' onSubmit={form.handleSubmit(handleSave)} className='grid grid-cols-2 gap-4'>
            <CardContent>
                <h4 className="text-sm leading-none font-medium">Información del producto</h4>
                <Separator className="my-4" />
                <FieldGroup>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className='pb-2'>
                                <FieldLabel htmlFor="form-rhf-product-name">
                                    Product Name
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-rhf-product-name"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter product name"
                                    autoComplete="off"
                                    value={field.value}
                                    onChange={(e) => {
                                        field.onChange(e.target.value)
                                    }}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller
                        name="presentation_type"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-product-presentation_type">
                                    Presentation Type
                                </FieldLabel>
                                <Select
                                    name="form-rhf-product-presentation_type"
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger 
                                        id="form-rhf-select-type"
                                        aria-invalid={fieldState.invalid}
                                        className="min-w-[120px]"
                                    >
                                        <SelectValue placeholder="Select presentation type" />
                                    </SelectTrigger>
                                    <SelectContent onSelect={field.onChange}>
                                        {
                                            Object.values(PresentationType).map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller
                        name="units_per_presentation"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-product-units_per_presentation">
                                    Units per Presentation
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-rhf-product-units_per_presentation"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter units per presentation"
                                    autoComplete="off"
                                    type="number"
                                    inputMode="numeric"
                                    value={field.value}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (/^\d*$/.test(val)) {
                                            field.onChange(val === '' ? 0 : Number(val))
                                        }
                                    }}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller
                        name="is_active"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="form-rhf-switch-is_active"
                                    name={field.name}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-invalid={fieldState.invalid}
                                    // className='w-max h-6'
                                    data-invalid={fieldState.invalid}
                                />
                                <Label htmlFor="form-rhf-switch-is_active">Is Active</Label>
                            </div>
                                
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller
                        name="reorder_quantity"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-product-reorder_quantity">
                                    Reorder Quantity
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-rhf-product-reorder_quantity"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter product name"
                                    autoComplete="off"
                                    type="number"
                                    inputMode="numeric"
                                    value={field.value}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            field.onChange(val === '' ? 0 : Number(val))
                                        }
                                    }}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </CardContent>
            <CardContent>
                <h4 className="text-sm leading-none font-medium">Precios</h4>
                <Separator className="my-4" />
                <FieldGroup>
                    <Controller
                        name="product_prices.purchase_price_box"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-product-price-box">
                                    Product Price per Box
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-rhf-product-price-box"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter price"
                                    autoComplete="off"
                                    type="number"
                                    inputMode="numeric"
                                    value={field.value}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            field.onChange(val === '' ? 0 : Number(val))
                                        }
                                    }}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller
                        name="product_prices.purchase_price_unit"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-product-price-unit">
                                    Product Price per Unit
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-rhf-product-price-unit"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter price"
                                    autoComplete="off"
                                    type="number"
                                    inputMode="numeric"
                                    value={field.value}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            field.onChange(val === '' ? 0 : Number(val))
                                        }
                                    }}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller
                        name="product_prices.sale_price_box"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-product-price-box-sale">
                                    Sales Product Price per Box
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-rhf-product-price-box-sale"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter price"
                                    autoComplete="off"
                                    type="number"
                                    inputMode="numeric"
                                    value={field.value}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            field.onChange(val === '' ? 0 : Number(val))
                                        }
                                    }}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller
                        name="product_prices.sale_price_unit"
                        control={form.control}
                        render={({ field,fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-rhf-product-price-unit-sale">
                                    Sales Product Price per Unit
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="form-rhf-product-price-unit-sale"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Enter price"
                                    autoComplete="off"
                                    type="number"
                                    inputMode="numeric"
                                    value={field.value}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            field.onChange(val === '' ? 0 : Number(val))
                                        }
                                    }}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </FieldGroup>
            </CardContent>
            <CardContent>
                <h4 className="text-sm leading-none font-medium">Imagenes</h4>
                <Separator className="my-4" />
                <Controller
                    name="images"
                    control={form.control}
                    render={({ field,fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-product-images">
                                Product Images
                            </FieldLabel>
                            <Input
                                id="form-rhf-product-images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    const files = e.target.files
                                    if (files) {
                                        // Guarda en el form un array de File
                                        field.onChange(Array.from(files))
                                    }
                                }}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                    <div className='flex flex-row gap-4'>
                {
                        imagePreview.map((item, index) => (
                            <div key={item} className='relative w-24 h-24'>
                                <Image
                                    src={item}
                                    alt={`Product Image ${index}`}
                                    width={100}
                                    height={100}
                                />
                            </div>
                        ))
                    }
                    </div>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    {/* <Button onClick={data ? () => onEdit(form.getValues()) : () => onSubmit(form.getValues())} type="button" disabled={loading}>
                        {loading ? 'Loading ...' : (form.getValues().id ? 'Update' : 'Create')}
                    </Button> */}
                    <Button onClick={() => handleSave(form.getValues() as z.infer<typeof formSchema>)} type="button" disabled={loading}>
                        {loading ? 'Loading ...' : (form.getValues().id ? 'Update' : 'Create')}
                    </Button>
                    {/* <Button type="submit" form="form-rhf-product" disabled={loading}>
                        {loading ? 'Loading ...' : (form.getValues().id ? 'Update' : 'Create')}
                    </Button> */}
                </Field>
            </CardFooter>
            </form>
        </Card>
    )
}