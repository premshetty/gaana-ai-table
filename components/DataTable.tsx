"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, EyeOff, EditIcon, Trash2Icon, Search } from "lucide-react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    type User,
} from "../app/lib/api"

import ConfirmModal from "./ConfirmModal"
import UserFormModal from "./UserFormModal"
import { useDebounce } from "../lib/hooks/useDebounce"

export default function DataTable() {
    const [data, setData] = useState<User[]>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 500)

    const [pageIndex, setPageIndex] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const [showFormModal, setShowFormModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const sortBy = sorting[0]?.id
            const sortOrder = sorting[0]?.desc ? "desc" : "asc"

            const res = await fetchUsers({
                pageIndex,
                pageSize,
                search: debouncedSearch,
                sortBy,
                sortOrder,
            })

            setData(res.data)
            setTotalCount(res.total)
        } catch (error) {
            console.error("Error fetching users:", error)
            toast("Error fetching users", { dismissible: true })
        } finally {
            setLoading(false)
        }
    }, [pageIndex, pageSize, debouncedSearch, sorting])

    useEffect(() => {
        setPageIndex(0)
    }, [debouncedSearch])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCreate = () => {
        setEditingUser(undefined)
        setShowFormModal(true)
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setShowFormModal(true)
    }

    const handleDeleteClick = (id: number) => {
        setUserIdToDelete(id)
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        if (userIdToDelete === null) return
        try {
            await deleteUser(userIdToDelete)
            toast("User deleted successfully")
            fetchData()
        } catch {
            toast("Failed to delete user")
        } finally {
            setShowDeleteModal(false)
            setUserIdToDelete(null)
        }
    }

    const handleSubmitUser = async (userData: Partial<User>) => {
        try {
            if (editingUser) {
                await updateUser(editingUser.id, { ...editingUser, ...userData })
                toast("User updated successfully")
            } else {
                if (!userData.name || !userData.email) {
                    toast("Validation error")
                    return
                }

                await createUser({
                    name: userData.name,
                    email: userData.email,
                    role: "Viewer",
                    status: "Active",
                })
                toast("User created successfully")
            }

            fetchData()
            setShowFormModal(false)
        } catch {
            toast("Failed to submit user")
        }
    }

    const columns = useMemo<ColumnDef<User>[]>(() => [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        { accessorKey: "role", header: "Role" },
        { accessorKey: "status", header: "Status" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(row.original)}>
                        <EditIcon className="text-blue-500" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(row.original.id)}>
                        <Trash2Icon className="text-red-500" />
                    </Button>
                </div>
            ),
        },
    ], [])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            pagination: { pageIndex, pageSize },
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: (updater) => {
            const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater
            setPageIndex(next.pageIndex)
            setPageSize(next.pageSize)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: Math.ceil(totalCount / pageSize),
    })

    return (
        <div className="flex justify-center p-4">
            <UserFormModal open={showFormModal} onClose={() => setShowFormModal(false)} onSubmit={handleSubmitUser} user={editingUser} />
            <ConfirmModal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} />

            <div className="w-full max-w-7xl space-y-4">
                {/* Search & Add */}
                <div className="flex items-center gap-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button onClick={handleCreate}>Add User</Button>
                </div>

                {/* Column toggles */}
                <div className="flex gap-2 flex-wrap">
                    {table.getAllLeafColumns().map((column) => (
                        <Button
                            key={column.id}
                            variant="outline"
                            onClick={() => column.toggleVisibility()}
                        >
                            {column.getIsVisible() ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} {column.id}
                        </Button>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={header.column.getCanSort() ? "cursor-pointer select-none flex items-center" : ""}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: " 🔼",
                                                        desc: " 🔽",
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(pageSize)].map((_, i) => (
                                    <TableRow key={i}>
                                        {columns.map((col) => (
                                            <TableCell key={col.id}>
                                                <Skeleton className="h-4 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount} users
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
