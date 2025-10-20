import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Filter, Search, Tag } from "lucide-react";
import ArchivePage from "@/components/archive/ArchivePage";

export default function Archive() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4" suppressHydrationWarning>
              <Link href="/" className="flex items-center text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Portal
              </Link>
              <div className="flex items-center space-x-2">
                <Image
                  src="/Space Whale_Social Only.jpg"
                  alt="Space Whale Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-xl font-space-whale-heading text-space-whale-navy">The Archive</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-space-whale-purple" />
                <input
                  type="text"
                  placeholder="Search by tags: pride poetry, art therapy, neurodivergent..."
                  className="pl-10 pr-4 py-2 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                  suppressHydrationWarning
                />
              </div>
              <button className="btn-lofi flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ArchivePage />
    </div>
  );
}
