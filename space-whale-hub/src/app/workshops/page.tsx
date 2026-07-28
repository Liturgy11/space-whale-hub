import AppShell from "@/components/layout/AppShell";
import SpacePageHeader from "@/components/layout/SpacePageHeader";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";

export default function Workshops() {
  const workshops = [
    {
      id: 1,
      title: "In Our Nature",
      subtitle: "Online Group/Course",
      facilitator: "Lit (Space Whale)",
      description: "An online eco/art therapy course using creative and experiential practices to deepen your connection with land, self, and others. A gentle space to explore your relationship with the natural world.",
      note: "Made especially for ND, queer, trans, and gender diverse folks—everyone welcome.",
      date: "Date/time TBD - Taking expressions of interest",
      location: "Online via Zoom",
      price: "Pricing TBD"
    },
    {
      id: 2,
      title: "Space Whale Open Studio",
      facilitator: "Lit (Space Whale)",
      description: "A monthly online creative session where you can work on your own projects alongside others or respond to creative prompts. A supportive space to create together.",
      note: "ND and Rainbow friendly.",
      date: "Monthly via Zoom",
      time: "60-90 minutes",
      price: "Pricing TBD"
    },
    {
      id: 3,
      title: "Qi Gong with Jed",
      facilitator: "Jed at Sea of Light Studios",
      description: "Weekly Qi Gong classes—an ancient Chinese practice combining slow movement, breathwork, and meditation to cultivate life energy and support wellbeing.",
      date: "Sundays",
      location: "Online via Zoom",
      price: "Pricing TBD"
    },
    {
      id: 4,
      title: "Meditation with Hugh",
      facilitator: "Hugh (Deep Blue Mind)",
      description: "Online meditation sessions to support self-awareness, resilience, attention, and focus. Develop mindfulness practices to support stress and anxiety.",
      date: "Schedule TBD",
      time: "30-60 minutes",
      location: "Online via Zoom",
      price: "Pricing TBD"
    }
  ];

  return (
    <AppShell
      title="Deep Space"
      className="min-h-screen bg-white relative"
      backgroundImage="/vivid-mushrooms.png"
      backgroundOpacity={0.12}
      navClassName="relative z-10 bg-white/80 backdrop-blur-sm border-b border-space-whale-lavender/20 sticky top-0 z-50"
      mainClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
        <SpacePageHeader
          iconSrc="/illustrations/whale.png"
          title="Deep Space"
          description="Workshops, resources, and online groups to support your journey."
          className="mb-8"
        />

        {/* Workshops */}
        <div className="mb-12">
          <div className="grid lg:grid-cols-2 gap-6">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="bg-lofi-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 rainbow-border-soft">
                <div className="mb-4">
                  <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-1">
                    {workshop.title}
                  </h3>
                  {workshop.subtitle && (
                    <p className="text-sm text-space-whale-purple mb-2">
                      {workshop.subtitle}
                    </p>
                  )}
                  <p className="text-sm text-space-whale-navy/70 mb-3">
                    Facilitated by {workshop.facilitator}
                  </p>
                </div>
                
                <p className="text-space-whale-navy font-space-whale-body mb-4 leading-relaxed">
                  {workshop.description}
                </p>
                
                {workshop.note && (
                  <p className="text-sm text-space-whale-purple mb-4 italic">
                    {workshop.note}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  {workshop.date && (
                    <div className="flex items-center text-sm text-space-whale-navy">
                      <Calendar className="h-4 w-4 mr-2 text-cyan-500" />
                      {workshop.date}
                    </div>
                  )}
                  {workshop.time && (
                    <div className="flex items-center text-sm text-space-whale-navy">
                      <Clock className="h-4 w-4 mr-2 text-cyan-500" />
                      {workshop.time}
                    </div>
                  )}
                  {workshop.location && (
                    <div className="flex items-center text-sm text-space-whale-navy">
                      <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                      {workshop.location}
                    </div>
                  )}
                  {workshop.price && (
                    <div className="flex items-center text-sm text-space-whale-navy">
                      <DollarSign className="h-4 w-4 mr-2 text-cyan-500" />
                      {workshop.price}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expression of Interest Section */}
        <div className="bg-lofi-card rounded-xl p-6 mb-8 rainbow-border-soft">
          <p className="text-space-whale-navy font-space-whale-body text-center">
            Interested in joining a workshop?<br />
            We're taking expressions of interest for 2026. Email{" "}
            <a 
              href="mailto:hellospacewhale@gmail.com" 
              className="text-space-whale-purple hover:text-space-whale-navy underline"
            >
              hellospacewhale@gmail.com
            </a>
          </p>
        </div>
    </AppShell>
  );
}
