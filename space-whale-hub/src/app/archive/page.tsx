import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import ConstellationTabs from "@/components/constellation/ConstellationTabs";

export default function Archive() {
  return (
    <AppShell
      showDesktopNav
      showUserProfile
      className="min-h-screen bg-gradient-to-br from-space-whale-lavender/20 via-white to-space-whale-purple/10"
      backgroundImage="/mycelial-landscape.png"
      backgroundOpacity={0.18}
      navClassName="relative z-50 bg-gradient-to-r from-space-whale-lavender/80 to-space-whale-purple/80 backdrop-blur-md border-b border-space-whale-purple/30 sticky top-0"
      mainClassName="relative z-10"
    >
      <Suspense fallback={null}>
        <ConstellationTabs />
      </Suspense>
    </AppShell>
  );
}
