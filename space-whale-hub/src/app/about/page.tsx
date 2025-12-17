'use client'

import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Eye, CircleDotDashed, Zap, RotateCcw, Orbit } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

function AboutContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image
                src="/Space Whale_Social Only.jpg"
                alt="Space Whale Logo - Click to return home"
                width={32}
                height={32}
                className="rounded-full cursor-pointer"
              />
              <span className="text-xl font-space-whale-heading text-space-whale-navy">Space Whale Portal</span>
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
          
        </div>

        {/* About Space Whale Portal */}
        <section className="mb-16">
          <div className="bg-lofi-card rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6 flex items-center">
              <svg 
                className="h-6 w-6 mr-3 text-space-whale-purple" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Mushroom cap */}
                <path d="M12 4C8 4 5 7 5 11c0 2 1 3.5 2.5 4.5" />
                <path d="M12 4c4 0 7 3 7 7 0 2-1 3.5-2.5 4.5" />
                <ellipse cx="12" cy="11" rx="7" ry="3" />
                {/* Mushroom stem */}
                <rect x="10" y="11" width="4" height="8" rx="1" />
                {/* Small spots on cap */}
                <circle cx="9" cy="9" r="1" fill="currentColor" />
                <circle cx="15" cy="9" r="1" fill="currentColor" />
                <circle cx="12" cy="7" r="0.8" fill="currentColor" />
              </svg>
              Welcome traveller
            </h2>
            <div className="space-y-4 text-space-whale-navy font-space-whale-body">
              <p>
                The Space Whale Portal started as an earnest dream—a cosy digital space where people can journal, create, and share their musings with community when they feel called to.
              </p>
              <p>
                I wanted to replicate the good vibes of Pride Poetry: a space where vulnerable sharing is possible because people are warmly supported and encouraged by their community.
              </p>
              <p>
                I wanted to create a space for Space Whale friends and clients to dream, learn, and create alongside one another—away from the noise of algorithms, ads, and extractive platforms.
              </p>
              <p>
                I hope this space evolves and grows like an ecosystem, like a network of mycelium threads. It may be slow at first, and that's okay.
              </p>
              <p>
                I'm open to your ideas, feedback, and suggestions for features as we grow and expand the Space Whale universe together.
              </p>
              <p className="mt-6 font-space-whale-accent text-space-whale-purple">
                Lots of love,<br />Lit
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
                <Eye className="h-8 w-8 text-pink-400 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Inner Space</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Your private journal for reflection and creativity. I'm working on encryption for super private entries (think fireproof lockbox with a pin). Regular entries are private, encrypted ones are super secret.
              </p>
            </div>

            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft">
              <div className="flex items-center mb-4">
                <Orbit className="h-8 w-8 text-yellow-500 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Community Orbit</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Share your art and your heart with the community. Post your everyday joys, curiosities, works in progress, and what's inspiring you.
              </p>
            </div>

            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft">
              <div className="flex items-center mb-4">
                <Star className="h-8 w-8 text-purple-800 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Constellation</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Archive of Space Whale events. I'll be uploading albums from past workshops and Pride Poetry gatherings over time.
              </p>
            </div>

            <div className="bg-lofi-card rounded-xl p-6 shadow-lg rainbow-border-soft glow-soft">
              <div className="flex items-center mb-4">
                <CircleDotDashed className="h-8 w-8 text-cyan-500 mr-3" />
                <h3 className="text-xl font-space-whale-subheading text-space-whale-navy">Deep Space</h3>
              </div>
              <p className="text-space-whale-navy font-space-whale-body">
                Workshops and offerings to support your journey. Currently taking expressions of interest for meditation, qi gong, Space Whale Open Studio, and In Our Nature online course. More to come!
              </p>
            </div>
          </div>
        </section>

        {/* What to Share in Community Orbit */}
        <section className="mb-16">
          <div className="bg-lofi-card rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-6 flex items-center">
              <Heart className="h-6 w-6 mr-3 text-space-whale-purple" />
              What to Share in Community Orbit
            </h2>
            
            <div className="space-y-4 text-space-whale-navy font-space-whale-body mb-6">
              <p>
                Share your everyday joys, noticings, curiosities. Share your dreams and what you're longing for. Share things you're working on or working through. Share what's inspiring you or might inspire others.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-3">A few guidelines:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-space-whale-navy font-space-whale-body">
                  <li>When referencing others' work, acknowledge your sources</li>
                  <li>If sharing resources or links, connect them back to your own lived experience</li>
                  <li>Share memes, fun, and what lights you up too!</li>
                </ul>
              </div>

              <div className="bg-space-whale-lavender/10 rounded-lg p-4 mt-6">
                <p className="font-space-whale-accent text-space-whale-navy mb-2">
                  <strong>Content warnings:</strong>
                </p>
                <p className="text-space-whale-navy font-space-whale-body">
                  If you have a particularly heavy share (sexual abuse, violence, suicidality), please use a content warning. The content warning is clickable when you create your post—people in the feed can choose whether to view it.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Get in Touch */}
        <section className="text-center mb-16">
          <div className="bg-lofi-card rounded-xl p-8 shadow-lg rainbow-border-soft glow-soft">
            <h2 className="text-2xl font-space-whale-subheading text-space-whale-navy mb-4">
              Get in Touch
            </h2>
            <div className="space-y-4 text-space-whale-navy font-space-whale-body mb-6">
              <p>
                Questions or need support? Feel free to reach out.
              </p>
              <p>
                Have ideas for features or want to host a workshop or group? Let's chat.
              </p>
              <p className="font-space-whale-accent text-space-whale-purple mt-4">
                Looking forward to traveling alongside you in the Space Whale multiverse
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:hellospacewhale@gmail.com" 
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
