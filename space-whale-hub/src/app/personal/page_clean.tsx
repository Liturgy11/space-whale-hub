'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Plus, Edit3, Heart, Lock, Unlock, BookOpen, Palette, FileText, Camera, Save, Settings } from "lucide-react";
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
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
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
                <span className="text-xl font-space-whale-heading text-space-whale-navy">Inner Space</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowWallpaperCustomizer(true)}
                className="flex items-center px-3 py-2 text-space-whale-purple hover:text-space-whale-navy transition-colors font-space-whale-accent"
                title="Customize your space"
              >
                <Settings className="h-5 w-5 mr-2" />
                Customize
              </button>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-space-whale-heading text-space-whale-navy mb-2">
                Welcome home, {user?.user_metadata?.display_name || 'Space Whale'}! 🐋
              </h1>
              <p className="text-lg font-space-whale-body text-space-whale-navy">
                Your private space for reflection, creativity, and gentle becoming. 
                A soft place to land and explore what's forming within you.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-lofi flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
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
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Actions - Simplified */}
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6 text-center">What feels right today?</h2>
            
            {/* Reflection Prompt */}
            <div className="mb-6">
              {currentPrompt ? (
                <div className="p-4 bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 rounded-xl border-l-4 border-space-whale-purple">
                  <p className="text-lg text-space-whale-navy italic font-space-whale-body">
                    "{currentPrompt}"
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-space-whale-lavender/10 rounded-xl">
                  <p className="text-lg text-space-whale-purple text-center font-space-whale-body">
                    Need a gentle nudge? Get a reflection prompt
                  </p>
                </div>
              )}
              
              <button 
                onClick={generateRandomPrompt}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent"
              >
                {currentPrompt ? 'New Prompt' : 'Get Reflection Prompt'}
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="flex items-center p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl hover:from-pink-200 hover:to-purple-200 transition-all duration-300 group"
              >
                <FileText className="h-8 w-8 text-pink-500 mr-4 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-lg font-medium text-space-whale-navy">Write something</div>
                  <div className="text-sm text-space-whale-purple">words, thoughts, feelings</div>
                </div>
              </button>
              <button 
                onClick={() => setShowMoodBoardUpload(true)}
                className="flex items-center p-6 bg-gradient-to-r from-blue-100 to-teal-100 rounded-xl hover:from-blue-200 hover:to-teal-200 transition-all duration-300 group"
              >
                <Camera className="h-8 w-8 text-blue-500 mr-4 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-lg font-medium text-space-whale-navy">Create mood board</div>
                  <div className="text-sm text-space-whale-purple">visual inspiration</div>
                </div>
              </button>
            </div>
          </div>

          {/* Journal Entries - Clean Display */}
          <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6">Your Journey</h2>
            <JournalList key={refreshKey} />
          </div>
        </div>
      </main>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <MoodBoardUpload 
              onUploadComplete={async (urls, type) => {
                console.log('Mood board created:', urls, type);
                setShowMoodBoardUpload(false);
                
                // Create a journal entry with the mood board images
                try {
                  console.log('Starting mood board creation...', { userId: user.id, urlsCount: urls.length });
                  
                  const { createJournalEntry } = await import('@/lib/database');
                  
                  // Store all images as a JSON array in the content
                  const allImagesJson = JSON.stringify(urls);
                  console.log('Creating journal entry with data:', {
                    title: 'Mood Board',
                    content: `Created a mood board with ${urls.length} image${urls.length > 1 ? 's' : ''}`,
                    media_url: urls[0],
                    media_type: 'moodboard'
                  });
                  
                  const entry = await createJournalEntry(user.id, {
                    title: 'Mood Board',
                    content: `Created a mood board with ${urls.length} image${urls.length > 1 ? 's' : ''}`,
                    media_url: urls[0], // Use first image as primary display
                    media_type: 'moodboard',
                    is_private: true,
                    tags: urls // Store all image URLs in tags array for display
                  });
                  
                  console.log('Mood board journal entry created successfully:', entry);
                  
                  // Show success message
                  alert('✨ Mood board created successfully! ✨');
                  
                  // Trigger refresh of journal list
                  setRefreshKey(prev => prev + 1);
                } catch (error) {
                  console.error('Error creating mood board journal entry:', error);
                  alert(`❌ Error creating mood board: ${error.message}`);
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
