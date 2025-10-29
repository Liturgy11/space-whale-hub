'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Filter, Search, RefreshCw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import PostForm from "@/components/feed/PostForm";
import FeedList from "@/components/feed/FeedList";
import { useAuth } from "@/contexts/AuthContext";
import FirstPostModal from "@/components/FirstPostModal";

function CommunityFeedContent() {
  const { user } = useAuth();
  const [showPostForm, setShowPostForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFirstPostNote, setShowFirstPostNote] = useState(false);
  useEffect(() => {
    // No-op, but ensures we respond to user changes if needed
  }, [user]);

  function hasAcknowledged(): boolean {
    if (!user) return true; // if unknown, don't block
    const key = `first_post_ack_${user.id}`;
    const local = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return Boolean(user.user_metadata?.first_post_ack_at || local);
  }

  async function acknowledgeFirstPost() {
    if (!user) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`first_post_ack_${user.id}`, new Date().toISOString());
      }
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          first_post_ack_at: new Date().toISOString(),
        },
      });
    } catch (_e) {
      // localStorage fallback already set
    }
  }

  async function handleShareClick() {
    if (!hasAcknowledged()) {
      setShowFirstPostNote(true);
      return;
    }
    setShowPostForm(true);
  }


  return (
    <div className="min-h-screen bg-white">
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
                <span className="text-lg sm:text-xl font-space-whale-heading text-space-whale-navy">Community Orbit</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-space-whale-heading text-space-whale-navy">
              Community Orbit
            </h1>
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center justify-center px-4 py-2 text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Refresh
            </button>
          </div>
          <p className="text-base sm:text-lg font-space-whale-body text-space-whale-navy mb-4 sm:mb-6">
            Share your art, poetry, reflections, and inspiration. A cosy place to share and witness each other.
          </p>
          
          {/* Share Button */}
          <div className="mb-6 sm:mb-8">
            <button 
              onClick={handleShareClick}
              className="btn-lofi flex items-center justify-center w-full sm:w-auto"
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

      {/* First Post Gentle Note */}
      {showFirstPostNote && (
        <FirstPostModal
          onConfirm={async () => {
            await acknowledgeFirstPost();
            setShowFirstPostNote(false);
            setShowPostForm(true);
          }}
          onClose={() => setShowFirstPostNote(false)}
        />
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