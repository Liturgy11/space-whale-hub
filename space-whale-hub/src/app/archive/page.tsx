import Link from "next/link";
import Image from "next/image";
import { Filter, Search, Tag } from "lucide-react";
import ArchivePage from "@/components/archive/ArchivePage";

export default function Archive() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-space-whale-lavender/20 via-white to-space-whale-purple/10">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-space-whale-lavender/80 to-space-whale-purple/80 backdrop-blur-md border-b border-space-whale-purple/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16" suppressHydrationWarning>
            <div className="flex items-center space-x-4" suppressHydrationWarning>
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/Space Whale_Social Only.jpg"
                  alt="Space Whale Logo - Click to return home"
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer"
                />
                <span className="text-xl font-space-whale-heading text-space-whale-navy">Constellation</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search moved to ArchivePage component */}
            </div>
          </div>
        </div>
      </nav>

      <ArchivePage />
    </div>
  );
}
