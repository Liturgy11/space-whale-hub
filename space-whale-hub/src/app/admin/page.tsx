'use client'

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Settings, Key, FolderOpen, Users, Shield } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InviteCodeManager from "@/components/admin/InviteCodeManager";
import { useAuth } from "@/contexts/AuthContext";

function AdminContent() {
  const { user } = useAuth();

  // Only allow admin access
  if (user?.email !== 'lizwamc@gmail.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-space-whale-lavender mx-auto mb-4" />
          <h1 className="text-2xl font-space-whale-heading text-space-whale-navy mb-4">
            Admin Access Required
          </h1>
          <p className="text-space-whale-navy font-space-whale-body mb-6">
            This area is restricted to administrators only.
          </p>
          <Link href="/" className="btn-lofi">
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

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
            <Link 
              href="/" 
              className="flex items-center text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Settings className="h-16 w-16 text-space-whale-purple mx-auto mb-4" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-space-whale-heading text-space-whale-navy mb-6">
            Admin{" "}
            <span className="bg-gradient-to-r from-space-whale-purple via-accent-pink to-accent-orange bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          
          <p className="text-xl font-space-whale-body text-space-whale-navy mb-8 max-w-3xl mx-auto">
            Manage invite codes, albums, and community settings for the Space Whale Portal.
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/admin/invite-codes" className="group">
            <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
              <Key className="h-12 w-12 text-purple-600 mb-4 mx-auto float-gentle" />
              <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Invite Codes</h3>
              <p className="text-space-whale-navy text-sm font-space-whale-body">
                Create and manage invite codes for community access. Track usage and expiration dates.
              </p>
            </div>
          </Link>

          <Link href="/admin/albums" className="group">
            <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
              <FolderOpen className="h-12 w-12 text-yellow-500 mb-4 mx-auto float-gentle" />
              <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">Album Management</h3>
              <p className="text-space-whale-navy text-sm font-space-whale-body">
                Curate and organize content in the Constellation. Create albums and manage collections.
              </p>
            </div>
          </Link>

          <div className="group">
            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft opacity-75">
              <Users className="h-12 w-12 text-blue-500 mb-4 mx-auto float-gentle" />
              <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">User Management</h3>
              <p className="text-space-whale-navy text-sm font-space-whale-body">
                Coming soon: Manage community members, view activity, and moderate content.
              </p>
            </div>
          </div>
        </div>

        {/* Invite Code Manager */}
        <InviteCodeManager />
      </main>

      {/* Land Acknowledgement */}
      <div className="bg-lofi-card rounded-xl p-6 mx-4 sm:mx-6 lg:mx-8 mb-8 rainbow-border-soft glow-soft">
        <p className="text-sm font-space-whale-body text-space-whale-navy">
          <strong>Land Acknowledgement:</strong> Space Whale operates on First Nations land, Darkinjung Country, 
          (Central Coast, NSW). We acknowledge sovereignty was never ceded and pay our respects to elder's 
          past, present and emerging. Space Whale welcomes all people and celebrates diversity. 
          Space Whale is a registered LGBTIQA+ safe space.
        </p>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}


