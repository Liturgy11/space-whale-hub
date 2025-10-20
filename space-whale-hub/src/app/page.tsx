'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Archive, Users, BookOpen, User, Sparkles, Plus, ChevronDown, FileText, Image as ImageIcon, Video, Music, Share2, Star, Orbit, Heart, Key } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

function HomeContent() {
  const { user } = useAuth();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

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
                The Archive
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
            </div>
            <div className="flex items-center space-x-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Space Whale Logo */}
          <div className="mb-8">
            <Image
              src="/Space Whale_Horizontal.jpg"
              alt="Space Whale - Art Therapy"
              width={400}
              height={120}
              className="mx-auto"
              priority
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-space-whale-heading text-space-whale-navy mb-6">
            Welcome fellow travelers{" "}
            <span className="bg-gradient-to-r from-space-whale-purple via-accent-pink to-accent-orange bg-clip-text text-transparent">
              to the Space Whale Portal
            </span>
          </h1>
          
          <p className="text-xl font-space-whale-body text-space-whale-navy mb-8 max-w-3xl mx-auto">
            A portal for reflection, sharing, and connection. A sanctuary where your sensitivity is honoured, 
            your creativity is sacred, and your becoming is witnessed. Online workshops and events coming in 2026...
          </p>

          {/* Create Button */}
          <div className="mb-12">
            <div className="relative inline-block" ref={createMenuRef}>
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="btn-lofi flex items-center mx-auto text-lg px-6 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create
                <ChevronDown className="h-5 w-5 ml-2" />
              </button>
              
              {/* Create Menu Dropdown */}
              {showCreateMenu && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-4 w-72 bg-lofi-card rounded-xl shadow-xl z-50 rainbow-border-soft">
                  <div className="p-3">
                    <div className="text-xs font-space-whale-playful text-space-whale-purple mb-3 px-2 text-center">
                      Choose Your Creation
                    </div>
                    
                    {/* Inner Space Entry */}
                    <Link 
                      href="/personal" 
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center p-4 hover:bg-space-whale-lavender/20 rounded-lg transition-colors mb-2"
                    >
                      <Heart className="h-6 w-6 text-pink-200 mr-4" />
                      <div>
                        <div className="font-medium text-space-whale-navy text-lg">Inner Space</div>
                        <div className="text-sm text-space-whale-purple">Private reflection</div>
                      </div>
                    </Link>
                    
                    {/* Community Orbit Post */}
                    <Link 
                      href="/feed" 
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center p-4 hover:bg-space-whale-lavender/20 rounded-lg transition-colors mb-2"
                    >
                      <Orbit className="h-6 w-6 text-pink-300 mr-4" />
                      <div>
                        <div className="font-medium text-space-whale-navy text-lg">Community Orbit</div>
                        <div className="text-sm text-space-whale-purple">Share with space whales</div>
                      </div>
                    </Link>
                    
                    {/* Archive Item */}
                    <Link 
                      href="/archive" 
                      onClick={() => setShowCreateMenu(false)}
                      className="flex items-center p-4 hover:bg-space-whale-lavender/20 rounded-lg transition-colors"
                    >
                      <Star className="h-6 w-6 text-blue-300 mr-4" />
                      <div>
                        <div className="font-medium text-space-whale-navy text-lg">Archive Item</div>
                        <div className="text-sm text-space-whale-purple">Add to community archive</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Link href="/archive" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
                <Star className="h-12 w-12 text-blue-300 mb-4 mx-auto float-gentle" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">The Archive</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  A collection of what's been harvested - poetry that sings, art that speaks, 
                  and the beautiful mess of creative becoming from fellow space whales.
                </p>
              </div>
            </Link>

            <Link href="/feed" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
                <Orbit className="h-12 w-12 text-pink-300 mb-4 mx-auto float-gentle" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Community Orbit</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  Share what's forming and reforming in you. Connect with fellow space whales navigating by starlight and whale song.
                </p>
              </div>
            </Link>

            <Link href="/workshops" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft group-hover:shadow-purple-200/50">
                <Sparkles className="h-12 w-12 text-purple-300 mb-4 mx-auto float-gentle group-hover:text-purple-400" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Deep Space</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  Take your journey deeper with art and therapy resources, online groups and workshops. 
                  Learn, create, and grow together in our trauma-informed, neuroaffirming community.
                </p>
              </div>
            </Link>

            <Link href="/personal" className="group">
              <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
                <Heart className="h-12 w-12 text-pink-200 mb-4 mx-auto float-gentle" />
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Inner Space</h3>
                <p className="text-space-whale-navy text-sm font-space-whale-body">
                  Your personal reflection and journaling space, mood board and optional tools to track mood and habits.
                </p>
              </div>
            </Link>
          </div>

          {/* Call to Action */}
          <div className="mt-12">
            <Link 
              href="/feed"
              className="btn-lofi inline-flex items-center text-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Your Journey
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Space Whale Hub - Where creativity meets community</p>
          </div>
        </div>
      </footer>
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
