import { ExternalLink } from 'lucide-react'
import {
  CRISIS_SUPPORT,
  RESOURCE_TOPICS,
  type ResourceLink,
  type ResourceSubsection,
  type ResourceTopic,
} from '@/data/deep-space-resources'

const TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  book: 'Book',
  podcast: 'Podcast',
  article: 'Article',
  guide: 'Guide',
  toolkit: 'Toolkit',
  org: 'Organisation',
  tool: 'Tool',
  other: 'Resource',
}

function ResourceItem({ item }: { item: ResourceLink }) {
  const typeLabel = item.type ? TYPE_LABEL[item.type] : undefined
  const content = (
    <>
      <span className="font-medium text-space-whale-navy">{item.title}</span>
      {typeLabel && (
        <span className="ml-2 text-xs uppercase tracking-wide text-space-whale-purple/70">
          {typeLabel}
        </span>
      )}
      {item.url && (
        <ExternalLink
          className="inline-block ml-1.5 h-3.5 w-3.5 text-space-whale-purple/60"
          aria-hidden
        />
      )}
    </>
  )

  return (
    <li className="py-2 border-b border-space-whale-lavender/20 last:border-0">
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-space-whale-purple transition-colors"
        >
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
      {item.note && (
        <p className="mt-0.5 text-sm text-space-whale-navy/70 font-space-whale-body">{item.note}</p>
      )}
    </li>
  )
}

function ItemsOrEmpty({ items }: { items: ResourceLink[] }) {
  if (!items.length) {
    return (
      <p className="text-sm text-space-whale-purple/60 font-space-whale-body italic py-1">
        Links coming — this shelf is ready to fill.
      </p>
    )
  }

  return (
    <ul className="mt-2">
      {items.map((item) => (
        <ResourceItem key={`${item.title}-${item.url ?? 'local'}`} item={item} />
      ))}
    </ul>
  )
}

function Subsection({ subsection }: { subsection: ResourceSubsection }) {
  return (
    <div className="mt-5">
      <h4 className="text-base font-space-whale-subheading text-space-whale-navy">
        {subsection.title}
      </h4>
      {subsection.intro && (
        <p className="mt-1 text-sm text-space-whale-navy/70 font-space-whale-body">
          {subsection.intro}
        </p>
      )}
      <ItemsOrEmpty items={subsection.items} />
    </div>
  )
}

function TopicSection({ topic }: { topic: ResourceTopic }) {
  const hasSubsections = Boolean(topic.subsections?.length)
  const topItems = topic.items ?? []

  return (
    <section id={topic.id} className="scroll-mt-28 border-t border-space-whale-lavender/30 pt-8">
      <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
        {topic.title}
      </h3>
      <p className="text-sm text-space-whale-purple/80 font-space-whale-body max-w-2xl mb-3">
        {topic.intro}
      </p>

      {topItems.length > 0 && <ItemsOrEmpty items={topItems} />}

      {hasSubsections
        ? topic.subsections!.map((subsection) => (
            <Subsection key={subsection.id} subsection={subsection} />
          ))
        : topItems.length === 0 && <ItemsOrEmpty items={[]} />}
    </section>
  )
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, '')}`
}

export default function ResourcesPanel() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-space-whale-heading text-space-whale-navy mb-2">
          Resources
        </h2>
        <p className="text-sm sm:text-base text-space-whale-purple/80 font-space-whale-body max-w-2xl mb-5">
          Videos, books, podcasts and tools around the themes we care about — curated slowly, with
          care.
        </p>

        <nav aria-label="Resource topics" className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
          {RESOURCE_TOPICS.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="text-space-whale-purple hover:text-space-whale-navy underline underline-offset-2 decoration-space-whale-lavender"
            >
              {topic.title}
            </a>
          ))}
          <a
            href="#crisis-support"
            className="text-space-whale-navy hover:text-space-whale-purple underline underline-offset-2 font-medium"
          >
            Need support now?
          </a>
        </nav>
      </div>

      <div className="space-y-2">
        {RESOURCE_TOPICS.map((topic) => (
          <TopicSection key={topic.id} topic={topic} />
        ))}
      </div>

      <section
        id="crisis-support"
        className="scroll-mt-28 mt-14 pt-8 border-t-2 border-space-whale-navy/20"
      >
        <h3 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
          {CRISIS_SUPPORT.heading}
        </h3>
        <p className="text-base font-space-whale-body text-space-whale-navy mb-5">
          {CRISIS_SUPPORT.emergency}
        </p>
        <ul className="space-y-5">
          {CRISIS_SUPPORT.links.map((link) => (
            <li key={link.name}>
              <p className="font-space-whale-subheading text-space-whale-navy">{link.name}</p>
              <p className="text-sm text-space-whale-navy/80 font-space-whale-body mt-0.5">
                {link.detail}
              </p>
              <p className="mt-1.5 text-sm flex flex-wrap gap-x-3 gap-y-1">
                {link.phone && (
                  <a
                    href={phoneHref(link.phone)}
                    className="text-space-whale-purple hover:text-space-whale-navy underline underline-offset-2 font-medium"
                  >
                    {link.phone}
                  </a>
                )}
                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-space-whale-purple hover:text-space-whale-navy underline underline-offset-2"
                  >
                    {link.urlLabel ??
                      link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
