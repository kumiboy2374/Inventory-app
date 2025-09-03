"use client"

import { useState, useEffect, useMemo } from "react"
import type { Book, User } from "@/lib/types"
import { BandSummary } from "@/components/dashboard/band-summary"
import { FilterControls } from "@/components/dashboard/filter-controls"
import { BookCard } from "@/components/dashboard/book-card"
import { BookListItem } from "@/components/dashboard/book-list-item"
import { CheckoutDialog } from "@/components/dashboard/checkout-dialog"
import { BookFormDialog } from "@/components/dashboard/book-form-dialog"
import { DeleteBookDialog } from "@/components/dashboard/delete-book-dialog"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, LogOut, UserIcon } from "lucide-react"
import useApi from "@/hooks/use-api"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar"
import { Button, DayPicker, DayPickerProvider } from "react-day-picker"
import { formatModule, MODULES } from "@/enum/module"

type FilterOpts = {
    band?: ("A" | "B" | "C" | "D" | "E" | "F")[]
    module?: [1, 2, 3, 4]
    lessonNumber?: number[]
    copyNumber?: number[]
    status?: boolean
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [books, setBooks] = useState<Book[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [layout, setLayout] = useState<"grid" | "list">("grid")
    const [filterOpts, setFilterOpts] = useState<FilterOpts>({
        band: undefined,
        module: undefined,
        lessonNumber: undefined,
        copyNumber: undefined,
        status: undefined,
    })
    const [checkoutBook, setCheckoutBook] = useState<Book | null>(null)
    const [editingBook, setEditingBook] = useState<Book | null | undefined>(undefined) // undefined for 'add', Book for 'edit'
    const [deletingBook, setDeletingBook] = useState<Book | null>(null)

    // API
    const bookApi = useApi()

    const addBook = (bookData: Book) => {
        console.log("Save id:", bookData._id)
        const res = bookApi.request({
            method: "POST",
            url: "/books/add-book",
            data: bookData,
        })
        return res
    }

    const deleteBook = async (bookId: string) => {
        console.log("Frontend book id:", bookId)
        const res = await bookApi.request({
            method: "DELETE",
            url: "/books/delete-book",
            data: { id: bookId },
        })
        return res
    }

    const updateBook = async (bookId: string, updates: Partial<Book>) => {
        const res = await bookApi.request({
            method: "PATCH",
            url: `/books/update-book/${bookId}`,
            data: updates,
        })
        return res
    }

    async function fetchBooks() {
        const res = await bookApi.request({ method: "GET", url: "/books" })
        setBooks(res.data)
    }

    const { toast } = useToast()

    useEffect(() => {
        const storedUser = localStorage.getItem("lessonLinkUser")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        fetchBooks()
        setTimeout(() => setIsLoading(false), 500)
    }, [])

    const handleSaveBook = (bookData: Book) => {
        console.log("Received in handleSaveBook:", bookData)
        if (editingBook) {
            // Editing existing book
            updateBook(bookData._id, bookData) //update book in backend
            setBooks((prevBooks) =>
                prevBooks.map((b) => (b._id === bookData._id ? bookData : b))
            )
            toast({ title: "Success!", description: "Book has been updated." })
        } else {
            // Adding new book
            addBook(bookData)
            setBooks((prevBooks) => [bookData, ...prevBooks])
            toast({ title: "Success!", description: "New book has been added." })
        }
        setEditingBook(undefined)
    }

    const handleDeleteBook = (bookId: string) => {
        const bookToDelete = books.find((b) => b._id === bookId) || deletingBook
        console.log(bookToDelete)
        console.log("Book id:", bookToDelete?._id)
        if (!bookToDelete) {
            console.error("Book not found")
            return
        }

        deleteBook(bookToDelete._id)
            .then(() => {
                setBooks((prevBooks) =>
                    prevBooks.filter((b) => b._id !== bookId)
                )
                toast({
                    title: "Success!",
                    description: `${bookToDelete.barcode} has been deleted.`,
                })
                setDeletingBook(null)
                fetchBooks()
            })
            .catch((error) => {
                console.error(error)
                toast({
                    title: "Error",
                    description: "Failed to delete book.",
                    variant: "destructive",
                })
            })
    }

    const handleCheckout = async (bookId: string, Name: string) => {
        try {
            await updateBook(bookId, { status: false, studentName: Name })
            setBooks((prevBooks) =>
                prevBooks.map((b) =>
                    b._id === bookId
                        ? { ...b, status: false, studentName: Name }
                        : b
                )
            )
            toast({
                title: "Success!",
                description: `Book has been checked out to ${Name}.`,
            })
        } catch (e) {
            console.error("Error checking out book:", e)
            toast({
                title: "Error",
                description: "Failed to check out book.",
                variant: "destructive",
            })
        }
    }

    const handleCheckin = async (bookId: string) => {
        try {
            await updateBook(bookId, { status: true, studentName: null })
            const bookToCheckIn = books.find((b) => b._id === bookId) || checkoutBook
            setBooks((prevBooks) =>
                prevBooks.map((b) =>
                    b._id === bookId
                        ? { ...b, status: true, studentName: undefined }
                        : b
                )
            )
            toast({
                title: "Success!",
                description: `"${bookToCheckIn?.module}" has been checked in.`,
            })
        } catch (e) {
            console.error("Error checking in book:", e)
            toast({
                title: "Error",
                description: "Failed to check in book.",
                variant: "destructive",
            })
        }
    }

    const filteredBooks = useMemo(() => {
        let booksToFilter = books
        if (user?.role === "Band A") {
            booksToFilter = booksToFilter.filter((b) => b.band === "A")
        } else if (user?.role === "Band B") {
            booksToFilter = booksToFilter.filter((b) => b.band === "B")
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase()
            booksToFilter = booksToFilter.filter(
                (book) =>
                    book.barcode.toLowerCase().includes(lowercasedQuery) ||
                    book.band.toLowerCase().includes(lowercasedQuery) ||
                    book.module.toString().includes(lowercasedQuery) ||
                    book.lessonNumber.toString().includes(lowercasedQuery) ||
                    book.copyNumber.toString().includes(lowercasedQuery) ||
                    book.studentName?.toLowerCase().includes(lowercasedQuery)
            )
        }

        booksToFilter = booksToFilter.filter((book) => {
            if (filterOpts.band && filterOpts.band.length > 0 && !filterOpts.band.includes(book.band as any)) return false
            if (filterOpts.module && filterOpts.module.length > 0 && !filterOpts.module.includes(book.module as MODULES)) return false
            if (filterOpts.lessonNumber && filterOpts.lessonNumber.length > 0 && !filterOpts.lessonNumber.includes(book.lessonNumber)) return false
            if (filterOpts.copyNumber && filterOpts.copyNumber.length > 0 && !filterOpts.copyNumber.includes(book.copyNumber)) return false
            if (typeof filterOpts.status === "boolean" && book.status !== filterOpts.status) return false
            return true
        })

        return booksToFilter
    }, [books, searchQuery, user, filterOpts])

    const visibleModules: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4]

    const visibleBands = useMemo(() => {
        if (user?.role === "Main") return ["A", "B", "C", "D", "E", "F"] as ("A" | "B" | "C" | "D" | "E" | "F")[]
        if (user?.role === "Band A") return ["A"] as ("A" | "B")[]
        if (user?.role === "Band B") return ["B"] as ("A" | "B")[]
        return []
    }, [user])

    if (isLoading) {
        return (
            <div className='space-y-8'>
                <div className='grid gap-4 md:grid-cols-2'>
                    <Skeleton className='h-[108px] w-full' />
                    <Skeleton className='h-[108px] w-full' />
                </div>
                <Skeleton className='h-10 w-full' />
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className='h-[350px] w-full rounded-lg' />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-8'>
            <BandSummary books={books} visibleBands={visibleBands} visibleModules={visibleModules} />
            <FilterControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                layout={layout}
                setLayout={setLayout}
                canManageBooks={user?.role === "Main"}
                onAddBookClick={() => setEditingBook(null)}
            />

            <div className="flex width-full justify-around gap-2">
                {Object.keys(filterOpts).map((f, i) => {
                    const key = Object.keys(filterOpts).at(i) as keyof FilterOpts
                    const value = filterOpts[key]

                    const options: Record<string, (string | number | boolean)[]> = {
                        band: ["A", "B", "C", "D", "E", "F"],
                        module: [
                            MODULES.Creator_DivineGuidance,
                            MODULES.Rasulullah_Aimmah,
                            MODULES.Ghaybah_SelfPurification,
                            MODULES.Wellbeing_Hereafter,
                        ],
                        lessonNumber: [1, 2, 3, 4, 5],
                        copyNumber: [1, 2, 3],
                        status: [true, false],
                    }

                    return (
                        <DropdownMenu key={i}>
                            <DropdownMenuTrigger asChild>
                                <button className="border-2 rounded-sm px-3 py-1 hover:bg-primary hover:text-primary-foreground transition">
                                    <span className="font-medium">{f}</span>
                                    <span className="mx-4">
                                        {Array.isArray(value) ? value.join(", ") : value?.toString() || "None"}
                                    </span>
                                    <span>▼</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32 rounded-sm border-2 bg-popover text-center">
                                {options[key]?.map((opt) => (
                                    <DropdownMenuCheckboxItem
                                        key={opt.toString()}
                                        checked={Array.isArray(value) ? value.includes(opt as never) : value === opt}
                                        onCheckedChange={(checked) => {
                                            setFilterOpts((prev) => {
                                                const arr = Array.isArray(prev[key]) ? (prev[key] as number[]) : []
                                                return {
                                                    ...prev,
                                                    [key]: checked ? [...arr, opt as number] : arr.filter((v) => v !== opt),
                                                }
                                            })
                                        }}
                                        className="my-2 hover:bg-primary"
                                    >
                                        {key === "module" ? formatModule(opt as MODULES) : opt.toString()}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                })}
            </div>

            {filteredBooks.length > 0 ? (
                layout === "grid" ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 -z-10'>
                        {filteredBooks.map((book) => (
                            <BookCard
                                key={book._id}
                                book={book}
                                canManageBooks={user?.role === "Main"}
                                onCheckoutClick={() => setCheckoutBook(book)}
                                onCheckinClick={handleCheckin}
                                onEditClick={() => setEditingBook(book)}
                                onDeleteClick={() => setDeletingBook(book)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {filteredBooks.map((book) => (
                            <BookListItem
                                key={book._id}
                                book={book}
                                canManageBooks={user?.role === "Main"}
                                onCheckoutClick={() => setCheckoutBook(book)}
                                onCheckinClick={handleCheckin}
                                onEditClick={() => setEditingBook(book)}
                                onDeleteClick={() => setDeletingBook(book)}
                            />
                        ))}
                    </div>
                )
            ) : (
                <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 text-center py-16 text-muted-foreground'>
                    <BookOpen className='h-12 w-12 mb-4' />
                    <h3 className='text-xl font-semibold font-headline'>No books found</h3>
                    <p>Try adjusting your search query.</p>
                </div>
            )}

            <CheckoutDialog
                book={checkoutBook}
                isOpen={!!checkoutBook}
                onOpenChange={(open) => !open && setCheckoutBook(null)}
                onCheckout={handleCheckout}
            />

            <BookFormDialog
                book={editingBook}
                isOpen={editingBook !== undefined}
                onOpenChange={(open) => !open && setEditingBook(undefined)}
                onSave={handleSaveBook}
            />

            <DeleteBookDialog
                book={deletingBook}
                isOpen={!!deletingBook}
                onOpenChange={(open) => !open && setDeletingBook(null)}
                onConfirm={handleDeleteBook}
            />
        </div>
    )
}
