'use client'

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Plus, Filter, Search, RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import PostForm from "@/components/feed/PostForm";
import FeedList from "@/components/feed/FeedList";

function CommunityFeedContent() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


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
            Share what's forming and reforming in you. Connect with fellow space whales navigating by starlight and whale song.
          </p>
          
          {/* Share Button */}
          <div className="mb-8">
            <button 
              onClick={() => setShowPostForm(true)}
              className="btn-lofi flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
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