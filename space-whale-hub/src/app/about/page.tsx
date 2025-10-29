'use client'

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, Shield, Users, Star, Compass, Eye, CircleDotDashed, Sparkles, Key, Zap, RotateCcw } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

function AboutContent() {
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Image
              src="/Space Whale_Horizontal.jpg"
              alt="Space Whale - Art Therapy"
              width={300}
              height={90}
              className="mx-auto"
              priority
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-space-whale-heading text-space-whale-navy mb-6">
            About the{" "}
            <span className="bg-gradient-to-r from-space-whale-purple via-accent-pink to-accent-orange bg-clip-text text-transparent">
              Space Whale Portal
            </span>
          </h1>
          
          <p className="text-xl font-space-whale-body text-space-whale-navy mb-8 max-w-3xl mx-auto">
            A trauma-informed, neuroaffirming digital sanctuary where your sensitivity is honoured, 
            your creativity is sacred, and your becoming is witnessed.
          </p>
        </div>

        {/* What is Space Whale Portal */}
        <section className="mb-16">
          <div className="bg-lofi-card rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6 flex items-center">
              <Compass className="h-6 w-6 mr-3 text-space-whale-purple" />
              What is the Space Whale Portal?
            </h2>
            <div className="space-y-4 text-space-whale-navy font-space-whale-body">
              <p>
                The Space Whale Portal is a digital sanctuary designed specifically for LGBTIQA+ folks, 
                NDIS participants, and anyone seeking a safe space for creative journey work. We believe 
                that creativity is a powerful tool for healing, self-discovery, and community connection.
              </p>
              <p>
                Unlike mainstream social platforms, we prioritise safety, authenticity, and trauma-informed 
                design. Every feature is crafted with neurodivergent needs in mind, from our gentle 
                animations to our permission-giving language.
              </p>
              <p>
                This is a space where you can explore your inner world, share your creative expressions, 
                and connect with others who understand the journey of becoming.
              </p>
            </div>
          </div>
        </section>

        {/* The Four Spaces */}
        <section className="mb-16">
          <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-8 text-center">
            The Four Spaces
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft">
              <div className="flex items-center mb-4">
                <Star className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Constellation</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Our curated archive of creative work - poetry, art, videos, and digital zines. 
                Each piece is a star in our shared sky, witnessed and celebrated by the community.
              </p>
            </div>

            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft">
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 text-yellow-500 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Community Orbit</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Share your art, poetry, reflections, and inspiration. A cosy place to share and witness each other.
              </p>
            </div>

            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft">
              <div className="flex items-center mb-4">
                <CircleDotDashed className="h-8 w-8 text-purple-500 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Deep Space</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Workshops and creative offerings to support your journey. Explore at your pace - 
                art therapy resources, online groups, and spaces to grow together.
              </p>
            </div>

            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-yellow-600 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Inner Space</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Your personal cosmos - journal, create mood boards, look back on your journey. 
                Private by default. Optional mood and habit tracking to help you witness your own patterns.
              </p>
            </div>
          </div>
        </section>

        {/* Community Guidelines */}
        <section className="mb-16">
          <div className="bg-lofi-card rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-space-whale-purple" />
              Welcome, Fellow Traveler 🐋
            </h2>
            
            <div className="space-y-6 text-space-whale-navy font-space-whale-body mb-8">
              <p>
                You've been invited to a portal between worlds - a space where healing happens in relationship, 
                where creativity is medicine, and where your becoming is witnessed. Before you enter, 
                let's be clear about what we're building together.
              </p>
            </div>

            <div className="space-y-8">
              {/* What We Believe */}
              <div>
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy mb-4 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-space-whale-purple" />
                  What We Believe
                </h3>
                <div className="space-y-3 text-space-whale-navy font-space-whale-body">
                  <p><strong>Rest is resistance.</strong> You don't owe us productivity or positivity.</p>
                  <p><strong>Healing is not linear.</strong> Some days you're in butterfly mode, some days you're cocooning. Both are sacred.</p>
                  <p><strong>The earth is our teacher.</strong> We learn from cycles, seasons, and the more-than-human world.</p>
                  <p><strong>We're all wounded teachers.</strong> Your flaws don't disqualify you - they're part of your medicine.</p>
                  <p><strong>Liberation is collective.</strong> Your healing and mine are woven together.</p>
                </div>
              </div>

              {/* How We Care for Each Other */}
              <div>
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-space-whale-purple" />
                  How We Care for Each Other
                </h3>
                <div className="space-y-4 text-space-whale-navy font-space-whale-body">
                  <div>
                    <p className="font-space-whale-accent mb-2">When someone shares vulnerability:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Witness without fixing</li>
                      <li>Thank them, or simply hold space</li>
                      <li>Don't one-up their story or compare pain</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-space-whale-accent mb-2">When you're not sure what to say:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>"I'm sitting with this" is enough</li>
                      <li>Silence is valid - you don't owe a response</li>
                      <li>Ask "Is this mine to hold?" before weighing in</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-space-whale-accent mb-2">What causes harm here:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Unsolicited advice (especially medical/therapeutic)</li>
                      <li>Invalidating lived experience ("that's not how it works")</li>
                      <li>Spiritual bypassing ("it's all a lesson")</li>
                      <li>Demanding emotional labour from BIPOC, disabled, or queer folks</li>
                      <li>Treating this space like a debate forum</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-space-whale-accent mb-2">Content warnings matter:</p>
                    <p>Use them for: trauma, death, body talk, substance use, politics. They're care, not censorship.</p>
                  </div>
                </div>
              </div>

              {/* When Harm Happens */}
              <div>
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy mb-4 flex items-center">
                  <RotateCcw className="h-5 w-5 mr-2 text-space-whale-purple" />
                  When Harm Happens (And It Will)
                </h3>
                <div className="space-y-4 text-space-whale-navy font-space-whale-body">
                  <p>None of us are perfect. Mistakes are part of becoming.</p>
                  <div>
                    <p className="font-space-whale-accent mb-2">If you cause harm:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>You'll hear from me (Lit) directly, in private</li>
                      <li>We'll talk about impact, not just intent</li>
                      <li>Repair might mean apologizing, reflecting, or taking space</li>
                      <li>You won't be shamed, but you will be held accountable</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-space-whale-accent mb-2">If you're harmed:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Report it (there's a button on every post)</li>
                      <li>I'll respond within 48 hours</li>
                      <li>We believe survivors and take all reports seriously</li>
                      <li>You don't owe anyone forgiveness or reconciliation</li>
                    </ul>
                  </div>
                  <p className="font-space-whale-accent">Repeated harm = being asked to leave. We prioritise collective safety over individual comfort.</p>
                </div>
              </div>

              {/* What's Sacred Here */}
              <div>
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-space-whale-purple" />
                  What's Sacred Here
                </h3>
                <div className="space-y-3 text-space-whale-navy font-space-whale-body">
                  <p>🌊 <strong>Your sovereignty</strong> - Your body, your boundaries, your pace</p>
                  <p>🌱 <strong>Non-linear time</strong> - No hustle, no urgency, no FOMO</p>
                  <p>🌟 <strong>Lived experience leadership</strong> - ND, trans, disabled, BIPOC folks lead here</p>
                  <p>🐋 <strong>The wisdom of rest</strong> - Lurking, witnessing, being quiet is as valuable as posting</p>
                  <p>💜 <strong>Your right to exist</strong> - Not up for debate, ever</p>
                </div>
              </div>

              {/* This Is a Slow Space */}
              <div>
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy mb-4 flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-space-whale-purple" />
                  This Is a Slow Space
                </h3>
                <div className="space-y-3 text-space-whale-navy font-space-whale-body">
                  <p>• No algorithms pushing engagement</p>
                  <p>• No pressure to perform or prove</p>
                  <p>• No monetizing your trauma</p>
                  <p>• No extracting your creativity</p>
                  <p className="font-space-whale-accent mt-4">This is a portal, not a platform. A sanctuary, not a stage.</p>
                </div>
              </div>

              {/* You Belong Here */}
              <div className="bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 rounded-lg p-6">
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-space-whale-purple" />
                  You Belong Here
                </h3>
                <p className="text-space-whale-navy font-space-whale-body">
                  By creating an account, you're agreeing to show up with care, to be accountable when you mess up, 
                  and to trust that we're all doing our best to build something different together.
                </p>
                <p className="text-space-whale-purple font-space-whale-accent mt-3">
                  Welcome home, space whale. 🌌✨
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Onboarding Tips */}
        <section className="mb-16">
          <div className="bg-lofi-card rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6 flex items-center">
              <Sparkles className="h-6 w-6 mr-3 text-space-whale-purple" />
              Getting Started Tips
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-3">🎯 Start Small</h3>
                <p className="text-space-whale-navy font-space-whale-body">
                  Begin with Inner Space - create a journal entry or mood board. Get comfortable 
                  with the platform before sharing publicly. There's no rush to participate everywhere.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-3">👀 Lurk and Learn</h3>
                <p className="text-space-whale-navy font-space-whale-body">
                  It's perfectly okay to observe the community before participating. Take time to 
                  understand the culture and feel safe before sharing your own content.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-3">🔒 Privacy First</h3>
                <p className="text-space-whale-navy font-space-whale-body">
                  Everything in Inner Space is private by default. You control what you share and 
                  with whom. Start private, share when you're ready.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-3">📱 Mobile Friendly</h3>
                <p className="text-space-whale-navy font-space-whale-body">
                  The portal is designed mobile-first. Use the bottom navigation on your phone 
                  for easy access to all spaces. Everything works beautifully on any device.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-3">🆘 Need Help?</h3>
                <p className="text-space-whale-navy font-space-whale-body">
                  If you're struggling with anything - technical issues, emotional overwhelm, 
                  or just need guidance - reach out. We're here to support your journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Invite Information */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-space-whale-lavender/20 to-accent-pink/20 rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6 flex items-center">
              <Key className="h-6 w-6 mr-3 text-space-whale-purple" />
              Invite-Only Access
            </h2>
            
            <div className="space-y-4 text-space-whale-navy font-space-whale-body">
              <p>
                The Space Whale Portal is currently invite-only to maintain a safe, curated community. 
                This helps us ensure that everyone who joins understands and respects our values.
              </p>
              <p>
                If you have an invite code, you can use it during sign-up. If you don't have one but 
                feel this space is right for you, please reach out to us with a brief message about 
                why you'd like to join our community.
              </p>
              <p className="font-space-whale-accent text-space-whale-purple">
                We believe in quality over quantity - every space whale matters.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="text-center">
          <div className="bg-lofi-card rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-4">
              Questions or Need Support?
            </h2>
            <p className="text-space-whale-navy font-space-whale-body mb-6">
              We're here to help make your Space Whale journey as smooth and meaningful as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:hello@spacewhale.com.au" 
                className="btn-lofi inline-flex items-center justify-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                Email Us
              </a>
              <Link 
                href="/" 
                className="btn-space-whale-secondary inline-flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
            </div>
          </div>
        </section>
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

export default function About() {
  return (
    <ProtectedRoute>
      <AboutContent />
    </ProtectedRoute>
  );
}
