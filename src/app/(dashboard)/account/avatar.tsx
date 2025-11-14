'use client'
import React,{ useEffect,useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Upload } from 'lucide-react'
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { generateNameImage } from '@/utils/generateNameImage'

export default function AvatarUser({
    uid,
    url,
    size,
    onUpload,
}: {
    uid: string | null
    url: string | null
    size: number
    onUpload: (url: string) => void
}) {
    const supabase = createClient()
    const [avatarUrl,setAvatarUrl] = useState<string | null>(url)
    const [uploading,setUploading] = useState(false)

    useEffect(() => {
        async function downloadImage(path: string) {
            try {
                const { data,error } = await supabase.storage.from('avatars').download(path)
                if (error) {
                    throw error
                }

                const url = URL.createObjectURL(data)
                setAvatarUrl(url)
            } catch (error) {
                console.log('Error downloading image: ',error)
            }
        }

        if (url) downloadImage(url)
    },[url,supabase])

    

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const filePath = generateNameImage(file, uid || '')

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath,file)

            if (uploadError) {
                throw uploadError
            }

            onUpload(filePath)
        } catch (error) {
            alert('Error uploading avatar!')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="avatar-container flex flex-col items-center justify-center">
            <div className='relative w-fit'>
                <Avatar className="avatar rounded-full" style={{ height: size,width: size }}>
                    <AvatarImage src={avatarUrl ?? ''} />
                    <AvatarFallback>AH</AvatarFallback>
                </Avatar>
                <div style={{ width: size }} className='focus-visible:ring-ring/50 absolute -right-1 -bottom-1 inline-flex cursor-pointer items-center justify-end rounded-full focus-visible:ring-[3px] focus-visible:outline-none w-8 h-8'>
                    <Label className="button p-1 rounded-2xl primary block text-center cursor-pointer text-background bg-slate-950" htmlFor="single">
                        {uploading ? <Spinner className='size-5 text-background' /> : <Upload className='size-5 text-background' /> }
                    </Label>
                    <Input
                        style={{
                            visibility: 'hidden',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                        }}
                        type="file"
                        id="single"
                        accept="image/*"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                </div>
            </div>
        </div>
    )
}