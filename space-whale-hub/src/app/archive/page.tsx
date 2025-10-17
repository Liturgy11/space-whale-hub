import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Filter, Search, Play, Heart, MessageCircle, Tag } from "lucide-react";

export default function Archive() {
  // Mock data for demonstration
  const archiveItems = [
    {
      id: 1,
      title: "Pride Poetry: Rising from the Depths",
      artist: "Luna Starwhale",
      type: "video",
      thumbnail: "/api/placeholder/300/200",
      tags: ["pride", "poetry", "transformation"],
      likes: 24,
      comments: 8,
      duration: "3:42"
    },
    {
      id: 2,
      title: "Ocean Dreams - Digital Art Collection",
      artist: "Marina Blue",
      type: "artwork",
      thumbnail: "/api/placeholder/300/200",
      tags: ["digital art", "ocean", "dreams"],
      likes: 18,
      comments: 5,
      duration: null
    },
    {
      id: 3,
      title: "Healing Through Movement",
      artist: "River Flow",
      type: "video",
      thumbnail: "/api/placeholder/300/200",
      tags: ["movement", "healing", "dance"],
      likes: 31,
      comments: 12,
      duration: "7:15"
    },
    {
      id: 4,
      title: "Space Whale Meditation",
      artist: "Cosmic Wave",
      type: "video",
      thumbnail: "/api/placeholder/300/200",
      tags: ["meditation", "space", "whale"],
      likes: 42,
      comments: 15,
      duration: "12:30"
    },
    {
      id: 5,
      title: "Zine: Queer Ecology",
      artist: "Forest Spirit",
      type: "zine",
      thumbnail: "/api/placeholder/300/200",
      tags: ["zine", "queer", "ecology"],
      likes: 27,
      comments: 9,
      duration: null
    },
    {
      id: 6,
      title: "Underwater Symphony",
      artist: "Coral Song",
      type: "audio",
      thumbnail: "/api/placeholder/300/200",
      tags: ["music", "underwater", "symphony"],
      likes: 35,
      comments: 11,
      duration: "5:20"
    }
  ];

  const tags = ["pride", "poetry", "transformation", "digital art", "ocean", "dreams", "movement", "healing", "dance", "meditation", "space", "whale", "zine", "queer", "ecology", "music", "underwater", "symphony"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Hub
              </Link>
              <div className="flex items-center space-x-2">
                <Image
                  src="/Space Whale_Social Only.jpg"
                  alt="Space Whale Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Archive</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search archive..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Creative Archive
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Explore pride poetry videos, community artwork, and creative expressions from our space whale community.
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <Tag className="h-3 w-3 inline mr-1" />
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Archive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archiveItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-4">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  <span className="text-4xl">🐋</span>
                </div>
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                    {item.duration}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    {item.type}
                  </span>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {item.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {item.comments}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  by {item.artist}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            Load More Content
          </button>
        </div>
      </main>
    </div>
  );
}
