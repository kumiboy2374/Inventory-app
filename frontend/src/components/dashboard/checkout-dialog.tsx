"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Book } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CheckoutDialogProps {
  book: Book | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: (bookId: string, studentName: string) => void;
}

export function CheckoutDialog({ book, isOpen, onOpenChange, onCheckout }: CheckoutDialogProps) {
  const [studentName, setStudentName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      setStudentName('');
    }
  }, [isOpen]);

  const handleCheckout = () => {
    if (!studentName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a student name.',
        variant: 'destructive',
      });
      return;
    }
    if (book) {
      onCheckout(book.id, studentName);
      onOpenChange(false);
    }
  };

  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Check Out Book</DialogTitle>
          <DialogDescription>
            Lending "{book.module}, Lesson {book.lessonNumber}" to a student.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student-name" className="text-right">
              Student
            </Label>
            <Input
              id="student-name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Jane Doe"
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCheckout} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Check Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
