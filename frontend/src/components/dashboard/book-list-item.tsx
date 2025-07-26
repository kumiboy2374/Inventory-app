
"use client"

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Book } from '@/lib/types';
import { LogIn, LogOut, User, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BookListItemProps {
  book: Book;
  canManageBooks: boolean;
  onCheckoutClick: (book: Book) => void;
  onCheckinClick: (bookId: string) => void;
  onEditClick: (book: Book) => void;
  onDeleteClick: (book: Book) => void;
}

export function BookListItem({ book, canManageBooks, onCheckoutClick, onCheckinClick, onEditClick, onDeleteClick }: BookListItemProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-xl animate-in fade-in-0">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative h-24 w-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                    src={book.coverImage}
                    alt={`Cover of ${book.module}`}
                    fill
                    className="object-cover"
                    data-ai-hint="book cover"
                />
            </div>
            <div className="grid gap-1 flex-grow">
                <h3 className="font-headline font-bold">{book.module}</h3>
                <p className="text-sm text-muted-foreground">
                    Lesson {book.lessonNumber}, Copy {book.copyNumber} &bull; Band {book.band} &bull; Barcode: {book.barcode}
                </p>
                {book.status === 'lent' && book.studentName && (
                    <div className="flex items-center text-sm text-foreground">
                        <User className="w-3 h-3 mr-1.5 text-muted-foreground" />
                        <span>Lent to: <strong>{book.studentName}</strong></span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-4 ml-auto flex-shrink-0 w-full sm:w-auto pt-4 sm:pt-0 mt-4 sm:mt-0 border-t sm:border-none">
                <Badge variant={book.status === 'lent' ? 'destructive' : 'secondary'} className="capitalize">{book.status}</Badge>
                <div className="flex-grow sm:flex-grow-0"></div>
                {book.status === 'available' ? (
                    <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto" onClick={() => onCheckoutClick(book)}>
                        <LogIn className="mr-2 h-4 w-4" /> Check Out
                    </Button>
                ) : (
                    <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => onCheckinClick(book.id)}>
                        <LogOut className="mr-2 h-4 w-4" /> Check In
                    </Button>
                )}
                {canManageBooks && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClick(book)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteClick(book)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
