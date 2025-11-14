"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"


interface EditOwnerModalProps {
    isOpen: boolean
    title: string
    description: string
    onClose: () => void
    onSubmit: (data: FormData) => void
    component: React.ReactNode
}

export function Modal({ isOpen, title, description, onClose, onSubmit, component }: EditOwnerModalProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full sm:max-w-[725px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                {component}
            </DialogContent>
        </Dialog>
    )
}