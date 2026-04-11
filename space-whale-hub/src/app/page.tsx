'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Archive, Users, BookOpen, User, Sparkles, ChevronDown, FileText, Image as ImageIcon, Video, Music, Share2, Star, Orbit, Heart, Key, Zap, Layers, RotateCcw, Loader2, Eye, Users2, Circle, Shield, CircleDot, CircleDotDashed } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import SetDisplayName from "@/components/SetDisplayName";
import WelcomeModal from "@/components/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";

function HomeContent() {
  const { user } = useAuth();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showSetDisplayName, setShowSetDisplayName] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  
  // Show display name modal if user doesn't have display_name set
  useEffect(() => {
    if (user && !user.user_metadata?.display_name) {
      setShowSetDisplayName(true);
    }
  }, [user]);

  // Show one-time welcome modal after first login
  useEffect(() => {
    if (!user) return;

    const key = `welcome_seen_${user.id}`;
    const localSeen = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const metadataSeen = user.user_metadata?.welcome_seen_at;

    if (!metadataSeen && !localSeen) {
      setShowWelcome(true);
    }
  }, [user]);

  async function handleWelcomeClose() {
    try {
      // Optimistically mark in localStorage
      if (user && typeof window !== 'undefined') {
        localStorage.setItem(`welcome_seen_${user.id}`, new Date().toISOString());
      }
      // Try to persist to Supabase
      if (user) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            welcome_seen_at: new Date().toISOString(),
          },
        });
      }
    } catch (_e) {
      // best-effort; localStorage fallback already set
    } finally {
      setShowWelcome(false);
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="min-h-screen bg-white">
      {/* Deep space background — fixed so it covers the full page */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ backgroundImage: 'url(/deep-space-orbits.png)', opacity: 0.38 }}
      />
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image
                src="/Space Whale_Social Only.jpg"
                alt="Space Whale Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-xl font-space-whale-heading text-space-whale-navy">Space Whale Portal</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/archive" className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                Constellation
              </Link>
              <Link href="/feed" className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                Community Orbit
              </Link>
              <Link href="/workshops" className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                Deep Space
              </Link>
              <Link href="/personal" className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                Inner Space
              </Link>
              <Link href="/about" className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                About
              </Link>
              {/* Admin-only links */}
              {user?.email === 'lizwamc@gmail.com' && (
                <>
                  <Link href="/admin" className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                    Admin
                  </Link>
                  <Link href="/admin/albums" className="text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent">
                    Albums
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Space Whale Logo */}
          <div className="mb-8">
            <Image
              src="/space-whale-social.png"
              alt="Space Whale"
              width={180}
              height={180}
              className="mx-auto rounded-full w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44"
              priority
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-space-whale-heading text-space-whale-navy mb-8">
            Welcome fellow travellers{" "}
            <span className="bg-gradient-to-r from-space-whale-purple via-accent-pink to-accent-orange bg-clip-text text-transparent">
              to the Space Whale Portal
            </span>
          </h1>

          {/* Explore Button */}
          <div className="mb-12">
            <div className="relative inline-block" ref={createMenuRef}>
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="group relative inline-flex items-center gap-2 px-8 py-3 rounded-full font-space-whale-accent text-space-whale-navy text-base bg-white/70 backdrop-blur-sm border-2 border-transparent hover:border-space-whale-purple/40 shadow-lg hover:shadow-space-whale-purple/20 transition-all duration-300"
                style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #a78bfa, #f472b6, #fb923c) border-box' }}
              >
                <span className="text-xl">🐋</span>
                Explore
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Explore Menu Dropdown */}
              {showCreateMenu && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-3 w-72 rounded-2xl shadow-xl z-50 border border-space-whale-purple/20 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(232,221,243,0.97) 0%, rgba(255,230,240,0.97) 60%, rgba(255,220,200,0.97) 100%)', backdropFilter: 'blur(12px)' }}>
                  <div className="p-2">
                    {[
                      { href: '/personal', emoji: '👁️', label: 'Inner Space', sub: 'Journal & reflect' },
                      { href: '/feed', emoji: '🪐', label: 'Community Orbit', sub: 'Share with community' },
                      { href: '/workshops', emoji: '🔭', label: 'Deep Space', sub: 'Workshops & resources' },
                      { href: '/archive?tab=network', emoji: '🍄', label: 'Mycelial Network', sub: 'Find your people' },
                      { href: '/archive', emoji: '✦', label: 'Constellation', sub: 'Archive & gallery' },
                    ].map(({ href, emoji, label, sub }) => (
                      <Link key={href} href={href} onClick={() => setShowCreateMenu(false)}
                        className="flex items-center gap-4 p-3 hover:bg-space-whale-purple/10 rounded-xl transition-colors text-left">
                        <span className="text-2xl w-8 text-center flex-shrink-0">{emoji}</span>
                        <div className="text-left">
                          <div className="font-medium text-space-whale-navy">{label}</div>
                          <div className="text-xs text-space-whale-purple">{sub}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Link href="/archive" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
                <Star className="h-12 w-12 text-purple-800 mb-4 mx-auto float-gentle" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Constellation</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  Archive of Space Whale events - pride poetry, community workshops, and creative gatherings.
                </p>
              </div>
            </Link>

            <Link href="/feed" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
                <Orbit className="h-12 w-12 text-yellow-500 mb-4 mx-auto float-gentle" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Community Orbit</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  The community stream. Connect with ND queers, nature lovers, artists, and seekers.
                </p>
              </div>
            </Link>

            <Link href="/workshops" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft group-hover:shadow-purple-200/50">
                <CircleDotDashed className="h-12 w-12 text-cyan-500 mb-4 mx-auto float-gentle group-hover:text-cyan-600" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Deep Space</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  Workshops and creative offerings to support your journey. Explore resources, online groups, and spaces to grow together.
                </p>
              </div>
            </Link>

            <Link href="/personal" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
                <Eye className="h-12 w-12 text-pink-400 mb-4 mx-auto float-gentle" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Inner Space</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  Your private journal for reflection and creativity. Write, collect inspiration, and explore prompts.
                </p>
              </div>
            </Link>
          </div>

        </div>
      </div>
      </main>

      {/* Land Acknowledgement */}
      <div className="bg-lofi-card rounded-xl p-6 mx-4 sm:mx-6 lg:mx-8 mb-8 rainbow-border-soft glow-soft">
        <p className="text-sm font-space-whale-body text-space-whale-navy">
          <strong>Land Acknowledgement:</strong> Space Whale operates on First Nations land, Darkinjung Country, 
          (Central Coast, NSW). We acknowledge sovereignty was never ceded and pay our respects to Elders 
          past, present and emerging. Always was, always will be Aboriginal land.
        </p>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Space Whale Portal • Created by Lit • 2025</p>
          </div>
        </div>
      </footer>

      {/* Set Display Name Modal */}
      {showSetDisplayName && (
        <SetDisplayName />
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal onClose={handleWelcomeClose} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
