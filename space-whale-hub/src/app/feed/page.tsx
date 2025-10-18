'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Plus, Sparkles, Filter, Search, RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import PostForm from "@/components/feed/PostForm";
import FeedList from "@/components/feed/FeedList";

function CommunityFeedContent() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const aiPrompts = [
    "What is already growing and flourishing in your garden? Take time to notice what's thriving.",
    "Where in your body do you feel most held? What lives there? What constellation is forming inside you today?",
    "Hello, sky. What wisdom do you have for me today? Sit with a tree - what does it want to tell you about patience?",
    "You're in cocoon phase. What are you incubating? What wants to emerge when you're ready?",
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
    const randomIndex = Math.floor(Math.random() * aiPrompts.length);
    setCurrentPrompt(aiPrompts[randomIndex]);
  };

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
                <span className="text-xl font-bold text-gray-900 dark:text-white">Community Feed</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowPostForm(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Share
              </button>
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Community Portal
          </h1>
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            A sanctuary where your sensitivity is honoured, your creativity is sacred, and your becoming is witnessed. 
            Share what's forming and reforming in you. Connect with fellow space whales navigating by starlight and whale song.
          </p>
        </div>

        {/* Garden Invitation */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Garden Invitation</h2>
          </div>
          
          {currentPrompt ? (
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-indigo-500">
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{currentPrompt}"
              </p>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Click below to receive a gentle invitation for your garden
              </p>
            </div>
          )}
          
          <button 
            onClick={generateRandomPrompt}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-all duration-300 font-medium border border-indigo-200 dark:border-indigo-700"
          >
            {currentPrompt ? 'New Garden Invitation' : 'Generate Garden Invitation'}
          </button>
        </div>

        {/* Post Form Modal */}
        {showPostForm && (
          <div className="mb-8">
            <PostForm 
              onPostCreated={() => {
                setShowPostForm(false);
                setRefreshTrigger(prev => prev + 1); // Trigger feed refresh
              }}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        )}

        {/* Feed List */}
        <FeedList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default function CommunityFeed() {
  return (
    <ProtectedRoute>
      <CommunityFeedContent />
    </ProtectedRoute>
  );
}