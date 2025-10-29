'use client'

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Key } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InviteCodeManager from "@/components/admin/InviteCodeManager";
import { useAuth } from "@/contexts/AuthContext";

function InviteCodesContent() {
  const { user } = useAuth();

  // Only allow admin access
  if (user?.email !== 'lizwamc@gmail.com') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Key className="h-16 w-16 text-space-whale-lavender mx-auto mb-4" />
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
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="flex items-center text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-8">
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

export default function InviteCodes() {
  return (
    <ProtectedRoute>
      <InviteCodesContent />
    </ProtectedRoute>
  );
}
