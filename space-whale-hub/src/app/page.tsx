'use client'

import Link from "next/link";
import Image from "next/image";
import { Archive, Users, BookOpen, User, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/contexts/AuthContext";

function HomeContent() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
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
              <span className="text-xl font-bold text-gray-900 dark:text-white">Space Whale Portal</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/archive" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                The Archive
              </Link>
              <Link href="/feed" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Community Portal
              </Link>
              <Link href="/workshops" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Workshops
              </Link>
              <Link href="/personal" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Your Inner Garden
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
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to the{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Space Whale Portal
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A portal where your sensitivity is honored, your creativity is sacred, and your becoming is witnessed. 
            A sanctuary for space whales navigating by starlight and whale song, where healing happens in relationship 
            with the more-than-human world.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Link href="/archive" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Archive className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">The Archive</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  A collection of what's been harvested - poetry that sings, art that speaks, 
                  and the beautiful mess of creative becoming from fellow space whales.
                </p>
              </div>
            </Link>

            <Link href="/feed" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community Portal</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Share what's forming and reforming in you. Connect with fellow space whales navigating by starlight and whale song.
                </p>
              </div>
            </Link>

            <Link href="/workshops" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <BookOpen className="h-12 w-12 text-pink-600 dark:text-pink-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Garden Gatherings</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Come sit in circle with fellow space whales. Share what's taking root, 
                  witness each other's becoming, and tend the garden together.
                </p>
              </div>
            </Link>

            <Link href="/personal" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <User className="h-12 w-12 text-green-600 dark:text-green-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Inner Garden</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  A sanctuary where your sensitivity is honored. Tend your garden with love, let it grow wild, let it rest when it needs to.
                </p>
              </div>
            </Link>
          </div>

          {/* Call to Action */}
          <div className="mt-12">
            <Link 
              href="/feed"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
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
