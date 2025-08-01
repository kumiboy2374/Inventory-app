
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Book } from "@/lib/types";

interface DeleteBookDialogProps {
  book: Book | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bookId: string) => void;
}

export function DeleteBookDialog({ book, isOpen, onOpenChange, onConfirm }: DeleteBookDialogProps) {
  if (!book) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the book
            <span className="font-semibold"> "{book.module}, Lesson {book.lessonNumber}, Copy {book.copyNumber}" </span>
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(book._id)}
            className={buttonVariants({ variant: "destructive" })}
          >
            Delete Book
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// This is needed because AlertDialogAction doesn't accept a variant prop directly
// but we want to style it like a destructive button.
// This is a small utility to get the class names for a button variant.
import { cva } from "class-variance-authority";
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
