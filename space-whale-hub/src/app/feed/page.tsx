'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import SpacePageHeader from "@/components/layout/SpacePageHeader";
import { SpaceIllustration } from "@/components/ui/EmptyState";
import { SPACE_ILLUSTRATIONS } from "@/lib/space-illustrations";
import PostForm from "@/components/feed/PostForm";
import FeedList from "@/components/feed/FeedList";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import FirstPostModal from "@/components/FirstPostModal";
import { secureFetch } from "@/lib/secure-fetch";

function CommunityFeedContent() {
  const { user, loading: authLoading } = useRequireAuth();
  const [showPostForm, setShowPostForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFirstPostNote, setShowFirstPostNote] = useState(false);
  const [acknowledgedThisSession, setAcknowledgedThisSession] = useState(false);
  const [firstPostAckAt, setFirstPostAckAt] = useState<string | null>(null);
  const [showNetworkBanner, setShowNetworkBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('network_banner_dismissed');
  });
  useEffect(() => {
    if (!user) {
      setFirstPostAckAt(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await secureFetch('/api/get-profile-secure');
        const result = await res.json();
        if (!cancelled && result.success) {
          setFirstPostAckAt(result.data?.first_post_ack_at ?? null);
        }
      } catch {
        // ignore — session flag still prevents re-show
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  function hasAcknowledged(): boolean {
    if (!user) return true;
    if (acknowledgedThisSession) return true;
    return Boolean(firstPostAckAt);
  }

  async function acknowledgeFirstPost() {
    setAcknowledgedThisSession(true);
    if (!user) return;
    try {
      await secureFetch('/api/update-profile-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          first_post_ack_at: new Date().toISOString(),
        }),
      });
      setFirstPostAckAt(new Date().toISOString());
    } catch (_e) {
      // silently fail — session flag above ensures modal won't reappear
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
    <AppShell
      showDesktopNav
      showUserProfile
      logoSize="sm"
      backgroundImage="/fun-stars.png"
      backgroundOpacity={0.28}
      mainClassName="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8"
    >
        <SpacePageHeader
          iconSrc="/illustrations/star-baby.png"
          title="Community Orbit"
          description="Share your art, poetry, reflections, and inspiration. A cosy place to share and witness each other."
        >
          {/* Mycelial Network banner */}
          {showNetworkBanner && (
            <div className="mt-4 sm:mt-6 mb-6 flex items-start justify-between gap-3 bg-gradient-to-r from-space-whale-lavender/30 to-accent-pink/20 border border-space-whale-lavender/40 rounded-xl px-4 py-3">
              <SpaceIllustration
                src={SPACE_ILLUSTRATIONS.mycelialNetwork}
                className="h-6 w-6 flex-shrink-0 mt-0.5"
              />
              <p className="flex-1 text-sm font-space-whale-body text-space-whale-navy">
                <strong>New:</strong> The{' '}
                <Link href="/archive?tab=network" className="underline underline-offset-2 hover:text-space-whale-purple transition-colors">
                  Mycelial Network
                </Link>{' '}
                is here — place your spore in the forest.
              </p>
              <button
                onClick={() => {
                  localStorage.setItem('network_banner_dismissed', '1');
                  setShowNetworkBanner(false);
                }}
                aria-label="Dismiss"
                className="text-space-whale-purple/60 hover:text-space-whale-purple transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Share Button */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={handleShareClick}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-space-whale-navy text-white font-space-whale-accent text-sm shadow-md hover:bg-space-whale-navy/80 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Share
            </button>
          </div>
        </SpacePageHeader>


        {/* Post Form Modal */}
        {showPostForm && (
          <PostForm
            onPostCreated={() => {
              setShowPostForm(false)
              setRefreshTrigger((prev) => prev + 1)
            }}
            onCancel={() => setShowPostForm(false)}
          />
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

        {/* Feed List — renders cached posts immediately; refreshes once auth is ready */}
        <FeedList
          userId={user?.id}
          authLoading={authLoading}
          refreshTrigger={refreshTrigger}
        />
    </AppShell>
  );
}

export default function CommunityFeed() {
  return <CommunityFeedContent />;
}