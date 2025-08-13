
// "use client"

// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { List, Grid, Search, ScanLine, PlusCircle } from 'lucide-react';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// interface FilterControlsProps {
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   layout: 'grid' | 'list';
//   setLayout: (layout: 'grid' | 'list') => void;
//   canManageBooks: boolean;
//   onAddBookClick: () => void;
// }

// export function FilterControls({ searchQuery, setSearchQuery, layout, setLayout, canManageBooks, onAddBookClick }: FilterControlsProps) {
//   return (
//     <div className="flex flex-col sm:flex-row items-center gap-4">
//       <div className="relative w-full sm:flex-grow">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <Input
//           type="search"
//           placeholder="Search by barcode, module, student name..."
//           className="pl-10 w-full"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>
//       <div className="flex items-center gap-2 w-full sm:w-auto">
//         {canManageBooks && (
//           <Button onClick={onAddBookClick} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
//             <PlusCircle />
//             Add Book
//           </Button>
//         )}
//         <TooltipProvider>
//             <Tooltip>
//                 <TooltipTrigger asChild>
//                     <Button variant="outline" size="icon" disabled>
//                         <ScanLine className="h-5 w-5" />
//                     </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                     <p>Scan Barcode (coming soon)</p>
//                 </TooltipContent>
//             </Tooltip>
        
//             <Tooltip>
//                 <TooltipTrigger asChild>
//                     <Button
//                         variant={layout === 'list' ? 'secondary' : 'ghost'}
//                         size="icon"
//                         onClick={() => setLayout('list')}
//                     >
//                         <List className="h-5 w-5" />
//                     </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                     <p>List View</p>
//                 </TooltipContent>
//             </Tooltip>
//             <Tooltip>
//                 <TooltipTrigger asChild>
//                     <Button
//                         variant={layout === 'grid' ? 'secondary' : 'ghost'}
//                         size="icon"
//                         onClick={() => setLayout('grid')}
//                     >
//                         <Grid className="h-5 w-5" />
//                     </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                     <p>Grid View</p>
//                 </TooltipContent>
//             </Tooltip>
//         </TooltipProvider>
//       </div>
//     </div>
//   );
// }"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { List, Grid, Search, ScanLine, PlusCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BarcodeScanner from "@/components/BarcodeScanner"; // make sure this exposes readerRef
import { BrowserMultiFormatReader } from "@zxing/browser";

interface FilterControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  layout: "grid" | "list";
  setLayout: (layout: "grid" | "list") => void;
  canManageBooks: boolean;
  onAddBookClick: () => void;
}

export function FilterControls({
  searchQuery,
  setSearchQuery,
  layout,
  setLayout,
  canManageBooks,
  onAddBookClick,
}: FilterControlsProps) {
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // ref to hold the ZXing reader so we can stop it manually
  const videoReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Handle scanning result
  const handleScan = (value: string) => {
    if (value !== lastScanned) {
      setSearchQuery(value);
      setLastScanned(value);
      setScanning(false);
    }
  };

  // Handle manual typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);

    // Stop scanner if it's running
    if (videoReaderRef.current) {
      BrowserMultiFormatReader.releaseAllStreams();
      videoReaderRef.current = null;
    }

    // Reset last scanned so user can scan again later
    setLastScanned(null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Search Input */}
      <div className="relative w-full sm:flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by barcode, module, student name..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={handleInputChange}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {canManageBooks && (
          <Button
            onClick={onAddBookClick}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle />
            Add Book
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setScanning(true)}
              >
                <ScanLine className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Scan Barcode</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={layout === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setLayout("list")}
              >
                <List className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>List View</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={layout === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setLayout("grid")}
              >
                <Grid className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid View</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Scanner Modal */}
      {scanning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[90%] max-w-md">
            <BarcodeScanner
              onScan={handleScan}
              onClose={() => setScanning(false)}
              readerRef={videoReaderRef}
            />
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => setScanning(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
