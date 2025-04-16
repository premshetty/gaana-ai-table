// components/UserFormModal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { User } from "@/app/lib/api"

export default function UserFormModal({
    open,
    onClose,
    onSubmit,
    user,
}: {
    open: boolean
    onClose: () => void
    onSubmit: (data: Partial<User>) => void
    user?: User
}) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    useEffect(() => {
        setName(user?.name || "")
        setEmail(user?.email || "")
    }, [user])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        className="w-full"
                        onClick={() => {
                            if (!name || !email) return
                            onSubmit({ name, email })
                            onClose()
                        }}
                    >
                        {user ? "Update" : "Create"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
