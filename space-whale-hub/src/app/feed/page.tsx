'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Plus, Sparkles, Filter, Search } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import PostForm from "@/components/feed/PostForm";
import FeedList from "@/components/feed/FeedList";

function CommunityFeedContent() {
  const [showPostForm, setShowPostForm] = useState(false);

  const aiPrompts = [
    "What does your inner space whale look like? Draw or describe the colors, patterns, and energy that represent your authentic self.",
    "Create a gratitude mandala using only natural materials you can find around you today.",
    "Write a letter to your younger self - what would you want them to know about their journey ahead?",
    "Design a safe space in your mind. What elements make you feel most protected and free to be yourself?"
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Community Feed
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Share reflections, zines, and resources. Connect with fellow space whales in our trauma-informed, 
            neuroaffirming, and gender-affirming community.
          </p>
        </div>

        {/* AI Prompts Section */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Creative Prompts</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {aiPrompts.map((prompt, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm">{prompt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Post Form Modal */}
        {showPostForm && (
          <div className="mb-8">
            <PostForm 
              onPostCreated={() => {
                setShowPostForm(false);
                // TODO: Refresh feed list
              }}
              onCancel={() => setShowPostForm(false)}
            />
          </div>
        )}

        {/* Feed List */}
        <FeedList />
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