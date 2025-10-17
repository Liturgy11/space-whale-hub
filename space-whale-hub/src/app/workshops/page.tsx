import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Users, Clock, MapPin, BookOpen, Heart, MessageCircle, Star, Plus } from "lucide-react";

export default function Workshops() {
  // Mock data for demonstration
  const upcomingWorkshops = [
    {
      id: 1,
      title: "Nature-Based Art Therapy for Neurodivergent Creatives",
      facilitator: "Liz (Space Whale)",
      date: "Saturday, March 15th",
      time: "2:00 PM - 4:00 PM",
      location: "Central Coast, NSW (Darkinjung Country)",
      type: "In-Person",
      description: "A therapeutic workshop using art and nature to explore creativity in ways that honor neurodivergent strengths. We'll work with natural materials and explore sensory creativity in a safe, affirming space.",
      maxParticipants: 8,
      currentParticipants: 5,
      price: "NDIS participants welcome",
      tags: ["nature-based", "neurodivergent", "art therapy", "sensory"],
      isNDIS: true
    },
    {
      id: 2,
      title: "Queer Ecology: Art & Nature Connection",
      facilitator: "Liz (Space Whale)",
      date: "Sunday, March 23rd",
      time: "10:00 AM - 12:00 PM",
      location: "Online via Zoom",
      type: "Online",
      description: "Explore the intersection of queerness and ecology through creative expression. This workshop celebrates diverse ways of being and our connection to the natural world.",
      maxParticipants: 15,
      currentParticipants: 12,
      price: "Sliding scale $30-$60",
      tags: ["queer", "ecology", "online", "community"],
      isNDIS: false
    },
    {
      id: 3,
      title: "Trauma-Informed Creative Expression",
      facilitator: "Liz (Space Whale)",
      date: "Saturday, April 6th",
      time: "1:00 PM - 3:00 PM",
      location: "Central Coast, NSW",
      type: "In-Person",
      description: "A gentle, trauma-informed approach to creative expression. Learn techniques for using art as a tool for healing and self-discovery in a safe, supportive environment.",
      maxParticipants: 6,
      currentParticipants: 3,
      price: "NDIS participants welcome",
      tags: ["trauma-informed", "healing", "art therapy", "safe space"],
      isNDIS: true
    }
  ];

  const pastWorkshops = [
    {
      id: 4,
      title: "Space Whale Sojourns: Creative Journaling",
      facilitator: "Liz (Space Whale)",
      date: "February 20th, 2024",
      participants: 12,
      rating: 4.9,
      feedback: "Such a beautiful, affirming space. Liz created such a safe environment for exploration."
    },
    {
      id: 5,
      title: "Neurodivergent Joy: Art & Celebration",
      facilitator: "Liz (Space Whale)",
      date: "February 10th, 2024",
      participants: 8,
      rating: 5.0,
      feedback: "Finally a workshop that truly understood and celebrated neurodivergent ways of being."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Hub
              </Link>
              <div className="flex items-center space-x-2">
                <Image
                  src="/Space Whale_Social Only.jpg"
                  alt="Space Whale Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Workshops & Events</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Host Workshop
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Workshops & Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Join transformative workshops and courses. Learn, create, and grow together in our 
            trauma-informed, neuroaffirming, and gender-affirming community.
          </p>
          
          {/* Acknowledgement */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl p-6 mb-8">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Land Acknowledgement:</strong> Space Whale operates on First Nations land, Darkinjung Country, 
              (Central Coast, NSW). We acknowledge sovereignty was never ceded and pay our respects to elder's 
              past, present and emerging. Space Whale welcomes all people and celebrates diversity. 
              Space Whale is a registered LGBTIQA+ safe space.
            </p>
          </div>
        </div>

        {/* Upcoming Workshops */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Workshops</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {upcomingWorkshops.map((workshop) => (
              <div key={workshop.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {workshop.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Facilitated by {workshop.facilitator}
                    </p>
                  </div>
                  {workshop.isNDIS && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      NDIS Welcome
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {workshop.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    {workshop.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4 mr-2" />
                    {workshop.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    {workshop.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Users className="h-4 w-4 mr-2" />
                    {workshop.currentParticipants}/{workshop.maxParticipants} participants
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {workshop.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {workshop.price}
                  </span>
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Workshops */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Past Workshops</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {pastWorkshops.map((workshop) => (
              <div key={workshop.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {workshop.title}
                  </h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
                      {workshop.rating}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="h-4 w-4 mr-2" />
                    {workshop.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Users className="h-4 w-4 mr-2" />
                    {workshop.participants} participants
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "{workshop.feedback}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workshop Categories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <BookOpen className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Art Therapy</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                One-on-one and group art therapy sessions for healing and self-discovery.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <Heart className="h-12 w-12 text-pink-600 dark:text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">NDIS Art Therapy</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Specialized art therapy services for NDIS participants with a focus on individual needs.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
              <Users className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community Events</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Community arts projects and events that bring people together through creativity.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Interested in a Custom Workshop?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Book a free phone, video or text chat to explore working together. 
            I offer trauma-informed, neuroaffirming, and gender-affirming services.
          </p>
          <button className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            Book a Free Consultation
          </button>
        </div>
      </main>
    </div>
  );
}
