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
import {BookOpen } from "lucide-react"
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
			updateBook(bookData._id, bookData)			//update book in backend
			setBooks((prevBooks) => prevBooks.map((b) => (b._id === bookData._id ? bookData : b)))
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

		// Call async but don’t return the promise — just handle it
		deleteBook(bookToDelete._id)
			.then(() => {
				setBooks((prevBooks) => prevBooks.filter((b) => b._id !== bookId))
				toast({ title: "Success!", description: `${bookToDelete.barcode} has been deleted.` })
				setDeletingBook(null)
				fetchBooks()
			})
			.catch((error) => {
				console.error(error)
				toast({ title: "Error", description: "Failed to delete book.", variant: "destructive" })
			})
	}
 
	const handleCheckout = async (bookId: string, Name: string) => {
		try{
		await updateBook(bookId, {status: false, studentName: Name})
		setBooks((prevBooks) =>
			prevBooks.map((b) =>
				b._id === bookId ? { ...b, status: false, studentName: Name } : b
			)
		)
		toast({
			title: "Success!",
			description: `Book has been checked out to ${Name}.`,
		})}catch(e){
			console.error("Error checking out book:", e)
			toast({
				title: "Error",
				description: "Failed to check out book.",
				variant: "destructive",
			})
		}
	}

	const handleCheckin = async (bookId: string) => {
		try{
			await updateBook(bookId,{status: true, studentName: null})
		
		const bookToCheckIn = books.find((b) => b._id === bookId) || checkoutBook
		setBooks((prevBooks) =>
			prevBooks.map((b) =>
				b._id === bookId ? { ...b, status: true, studentName: undefined } : b
			)
		)
		toast({
			title: "Success!",
			description: `"${bookToCheckIn?.module}" has been checked in.`,
		})
	}catch(e){
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
			booksToFilter = books.filter((b) => b.band === "A")
		} else if (user?.role === "Band B") {
			booksToFilter = books.filter((b) => b.band === "B")
		}
		if (!searchQuery) return booksToFilter
		const lowercasedQuery = searchQuery.toLowerCase()
		return booksToFilter.filter(
			(book) =>
				book.barcode.toLowerCase().includes(lowercasedQuery) ||
				book.band.toLowerCase().includes(lowercasedQuery) ||
				book.module.toString().includes(lowercasedQuery) ||
				book.lessonNumber.toString().includes(lowercasedQuery) ||
				book.copyNumber.toString().includes(lowercasedQuery) ||
				book.studentName?.toLowerCase().includes(lowercasedQuery)
		)
	}, [books, searchQuery, user])
const visibleModules: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

	const visibleBands = useMemo(() => {
		if (user?.role === "Main") return ["A", "B", "C", "D", "E", "F"] as ("A" | "B" |"C" | "D" | "E" | "F")[]
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

			{filteredBooks.length > 0 ? (
				layout === "grid" ? (
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
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
