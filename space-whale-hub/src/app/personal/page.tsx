'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Plus, Edit3, Heart, Lock, Unlock, BookOpen, Palette, FileText, Camera, Save, Settings, Sparkles, Key } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/Toast";
import JournalEntryForm from "@/components/journal/JournalEntryForm";
import JournalList from "@/components/journal/JournalList";
import MediaUpload from "@/components/media/MediaUpload";
import MoodBoardUpload from "@/components/media/MoodBoardUpload";
import WallpaperCustomizer from "@/components/personal/WallpaperCustomizer";

function PersonalSpaceContent() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showMoodBoardUpload, setShowMoodBoardUpload] = useState(false);
  const [showWallpaperCustomizer, setShowWallpaperCustomizer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentWallpaper, setCurrentWallpaper] = useState<string>('minimal');

  const handleEntryCreated = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1); // Trigger list refresh
  };


  const getWallpaperClass = () => {
    // Check if it's a custom image (data URL or HTTP/HTTPS URL)
    const isCustomImage = currentWallpaper.startsWith('data:image/') || 
                         currentWallpaper.startsWith('http://') || 
                         currentWallpaper.startsWith('https://')
    
    if (isCustomImage) {
      return 'min-h-screen bg-cover bg-center bg-no-repeat'
    }
    
    const wallpapers: Record<string, string> = {
      'garden': 'min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100',
      'cosmic': 'min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900',
      'psychedelic': 'min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600',
      'minimal': 'min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }
    
    return wallpapers[currentWallpaper] || wallpapers['minimal']
  }

  const isCustomImage = currentWallpaper.startsWith('data:image/') || 
                       currentWallpaper.startsWith('http://') || 
                       currentWallpaper.startsWith('https://')

  return (
    <div className={getWallpaperClass()} style={isCustomImage ? { backgroundImage: `url(${currentWallpaper})` } : {}}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/Space Whale_Social Only.jpg"
                  alt="Space Whale Logo - Click to return home"
                  width={28}
                  height={28}
                  className="rounded-full sm:w-8 sm:h-8 cursor-pointer"
                />
                <span className="text-lg sm:text-xl font-space-whale-heading text-space-whale-navy">Inner Space</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-space-whale-heading text-space-whale-navy mb-2">
                Inner Space
              </h1>
              <p className="text-base sm:text-lg font-space-whale-body text-space-whale-navy">
                Your private space to reflect and create.
              </p>
            </div>
            <button
              onClick={() => setShowWallpaperCustomizer(true)}
              className="flex items-center justify-center px-4 py-3 sm:py-2 min-h-[44px] w-full sm:w-auto text-space-whale-purple hover:text-space-whale-navy transition-colors font-space-whale-accent border border-space-whale-lavender/30 rounded-lg hover:bg-space-whale-lavender/10 active:scale-[0.98] touch-manipulation"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
              <span>Customise</span>
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-8">
            <JournalEntryForm onSuccess={handleEntryCreated} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Simplified Layout */}
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Quick Actions - Simplified */}
          <div className="bg-lofi-card rounded-xl shadow-lg p-4 sm:p-8 rainbow-border-soft mobile-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group border-2 border-pink-200/50 hover:border-pink-300"
              >
                <div className="mb-4 p-4 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Key className="h-8 w-8 sm:h-10 sm:w-10 text-pink-600" />
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-semibold text-space-whale-navy mb-1">Journal</div>
                  <div className="text-sm text-space-whale-purple/70">words, thoughts, feelings</div>
                </div>
              </button>
              <button 
                onClick={() => setShowMoodBoardUpload(true)}
                className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-teal-50 to-blue-50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group border-2 border-blue-200/50 hover:border-blue-300"
              >
                <div className="mb-4 p-4 bg-gradient-to-br from-blue-200 to-teal-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg 
                    className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    {/* Simple crescent moon - single line */}
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-semibold text-space-whale-navy mb-1">Mood Board</div>
                  <div className="text-sm text-space-whale-purple/70">visual inspiration</div>
                </div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-space-whale-lavender/30 mx-auto my-6 sm:my-8"></div>

          {/* Journal Entries - Clean Display */}
          <div className="bg-lofi-card rounded-xl shadow-lg p-4 sm:p-8 rainbow-border-soft mobile-card overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-space-whale-subheading text-space-whale-navy mb-4 sm:mb-6">Your Journey</h2>
            <div className="overflow-x-hidden">
              <JournalList key={refreshKey} />
            </div>
          </div>

        </div>
      </main>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="w-full max-w-2xl mobile-modal">
            <MediaUpload 
              onUploadComplete={(url, type) => {
                setShowMediaUpload(false);
                // TODO: Add to user's media collection
              }}
              onCancel={() => setShowMediaUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Mood Board Upload Modal */}
      {showMoodBoardUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="w-full max-w-4xl mobile-modal">
            <MoodBoardUpload 
              onUploadComplete={async (urls, type, title) => {
                setShowMoodBoardUpload(false);
                
                // Create a journal entry with the mood board images
                try {
                  if (!user) {
                    console.error('User not authenticated');
                    return;
                  }
                  
                  // Use the secure API route instead of direct database function
                  const response = await fetch('/api/create-journal-entry-secure', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      title: title || 'Mood Board',
                      content: `Created a mood board with ${urls.length} image${urls.length > 1 ? 's' : ''}`,
                      mood: undefined,
                      tags: urls, // Store all image URLs in tags array for display
                      media_url: urls[0], // Use first image as primary display
                      media_type: 'moodboard',
                      is_private: true,
                      userId: user.id
                    })
                  });

                  const result = await response.json();

                  if (!result.success) {
                    throw new Error(result.error || 'Failed to create mood board journal entry');
                  }

                  const entry = result.entry;
                  
                  // Show success message
                  toast('✨ Mood board created successfully! ✨', 'success');
                  
                  // Trigger refresh of journal list
                  setRefreshKey(prev => prev + 1);
                } catch (error) {
                  console.error('Error creating mood board journal entry:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                  toast(`❌ Error creating mood board: ${errorMessage}`, 'error');
                }
              }}
              onCancel={() => setShowMoodBoardUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Wallpaper Customizer Modal */}
      {showWallpaperCustomizer && (
        <WallpaperCustomizer
          onClose={() => setShowWallpaperCustomizer(false)}
          onWallpaperChange={(wallpaper) => {
            setCurrentWallpaper(wallpaper)
            setShowWallpaperCustomizer(false)
          }}
        />
      )}
    </div>
  );
}

export default function PersonalSpace() {
  return (
    <ProtectedRoute>
      <PersonalSpaceContent />
    </ProtectedRoute>
  );
}
