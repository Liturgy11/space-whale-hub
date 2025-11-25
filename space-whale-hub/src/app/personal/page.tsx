'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Plus, Edit3, Heart, Lock, Unlock, BookOpen, Palette, FileText, Camera, Save, Settings, Sparkles, PenTool, Images, Sparkle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
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

  const prompts = [
    "What does your inner space whale look like today?",
    "Describe a moment when you felt most authentically yourself.",
    "What colors represent your current emotional landscape?",
    "Write a letter to your future self about your healing journey.",
    "What is already growing and flourishing in your garden? Take time to notice what's thriving.",
    "Your garden needs tending. What wants to be weeded? What wants to be watered?",
    "Are you sitting on seeds that could be planted? What's waiting to grow?",
    "What in your life is ready for composting? What's dead or dying that could nourish new growth?",
    "It's harvest time. What's ripe for the picking? What's ready to be shared?",
    "Where in your body do you feel most held? What lives there?",
    "Your body holds galaxies. What constellation is forming inside you today?",
    "If your nervous system had a landscape, what would grow there?",
    "What texture is your grief? What color does it want to become?",
    "Close your eyes. What does safety feel like in your body?",
    "Where are you in the life/death/life cycle right now? What's dying? What's being born?",
    "Are you lava, caterpillar, or butterfly today? Different parts of you might be in different stages.",
    "What season are you in? Spring's emergence? Summer's fullness? Autumn's letting go? Winter's rest?",
    "You're in cocoon phase. What are you incubating? What wants to emerge when you're ready?",
    "Time isn't linear. Your younger self is reaching through time - what do they need to hear?",
    "What's forming and reforming in you right now? What's dispersing?"
  ];

  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  const generateRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    setCurrentPrompt(prompts[randomIndex]);
  };

  const getWallpaperClass = () => {
    if (currentWallpaper.startsWith('data:image/')) {
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

  return (
    <div className={getWallpaperClass()} style={currentWallpaper.startsWith('data:image/') ? { backgroundImage: `url(${currentWallpaper})` } : {}}>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Hub</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Image
                  src="/Space Whale_Social Only.jpg"
                  alt="Space Whale Logo"
                  width={28}
                  height={28}
                  className="rounded-full sm:w-8 sm:h-8"
                />
                <span className="text-lg sm:text-xl font-space-whale-heading text-space-whale-navy">Inner Space</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowWallpaperCustomizer(true)}
                className="flex items-center px-2 py-2 sm:px-3 text-space-whale-purple hover:text-space-whale-navy transition-colors font-space-whale-accent"
                title="Customize your space"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Customize</span>
              </button>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-space-whale-heading text-space-whale-navy mb-2">
                Welcome home, {user?.user_metadata?.display_name || 'Space Whale'}! 🐋
              </h1>
              <p className="text-base sm:text-lg font-space-whale-body text-space-whale-navy">
                Your private space for reflection, creativity, and gentle becoming. 
                A soft place to land and explore what's forming within you.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-lofi flex items-center justify-center w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {showForm ? 'Cancel' : 'New Entry'}
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
            <h2 className="text-xl sm:text-2xl font-space-whale-subheading text-space-whale-navy mb-4 sm:mb-6 text-center">What feels right today?</h2>
            
            {/* Reflection Prompt */}
            <div className="mb-6 sm:mb-8">
              {currentPrompt ? (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-space-whale-lavender/30 via-accent-pink/20 to-space-whale-purple/20 rounded-2xl border-2 border-space-whale-purple/20 shadow-lg relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Sparkle className="h-5 w-5 text-space-whale-purple/40" />
                  </div>
                  <p className="text-base sm:text-lg text-space-whale-navy italic font-space-whale-body relative z-10">
                    "{currentPrompt}"
                  </p>
                </div>
              ) : (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-space-whale-lavender/10 to-accent-pink/10 rounded-2xl border border-space-whale-lavender/20">
                  <p className="text-base sm:text-lg text-space-whale-purple text-center font-space-whale-body">
                    Need a gentle nudge?
                  </p>
                </div>
              )}
              
              <button 
                onClick={generateRandomPrompt}
                className="w-full mt-4 px-6 py-3.5 bg-gradient-to-r from-space-whale-purple via-accent-pink to-space-whale-purple bg-size-200 bg-pos-0 hover:bg-pos-100 text-white rounded-2xl hover:shadow-xl transition-all duration-500 font-space-whale-accent flex items-center justify-center gap-2 group"
              >
                <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span>{currentPrompt ? 'New Prompt' : 'Get Reflection Prompt'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group border-2 border-pink-200/50 hover:border-pink-300"
              >
                <div className="mb-4 p-4 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="h-8 w-8 sm:h-10 sm:w-10 text-pink-600" />
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
                  <Images className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-semibold text-space-whale-navy mb-1">Mood Board</div>
                  <div className="text-sm text-space-whale-purple/70">visual inspiration</div>
                </div>
              </button>
            </div>
          </div>

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
                console.log('Media uploaded:', url, type);
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
                console.log('Mood board created:', urls, type, title);
                setShowMoodBoardUpload(false);
                
                // Create a journal entry with the mood board images
                try {
                  if (!user) {
                    console.error('User not authenticated');
                    return;
                  }
                  
                  console.log('Starting mood board creation...', { userId: user.id, urlsCount: urls.length, title });
                  
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
                  
                  console.log('Mood board journal entry created successfully:', entry);
                  
                  // Show success message
                  alert('✨ Mood board created successfully! ✨');
                  
                  // Trigger refresh of journal list
                  setRefreshKey(prev => prev + 1);
                } catch (error) {
                  console.error('Error creating mood board journal entry:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                  alert(`❌ Error creating mood board: ${errorMessage}`);
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
