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

function PersonalSpaceContent() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
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
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </button>
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
                A sanctuary where your sensitivity is honoured, your creativity is sacred, and your becoming is witnessed. 
                This is your private garden - tend it with love, let it grow wild, let it rest when it needs to.
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
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="flex items-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-300">
                  <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">New Journal Entry</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Reflect on your day</div>
                  </div>
                </button>
                <button className="flex items-center p-4 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-lg hover:from-pink-200 hover:to-purple-200 dark:hover:from-pink-800 dark:hover:to-purple-800 transition-all duration-300">
                  <Palette className="h-6 w-6 text-pink-600 dark:text-pink-400 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Create Artwork</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Express yourself</div>
                  </div>
                </button>
                <button 
                  onClick={() => setShowMediaUpload(true)}
                  className="flex items-center p-4 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg hover:from-green-200 hover:to-blue-200 dark:hover:from-green-800 dark:hover:to-blue-800 transition-all duration-300"
                >
                  <Camera className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Upload Media</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Share your creations</div>
                  </div>
                </button>
                <button className="flex items-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg hover:from-yellow-200 hover:to-orange-200 dark:hover:from-yellow-800 dark:hover:to-orange-800 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Start Zine</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Create a zine</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Journal Entries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Journal Entries</h2>
              <JournalList key={refreshKey} />
            </div>

            {/* Draft Artworks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Draft Artworks</h2>
                <button className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                  <Plus className="h-4 w-4 mr-1" />
                  New Artwork
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {draftArtworks.map((artwork) => (
                  <div key={artwork.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{artwork.thumbnail}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{artwork.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{artwork.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {artwork.lastModified}
                      </span>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm">
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
            {/* Garden Invitation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Garden Invitation</h3>
              
              {currentPrompt ? (
                <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-lg border-l-4 border-indigo-500">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "{currentPrompt}"
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Click below to receive a gentle invitation for your garden
                  </p>
                </div>
              )}
              
              <button 
                onClick={generateRandomPrompt}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium"
              >
                {currentPrompt ? 'New Garden Invitation' : 'Generate Garden Invitation'}
              </button>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Default to Private</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Share with Community</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI-Generated Prompts</span>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Journey</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Journal Entries</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Artworks Created</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Days Active</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Community Shares</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">5</span>
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
