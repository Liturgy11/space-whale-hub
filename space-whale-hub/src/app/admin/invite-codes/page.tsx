'use client'

import Link from "next/link";
import { ArrowLeft, Key } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
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
    <AppShell
      linkHome={false}
      navActions={
        <Link
          href="/admin"
          className="flex items-center text-space-whale-navy hover:text-space-whale-purple transition-colors font-space-whale-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Admin Dashboard
        </Link>
      }
      mainClassName="py-8"
      afterMain={
        <div className="bg-lofi-card rounded-xl p-6 mx-4 sm:mx-6 lg:mx-8 mb-8 rainbow-border-soft glow-soft">
          <p className="text-sm font-space-whale-body text-space-whale-navy">
            <strong>Land Acknowledgement:</strong> Space Whale traverses the skies, seas and lands of Darkinjung Country, where sovereignty was never ceded. With respect to Elders past, present and future, we acknowledge First Nations&apos; ways of being and caring for Country and community. We honour the stories this Country carries across countless generations, and the ongoing work of healing and care that continues. We commit to listening to First Nations, and to care for each other and for Country. Space Whale welcomes all people and celebrates diversity. Space Whale is a registered LGBTIQA+ safe space.
          </p>
        </div>
      }
    >
      <InviteCodeManager />
    </AppShell>
  );
}

export default function InviteCodes() {
  return (
    <ProtectedRoute>
      <InviteCodesContent />
    </ProtectedRoute>
  );
}


