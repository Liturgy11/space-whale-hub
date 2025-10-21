'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Plus, Edit3, Heart, Lock, Unlock, BookOpen, Palette, FileText, Camera, Save } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";
import JournalEntryForm from "@/components/journal/JournalEntryForm";
import JournalList from "@/components/journal/JournalList";
import MediaUpload from "@/components/media/MediaUpload";
import MoodBoardUpload from "@/components/media/MoodBoardUpload";

function PersonalSpaceContent() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showMoodBoardUpload, setShowMoodBoardUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEntryCreated = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1); // Trigger list refresh
  };
  // Mock data for demonstration
  const journalEntries = [
    {
      id: 1,
      title: "Morning Reflection",
      content: "Today I feel like a space whale swimming through cosmic waters. The art therapy session helped me connect with my inner strength...",
      date: "Today",
      isPrivate: true,
      mood: "peaceful"
    },
    {
      id: 2,
      title: "Creative Breakthrough",
      content: "Finally finished my zine about neurodivergent joy. The process was challenging but so rewarding. I'm proud of this creation.",
      date: "Yesterday",
      isPrivate: false,
      mood: "accomplished"
    },
    {
      id: 3,
      title: "Nature Connection",
      content: "Spent time in the garden today. The textures and colors reminded me of the ocean depths. Feeling grounded and connected.",
      date: "3 days ago",
      isPrivate: true,
      mood: "grounded"
    }
  ];

  const draftArtworks = [
    {
      id: 1,
      title: "Space Whale Meditation",
      type: "digital art",
      lastModified: "2 hours ago",
      thumbnail: "🎨"
    },
    {
      id: 2,
      title: "Ocean Dreams Zine",
      type: "zine",
      lastModified: "1 day ago",
      thumbnail: "📖"
    },
    {
      id: 3,
      title: "Neurodivergent Joy",
      type: "mixed media",
      lastModified: "3 days ago",
      thumbnail: "🌈"
    }
  ];

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

  return (
    <div className="min-h-screen bg-white">
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions - Tumblr Style */}
            <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
              <h2 className="text-xl font-space-whale-subheading text-space-whale-navy mb-4">What feels right today?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg hover:from-pink-200 hover:to-purple-200 transition-all duration-300 group"
                >
                  <FileText className="h-6 w-6 text-pink-500 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium text-space-whale-navy">Write something</div>
                    <div className="text-sm text-space-whale-purple">words, thoughts, feelings</div>
                  </div>
                </button>
                <button 
                  onClick={() => setShowMoodBoardUpload(true)}
                  className="flex items-center p-4 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg hover:from-blue-200 hover:to-teal-200 transition-all duration-300 group"
                >
                  <Camera className="h-6 w-6 text-blue-500 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium text-space-whale-navy">Add photos</div>
                    <div className="text-sm text-space-whale-purple">mood board vibes</div>
                  </div>
                </button>
                <button className="flex items-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg hover:from-yellow-200 hover:to-orange-200 transition-all duration-300 group">
                  <Palette className="h-6 w-6 text-orange-500 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium text-space-whale-navy">Make art</div>
                    <div className="text-sm text-space-whale-purple">doodles, collages, whatever</div>
                  </div>
                </button>
                <button className="flex items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg hover:from-green-200 hover:to-emerald-200 transition-all duration-300 group">
                  <BookOpen className="h-6 w-6 text-green-500 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium text-space-whale-navy">Create zine</div>
                    <div className="text-sm text-space-whale-purple">mini magazine magic</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Journal Entries - Tumblr Style */}
            <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
              <h2 className="text-xl font-space-whale-subheading text-space-whale-navy mb-6">Your thoughts & feelings</h2>
              <JournalList key={refreshKey} />
            </div>

            {/* Works in Progress - Tumblr Style */}
            <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-space-whale-subheading text-space-whale-navy">Works in progress</h2>
                <button className="flex items-center text-space-whale-purple hover:text-space-whale-navy transition-colors font-space-whale-accent">
                  <Plus className="h-4 w-4 mr-1" />
                  Start something
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {draftArtworks.map((artwork) => (
                  <div key={artwork.id} className="border border-space-whale-lavender/30 rounded-lg p-4 hover:bg-space-whale-lavender/10 transition-colors group">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform">{artwork.thumbnail}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-space-whale-navy font-space-whale-body">{artwork.title}</h3>
                        <p className="text-sm text-space-whale-purple">{artwork.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-space-whale-purple">
                        {artwork.lastModified}
                      </span>
                      <button className="text-space-whale-purple hover:text-space-whale-navy text-sm font-space-whale-accent transition-colors">
                        Continue →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reflection Prompt */}
            <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
              <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-4">Reflection Prompt</h3>
              
              {currentPrompt ? (
                <div className="mb-4 p-4 bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 rounded-lg border-l-4 border-space-whale-purple">
                  <p className="text-sm text-space-whale-navy italic font-space-whale-body">
                    "{currentPrompt}"
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-space-whale-lavender/10 rounded-lg">
                  <p className="text-sm text-space-whale-purple text-center font-space-whale-body">
                    Need a gentle nudge? Get a reflection prompt
                  </p>
                </div>
              )}
              
              <button 
                onClick={generateRandomPrompt}
                className="w-full px-4 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300 font-space-whale-accent"
              >
                {currentPrompt ? 'New Prompt' : 'Get Reflection Prompt'}
              </button>
            </div>

            {/* Creative Activity Generator */}
            <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
              <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-4">Creative Spark</h3>
              <p className="text-sm text-space-whale-purple mb-4 font-space-whale-body">
                Feeling stuck? Get a creative activity suggestion
              </p>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-accent-orange to-accent-yellow text-white rounded-lg hover:from-accent-orange/90 hover:to-accent-yellow/90 transition-all duration-300 font-space-whale-accent">
                Generate Activity
              </button>
            </div>

            {/* Privacy Settings */}
            <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
              <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-4">Privacy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-space-whale-navy font-space-whale-body">Default to Private</span>
                  <input type="checkbox" className="rounded border-space-whale-lavender" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-space-whale-navy font-space-whale-body">Share with Community</span>
                  <input type="checkbox" className="rounded border-space-whale-lavender" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-space-whale-navy font-space-whale-body">AI-Generated Prompts</span>
                  <input type="checkbox" className="rounded border-space-whale-lavender" defaultChecked />
                </div>
              </div>
            </div>

            {/* Your Journey Stats */}
            <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
              <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-4">Your journey</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-space-whale-purple font-space-whale-body">Journal entries</span>
                  <span className="text-sm font-medium text-space-whale-navy">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-space-whale-purple font-space-whale-body">Artworks created</span>
                  <span className="text-sm font-medium text-space-whale-navy">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-space-whale-purple font-space-whale-body">Days active</span>
                  <span className="text-sm font-medium text-space-whale-navy">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-space-whale-purple font-space-whale-body">Community shares</span>
                  <span className="text-sm font-medium text-space-whale-navy">5</span>
                </div>
              </div>
            </div>
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
