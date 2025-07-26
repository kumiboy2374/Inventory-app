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
import { BookOpen } from "lucide-react"
import useApi from "@/hooks/use-api"

export default function DashboardPage() {
	const [user, setUser] = useState<User | null>(null)
	const [books, setBooks] = useState<Book[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState("")
	const [layout, setLayout] = useState<"grid" | "list">("grid")

	const [checkoutBook, setCheckoutBook] = useState<Book | null>(null)
	const [editingBook, setEditingBook] = useState<Book | null | undefined>(undefined) // undefined for 'add', Book for 'edit'
	const [deletingBook, setDeletingBook] = useState<Book | null>(null)

	// API
	const bookApi = useApi()

	const addBook = (bookData: Book) => {
		const res = bookApi.request({
			method: "POST",
			url: "/books/add-book",
			data: {
				module: bookData.module,
				barcode: bookData.barcode,
				band: bookData.band,
				lessonNumber: bookData.lessonNumber,
				copyNumber: bookData.copyNumber,
			},
		})

		return res
	}

	const { toast } = useToast()

	useEffect(() => {
		const storedUser = localStorage.getItem("lessonLinkUser")
		if (storedUser) {
			setUser(JSON.parse(storedUser))
		}

		async function fetchBooks() {
			const res = await bookApi.request({ method: "GET", url: "/books" })
			setBooks(res.data)
		}
		fetchBooks()

		setTimeout(() => setIsLoading(false), 500)
	}, [])

	const handleSaveBook = (bookData: Book) => {
		if (editingBook) {
			// Editing existing book
			setBooks((prevBooks) => prevBooks.map((b) => (b.id === bookData.id ? bookData : b)))
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
		const bookToDelete = books.find((b) => b.id === bookId)
		setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookId))
		toast({
			title: "Success!",
			description: `"${bookToDelete?.module}" has been deleted.`,
		})
		setDeletingBook(null)
	}

	const handleCheckout = (bookId: string, studentName: string) => {
		setBooks((prevBooks) =>
			prevBooks.map((b) =>
				b.id === bookId ? { ...b, status: "lent", studentName: studentName } : b
			)
		)
		toast({
			title: "Success!",
			description: `Book has been checked out to ${studentName}.`,
		})
	}

	const handleCheckin = (bookId: string) => {
		const bookToCheckIn = books.find((b) => b.id === bookId)
		setBooks((prevBooks) =>
			prevBooks.map((b) =>
				b.id === bookId ? { ...b, status: "available", studentName: undefined } : b
			)
		)
		toast({
			title: "Success!",
			description: `"${bookToCheckIn?.module}" has been checked in.`,
		})
	}

	const filteredBooks = useMemo(() => {
		let booksToFilter = books
		if (user?.role === "bandA") {
			booksToFilter = books.filter((b) => b.band === "A")
		} else if (user?.role === "bandB") {
			booksToFilter = books.filter((b) => b.band === "B")
		}
		if (!searchQuery) return booksToFilter
		const lowercasedQuery = searchQuery.toLowerCase()
		return booksToFilter.filter(
			(book) =>
				book.barcode.toLowerCase().includes(lowercasedQuery) ||
				book.band.toLowerCase().includes(lowercasedQuery) ||
				book.module.toLowerCase().includes(lowercasedQuery) ||
				book.lessonNumber.toString().includes(lowercasedQuery) ||
				book.copyNumber.toString().includes(lowercasedQuery) ||
				book.studentName?.toLowerCase().includes(lowercasedQuery)
		)
	}, [books, searchQuery, user])

	const visibleBands = useMemo(() => {
		if (user?.role === "main") return ["A", "B"] as ("A" | "B")[]
		if (user?.role === "bandA") return ["A"] as ("A" | "B")[]
		if (user?.role === "bandB") return ["B"] as ("A" | "B")[]
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
			<BandSummary books={books} visibleBands={visibleBands} />

			<FilterControls
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				layout={layout}
				setLayout={setLayout}
				canManageBooks={user?.role === "main"}
				onAddBookClick={() => setEditingBook(null)}
			/>

			{filteredBooks.length > 0 ? (
				layout === "grid" ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
						{filteredBooks.map((book) => (
							<BookCard
								key={book.id}
								book={book}
								canManageBooks={user?.role === "main"}
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
								key={book.id}
								book={book}
								canManageBooks={user?.role === "main"}
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
