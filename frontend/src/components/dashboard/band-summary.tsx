import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Book } from '@/lib/types';
import { Library, CheckCircle2, XCircle } from 'lucide-react';

interface BandSummaryProps {
  books: Book[];
  visibleBands: ('A' | 'B')[];
}

export function BandSummary({ books, visibleBands }: BandSummaryProps) {
  const summaryData = visibleBands.map(band => {
    const bandBooks = books.filter(b => b.band === band);
    const total = bandBooks.length;
    const lent = bandBooks.filter(b => b.status === 'lent').length;
    const available = total - lent;
    return { band, total, lent, available };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {summaryData.map(({ band, total, lent, available }) => (
        <Card key={band}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Band {band} Summary</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total} <span className="text-sm font-medium text-muted-foreground">Total Books</span></div>
            <div className="flex pt-1 text-xs text-muted-foreground">
              <div className="flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1 text-primary" />
                  {available} Available
              </div>
              <div className="flex items-center ml-4">
                  <XCircle className="h-3 w-3 mr-1 text-destructive" />
                  {lent} Lent Out
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
