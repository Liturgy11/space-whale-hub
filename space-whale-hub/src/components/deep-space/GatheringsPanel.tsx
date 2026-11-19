import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react'

const openStudio = {
  title: 'Space Whale Open Studio',
  facilitator: 'Lit (Space Whale)',
  description:
    'A monthly online creative session where you can work on your own projects alongside others or respond to creative prompts. A supportive space to create together.',
  note: 'ND and Rainbow friendly.',
  date: 'Monthly via Zoom',
  time: '60–90 minutes',
  price: 'Pricing on request',
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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h2 className="text-2xl font-space-whale-heading text-space-whale-navy mb-2">
          Gatherings
        </h2>
        <p className="text-sm text-space-whale-purple/80 font-space-whale-body max-w-xl">
          Live sessions you can join — and, when the time is right, host. Self-paced courses will
          land here over time.
        </p>
      </div>

      <article className="border-t border-space-whale-lavender/30 pt-6">
        <p className="text-xs uppercase tracking-wide text-space-whale-purple/70 mb-2">
          Happening now
        </p>
        <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-1">
          {openStudio.title}
        </h3>
        <p className="text-sm text-space-whale-navy/70 mb-3">
          Facilitated by {openStudio.facilitator}
        </p>
        <p className="text-space-whale-navy font-space-whale-body mb-3 leading-relaxed">
          {openStudio.description}
        </p>
        <p className="text-sm text-space-whale-purple mb-4 italic">{openStudio.note}</p>
        <ul className="space-y-2 text-sm text-space-whale-navy">
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
            Online via Zoom
          </li>
          <li className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-cyan-600 flex-shrink-0" aria-hidden />
            {openStudio.price}
          </li>
        </ul>
        <p className="text-sm text-space-whale-navy/80 font-space-whale-body mt-5">
          Want to join? Email{' '}
          <a
            href="mailto:hellospacewhale@gmail.com?subject=Open%20Studio"
            className="text-space-whale-purple hover:text-space-whale-navy underline underline-offset-2"
          >
            hellospacewhale@gmail.com
          </a>
        </p>
      </article>

      <section className="border-t border-space-whale-lavender/30 pt-8">
        <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
          Host a gathering
        </h3>
        <p className="text-space-whale-navy font-space-whale-body leading-relaxed mb-3">
          Got a workshop, circle, creative session, or other offering that belongs in this
          community? Deep Space can hold space for community-hosted gatherings — not only Lit’s.
        </p>
        <p className="text-sm text-space-whale-navy/80 font-space-whale-body leading-relaxed mb-5">
          Share a rough idea of what you’d like to offer, who it’s for, and how you imagine running
          it. We’ll talk through fit, access, and care before anything goes live. No polished pitch
          needed.
        </p>
        <a
          href={hostMailto}
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-gradient-to-r from-space-whale-purple to-accent-pink text-white text-sm font-space-whale-accent shadow-md hover:opacity-90 transition-opacity"
        >
          Pitch a gathering idea
        </a>
      </section>
    </div>
  )
}
