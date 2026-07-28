'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import SetDisplayName from "@/components/SetDisplayName";
import WelcomeModal from "@/components/WelcomeModal";
import { useAuth } from "@/contexts/AuthContext";

type SpaceIconConfig =
  | { iconSrc: string }
  | { icon: LucideIcon; iconClassName?: string };

function SpaceIcon({ config, className = "h-7 w-7" }: { config: SpaceIconConfig; className?: string }) {
  if ("iconSrc" in config) {
    return (
      <Image
        src={config.iconSrc}
        alt=""
        width={48}
        height={48}
        aria-hidden
        className={`object-contain ${className}`}
      />
    );
  }

  const Icon = config.icon;
  return <Icon className={`${config.iconClassName ?? "text-space-whale-navy"} ${className}`} aria-hidden />;
}

type ExploreMenuItem = {
  href: string;
  label: string;
  sub: string;
  icon: SpaceIconConfig;
};

const exploreMenuItems: ExploreMenuItem[] = [
  { href: "/personal", icon: { iconSrc: "/illustrations/inner-space-eye.png" }, label: "Inner Space", sub: "Journal & reflect" },
  { href: "/feed", icon: { iconSrc: "/illustrations/star-baby.png" }, label: "Community Orbit", sub: "Share with community" },
  { href: "/workshops", icon: { iconSrc: "/illustrations/whale.png" }, label: "Deep Space", sub: "Workshops & resources" },
  { href: "/archive?tab=network", icon: { iconSrc: "/illustrations/mushroom-3.png" }, label: "Mycelial Network", sub: "Find your people" },
  { href: "/archive", icon: { iconSrc: "/illustrations/star.png" }, label: "Constellation", sub: "Archive & gallery" },
];

const featureCards = [
  {
    href: "/archive",
    label: "Constellation",
    description: "Archive of Space Whale events - pride poetry, community workshops, and creative gatherings.",
    icon: { iconSrc: "/illustrations/star.png" },
  },
  {
    href: "/feed",
    label: "Community Orbit",
    description: "The community stream. Connect with ND queers, nature lovers, artists, and seekers.",
    icon: { iconSrc: "/illustrations/star-baby.png" },
  },
  {
    href: "/workshops",
    label: "Deep Space",
    description: "Workshops and creative offerings to support your journey. Explore resources, online groups, and spaces to grow together.",
    icon: { iconSrc: "/illustrations/whale.png" },
  },
  {
    href: "/personal",
    label: "Inner Space",
    description: "Your private journal for reflection and creativity. Write, collect inspiration, and explore prompts.",
    icon: { iconSrc: "/illustrations/inner-space-eye.png" },
  },
] as const;

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
    <AppShell
      linkHome={false}
      showDesktopNav
      showUserProfile
      backgroundImage="/deep-space-orbits.png"
      backgroundOpacity={0.38}
      showFooter
      afterMain={
        <div className="bg-lofi-card rounded-xl p-6 mx-4 sm:mx-6 lg:mx-8 mb-8 rainbow-border-soft glow-soft">
          <p className="text-sm font-space-whale-body text-space-whale-navy">
            <strong>Land Acknowledgement:</strong> Space Whale operates on First Nations land, Darkinjung Country, 
            (Central Coast, NSW). We acknowledge sovereignty was never ceded and pay our respects to Elders 
            past, present and emerging. Always was, always will be Aboriginal land.
          </p>
        </div>
      }
    >
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
                className="group relative inline-flex items-center gap-2 px-8 py-3 rounded-full font-space-whale-accent text-space-whale-navy text-base backdrop-blur-sm border-2 border-transparent hover:border-space-whale-purple/40 shadow-lg hover:shadow-space-whale-purple/20 transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(135deg, #f5edfa 0%, #ffe8f0 55%, #ffede4 100%) padding-box, linear-gradient(135deg, #a78bfa, #f472b6, #fb923c) border-box',
                }}
              >
                Explore
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Explore Menu Dropdown */}
              {showCreateMenu && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-3 w-72 rounded-2xl shadow-xl z-50 border border-space-whale-purple/20 overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(232,221,243,0.97) 0%, rgba(255,230,240,0.97) 60%, rgba(255,220,200,0.97) 100%)', backdropFilter: 'blur(12px)' }}>
                  <div className="p-2">
                    {exploreMenuItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setShowCreateMenu(false)}
                        className="flex items-center gap-4 p-3 hover:bg-space-whale-purple/10 rounded-xl transition-colors text-left">
                        <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                          <SpaceIcon config={item.icon} />
                        </span>
                        <div className="text-left">
                          <div className="font-medium text-space-whale-navy">{item.label}</div>
                          <div className="text-xs text-space-whale-purple">{item.sub}</div>
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
            {featureCards.map(({ href, label, description, icon }) => (
              <Link key={href} href={href} className="group">
                <div className="bg-lofi-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 rainbow-border-soft glow-soft">
                  <div className="h-12 w-12 mb-4 mx-auto float-gentle flex items-center justify-center">
                    <SpaceIcon config={icon} className="h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">{label}</h3>
                  <p className="text-space-whale-navy text-sm font-space-whale-body">{description}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>

      {/* Set Display Name Modal */}
      {showSetDisplayName && (
        <SetDisplayName />
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal onClose={handleWelcomeClose} />
      )}
    </AppShell>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
