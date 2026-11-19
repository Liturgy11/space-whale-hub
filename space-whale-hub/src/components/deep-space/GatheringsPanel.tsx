import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react'

/** Direct subscribe page for Space Whale Sojourns */
const OPEN_STUDIO_SUBSTACK_URL = 'https://litmccarthy.substack.com/subscribe'

const openStudio = {
  title: 'Space Whale Open Studio',
  facilitator: 'Lit (Space Whale)',
  description:
    'A monthly online creative session where you can work on your own projects alongside others or respond to creative prompts. Hosted via Space Whale Sojourns on Substack — subscribe to get session access and the letters between gatherings.',
  note: 'ND and Rainbow friendly.',
  date: 'Monthly on Substack',
  time: '60–90 minutes',
  location: 'Space Whale Sojourns (Substack)',
  price: 'Free to subscribe · session details in the letters',
}

const hostMailto =
  'mailto:hellospacewhale@gmail.com?subject=' +
  encodeURIComponent('Gathering idea for Deep Space') +
  '&body=' +
  encodeURIComponent(
    "Hi Lit,\n\nI'd like to explore hosting a gathering in the Space Whale Portal.\n\nWhat I'm imagining:\n\nWho it's for:\n\nRough format / timing:\n\nThanks!\n"
  )

export default function GatheringsPanel() {
  return (
    <div className="space-y-8">
      <p className="text-sm sm:text-base text-space-whale-purple/80 font-space-whale-body max-w-2xl">
        Live sessions you can join — and, when the time is right, host. Self-paced courses will land
        here over time.
      </p>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <article>
          <p className="text-xs uppercase tracking-wide text-space-whale-purple/70 mb-2">
            Happening now
          </p>
          <h2 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy mb-1">
            {openStudio.title}
          </h2>
          <p className="text-sm text-space-whale-navy/70 mb-3">
            Facilitated by {openStudio.facilitator}
          </p>
          <p className="text-space-whale-navy font-space-whale-body mb-3 leading-relaxed">
            {openStudio.description}
          </p>
          <p className="text-sm text-space-whale-purple mb-4 italic">{openStudio.note}</p>
          <ul className="space-y-2 text-sm text-space-whale-navy mb-5">
            <li className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-600 flex-shrink-0" aria-hidden />
              {openStudio.date}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600 flex-shrink-0" aria-hidden />
              {openStudio.time}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-600 flex-shrink-0" aria-hidden />
              {openStudio.location}
            </li>
            <li className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-cyan-600 flex-shrink-0" aria-hidden />
              {openStudio.price}
            </li>
          </ul>
          <p className="text-sm text-space-whale-navy/80 font-space-whale-body mb-4">
            Subscribe to Space Whale Sojourns for Open Studio access and updates.
          </p>
          <a
            href={OPEN_STUDIO_SUBSTACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg border-2 border-space-whale-purple text-space-whale-purple text-sm font-space-whale-accent hover:bg-space-whale-lavender/40 transition-colors"
          >
            Subscribe on Substack
          </a>
        </article>

        <section className="lg:border-l lg:border-space-whale-lavender/40 lg:pl-12 pt-8 lg:pt-0 border-t border-space-whale-lavender/30 lg:border-t-0">
          <h2 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy mb-2">
            Host a gathering
          </h2>
          <p className="text-space-whale-navy font-space-whale-body leading-relaxed mb-3">
            Got a workshop, circle, creative session, or other offering that belongs in this
            community? Deep Space can hold space for community-hosted gatherings — not only Lit’s.
          </p>
          <p className="text-sm text-space-whale-navy/80 font-space-whale-body leading-relaxed mb-5">
            Share a rough idea of what you’d like to offer, who it’s for, and how you imagine
            running it. We’ll talk through fit, access, and care before anything goes live. No
            polished pitch needed.
          </p>
          <a
            href={hostMailto}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-gradient-to-r from-space-whale-purple to-accent-pink text-white text-sm font-space-whale-accent shadow-md hover:opacity-90 transition-opacity"
          >
            Pitch a gathering idea
          </a>
        </section>
      </div>
    </div>
  )
}
