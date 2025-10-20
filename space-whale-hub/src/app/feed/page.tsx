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
                <span className="text-xl font-space-whale-heading text-space-whale-navy">Community Orbit</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowPostForm(true)}
                className="btn-lofi flex items-center"
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
          <h1 className="text-3xl font-space-whale-heading text-space-whale-navy">
            Community Orbit
          </h1>
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center px-4 py-2 text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
          <p className="text-lg font-space-whale-body text-space-whale-navy mb-6">
            A sanctuary where your sensitivity is honoured, your creativity is sacred, and your becoming is witnessed. 
            Share what's forming and reforming in you. Connect with fellow space whales navigating by starlight and whale song.
          </p>
        </div>

        {/* Garden Invitation */}
        <div className="bg-lofi-card rounded-xl p-6 mb-8 rainbow-border-soft glow-soft">
          <div className="flex items-center mb-4">
            <Sparkles className="h-6 w-6 text-accent-pink mr-2 float-gentle" />
            <h2 className="text-xl font-space-whale-subheading text-space-whale-navy">Garden Invitation</h2>
          </div>
          
          {currentPrompt ? (
            <div className="mb-4 p-4 bg-white/80 rounded-lg border-l-4 border-accent-pink">
              <p className="text-space-whale-navy italic font-space-whale-body">
                "{currentPrompt}"
              </p>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-white/50 rounded-lg">
              <p className="text-space-whale-navy text-center font-space-whale-body">
                Click below to receive a gentle invitation for your garden
              </p>
            </div>
          )}
          
          <button 
            onClick={generateRandomPrompt}
            className="w-full px-4 py-3 bg-white/80 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/20 transition-all duration-300 font-space-whale-accent border border-space-whale-lavender/30"
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