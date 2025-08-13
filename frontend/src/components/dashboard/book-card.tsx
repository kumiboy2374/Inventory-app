"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/lib/types"
import { LogIn, LogOut, User, MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatModule } from "@/enum/module"

interface BookCardProps {
	book: Book
	canManageBooks: boolean
	onCheckoutClick: (book: Book) => void
	onCheckinClick: (bookId: string) => void
	onEditClick: (book: Book) => void
	onDeleteClick: (book: Book) => void
}

export function BookCard({
	book,
	canManageBooks,
	onCheckoutClick,
	onCheckinClick,
	onEditClick,
	onDeleteClick,
}: BookCardProps) {
	return (
		<Card className='flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-2xl animate-in fade-in zoom-in-95'>
			<CardHeader className='p-0'>
				<div className='relative aspect-[3/4]'>
					<Image
						src={book.coverImage}
						alt={`Cover of ${book.module}`}
						fill
						className='object-cover'
						data-ai-hint='book cover'
					/>
					<div className='absolute top-2 right-2 flex items-center gap-2'>
						<Badge
							variant={book.status === false ? "destructive" : "secondary"}
							className='capitalize'
						>
							{book.status}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className='p-4 flex-grow'>
				<div className='flex justify-between items-start'>
					<CardTitle className='text-lg font-headline mb-2 flex-1 pr-2'>
						{formatModule(Number(book.module))}
					</CardTitle>
					{canManageBooks && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' size='icon' className='h-8 w-8 flex-shrink-0'>
									<MoreVertical className='h-4 w-4' />
									<span className='sr-only'>More options</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem onClick={() => onEditClick(book)}>
									<Pencil className='mr-2 h-4 w-4' />
									<span>Edit</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => onDeleteClick(book)}
									className='text-destructive focus:text-destructive-foreground focus:bg-destructive'
								>
									<Trash2 className='mr-2 h-4 w-4' />
									<span>Delete</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
				<div className='text-sm text-muted-foreground space-y-1'>
					<p>
						{(book.band === "A" || book.band === "B") && (<>Lesson: {book.lessonNumber} <br/></>)}
						Copy: {book.copyNumber}
					</p>
					<p>Band: {book.band}</p>
					<p>Barcode: {book.barcode}</p>
					{book.status === false && book.studentName && (
						<div className='flex items-center pt-1 text-foreground'>
							<User className='w-4 h-4 mr-2 text-muted-foreground' />
							<strong>{book.studentName}</strong>
						</div>
					)}
				</div>
			</CardContent>
			<CardFooter className='p-4 pt-0'>
				{book.status === true ? (
					<Button
						className='w-full bg-accent text-accent-foreground hover:bg-accent/90'
						onClick={() => onCheckoutClick(book)}
					>
						<LogIn className='mr-2 h-4 w-4' /> Check Out
					</Button>
				) : (
					<Button variant='outline' className='w-full' onClick={() => onCheckinClick(book._id)}>
						<LogOut className='mr-2 h-4 w-4' /> Check In
					</Button>
				)}
			</CardFooter>
		</Card>
	)
}
