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

export default function GatheringsPanel() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h2 className="text-2xl font-space-whale-heading text-space-whale-navy mb-2">
          Gatherings
        </h2>
        <p className="text-sm text-space-whale-purple/80 font-space-whale-body max-w-xl">
          Live sessions you can join. Self-paced courses and workshops will land here over time.
        </p>
      </div>

      <article className="border-t border-space-whale-lavender/30 pt-6">
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
      </article>

      <p className="text-sm text-space-whale-navy/80 font-space-whale-body text-center pt-2">
        Want to join Open Studio? Email{' '}
        <a
          href="mailto:hellospacewhale@gmail.com"
          className="text-space-whale-purple hover:text-space-whale-navy underline underline-offset-2"
        >
          hellospacewhale@gmail.com
        </a>
      </p>
    </div>
  )
}
