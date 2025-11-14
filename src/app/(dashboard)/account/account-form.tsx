'use client'
import { useCallback,useEffect,useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
    fullname: z
        .string()
        .min(5,"Full name must be at least 5 characters.")
        .max(32,"Full name must be at most 35 characters."),
    username: z
        .string()
        .min(5,"Username must be at least 5 characters.")
        .max(20,"Username must be at most 20 characters."),
    website: z
        .string()
        .min(5,"Website must be at least 5 characters.")
        .max(32,"Website must be at most 32 characters."),
    avatar_url: z
        .string()
})

export default function AccountForm({ user }: { user: User | null }) {
    const supabase = createClient()
    const [loading,setLoading] = useState(true)
    const [fullname,setFullname] = useState<string | undefined>("")
    const [username,setUsername] = useState<string | undefined>("")
    const [website,setWebsite] = useState<string | undefined>("")
    const [avatar_url,setAvatarUrl] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullname: fullname || "",
            username: username || "",
            website: website || "",
            avatar_url: avatar_url || "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            setLoading(true)

            const { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: data.fullname,
                username: data.username,
                website: data.website,
                avatar_url: data.avatar_url,
                updated_at: new Date().toISOString(),
            })
            
            if (error) throw error
            
            // Actualizar estados locales
            setFullname(data.fullname)
            setUsername(data.username)
            setWebsite(data.website)
            setAvatarUrl(data.avatar_url)
            
            toast.success("Perfil actualizado correctamente!")
        } catch (error) {
            toast.error("Error al actualizar el perfil")
            console.error('Error updating profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const getProfile = useCallback(async () => {
        try {
            setLoading(true)

            const { data,error,status } = await supabase
                .from('profiles')
                .select(`full_name, username, website, avatar_url`)
                .order('updated_at',{ ascending: false })

                .eq('id',user?.id)
                .single()

            if (error && status !== 406) {
                console.log(error)
                throw error
            }

            if (data) {
                setFullname(data.full_name)
                setUsername(data.username)
                setWebsite(data.website)
                setAvatarUrl(data.avatar_url)
                
                // Sincronizar con React Hook Form
                form.reset({
                    fullname: data.full_name || '',
                    username: data.username || '',
                    website: data.website || '',
                    avatar_url: data.avatar_url || ''
                })
            }
        } catch (error) {
            alert('Error loading user data!')
            console.log(error)
        } finally {
            setLoading(false)
        }
    },[user,supabase,form])

    useEffect(() => {
        getProfile()
    },[user,getProfile])

    async function updateProfile({
        username,
        website,
        avatar_url,
    }: {
        username: string | undefined
        website: string | undefined
        avatar_url: string | null
    }) {
        try {
            setLoading(true)

            const { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: fullname,
                username,
                website,
                avatar_url,
                updated_at: new Date().toISOString(),
            })
            if (error) throw error
            toast.success("Imagen actualizada correctamente!")
        } catch (error) {
            toast.error("Error al actualizar la imagen")
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Account Form</CardTitle>
                <CardDescription>
                    Update your account information.
                </CardDescription>
            </CardHeader>
            <CardContent>

                <Avatar
                    uid={user?.id ?? null}
                    url={avatar_url}
                    size={150}
                    onUpload={(url) => {
                        setAvatarUrl(url)
                        updateProfile({ username,website,avatar_url: url })
                    }}
                />

                <form id="form-rhf-account" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field >
                            <FieldLabel htmlFor="email">
                                Email
                            </FieldLabel>
                            <Input
                                id="email"
                                placeholder="Enter your email"
                                autoComplete="off"
                                value={user?.email}
                                disabled
                            />
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Controller
                            name="fullname"
                            control={form.control}
                            render={({ field,fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-account-fullname">
                                        Full Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-account-fullname"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your full name"
                                        autoComplete="off"
                                        value={form.getValues().fullname}
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
                            name="username"
                            control={form.control}
                            render={({ field,fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="username">
                                        Username
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-account-username"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your username"
                                        autoComplete="off"
                                        value={form.getValues().username}
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
                            name="website"
                            control={form.control}
                            render={({ field,fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="website">
                                        Website
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-account-website"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Enter your website"
                                        autoComplete="off"
                                        value={form.getValues().website}  
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                    
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button type="submit" form="form-rhf-account" disabled={loading}>
                        {loading ? 'Loading ...' : 'Update'}
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}