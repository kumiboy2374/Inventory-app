
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Book } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const bookFormSchema = z.object({
  module: z.string().min(1, 'Module name is required.'),
  barcode: z.string().min(1, 'Barcode is required.'),
  band: z.enum(['A', 'B'], { required_error: 'Please select a band.' }),
  lessonNumber: z.coerce.number().min(1, 'Lesson number must be at least 1.'),
  copyNumber: z.coerce.number().min(1, 'Copy number must be at least 1.'),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

interface BookFormDialogProps {
  book: Book | null | undefined; // null for new, Book for edit
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (book: Book) => void;
}

export function BookFormDialog({ book, isOpen, onOpenChange, onSave }: BookFormDialogProps) {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      module: '',
      barcode: '',
      band: 'A',
      lessonNumber: 1,
      copyNumber: 1,
    }
  });

  useEffect(() => {
    if (book) {
      form.reset({
        module: book.module,
        barcode: book.barcode,
        band: book.band,
        lessonNumber: book.lessonNumber,
        copyNumber: book.copyNumber,
      });
    } else {
      form.reset({
        module: '',
        barcode: '',
        band: 'A',
        lessonNumber: 1,
        copyNumber: 1,
      });
    }
  }, [book, form, isOpen]);

  const onSubmit = (data: BookFormValues) => {
    const newBookData: Book = {
      id: book?.id || new Date().toISOString(),
      status: book?.status || 'available',
      studentName: book?.studentName,
      coverImage: book?.coverImage || `https://placehold.co/300x400.png`,
      ...data,
    };
    onSave(newBookData);
    onOpenChange(false);
  };

  const isEditing = book !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of this book.' : 'Fill in the details for the new book.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Phonics Fun" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="band"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Band</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select band" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lessonNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="copyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Copy</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
