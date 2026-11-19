/** Curated Deep Space resources — add links as you gather them. */

export type ResourceType =
  | 'video'
  | 'book'
  | 'podcast'
  | 'article'
  | 'guide'
  | 'toolkit'
  | 'org'
  | 'tool'
  | 'other'

export interface ResourceLink {
  title: string
  url?: string
  type?: ResourceType
  note?: string
}

export interface ResourceSubsection {
  id: string
  title: string
  intro?: string
  items: ResourceLink[]
}

export interface ResourceTopic {
  id: string
  title: string
  intro: string
  subsections?: ResourceSubsection[]
  items?: ResourceLink[]
}

export interface CrisisSupportLink {
  name: string
  detail: string
  phone?: string
  url?: string
  urlLabel?: string
}

export const RESOURCE_TOPICS: ResourceTopic[] = [
  {
    id: 'access-and-care',
    title: 'Access and care',
    intro:
      'Disability, neurodivergence and giftedness guides — mostly from lived-experience and community sources.',
    items: [],
  },
  {
    id: 'gender-and-queer',
    title: 'Gender and queer',
    intro: 'Trans and queer workbooks and toolkits.',
    subsections: [
      {
        id: 'workbooks-and-toolkits',
        title: 'Workbooks and toolkits',
        items: [],
      },
      {
        id: 'queer-trans-mob',
        title: 'Queer and trans Mob',
        intro: 'Aboriginal-led support and community resources.',
        items: [],
      },
    ],
  },
  {
    id: 'decolonising-and-indigenous',
    title: 'Decolonising and Indigenous',
    intro:
      'Aboriginal and Torres Strait Islander voices first, then global Indigenous voices, Palestinian solidarity, and decolonising healing practice.',
    subsections: [
      {
        id: 'first-nations',
        title: 'Aboriginal and Torres Strait Islander voices',
        intro: 'Books, poetry, and local organisations.',
        items: [],
      },
      {
        id: 'global-indigenous',
        title: 'Global Indigenous voices',
        items: [],
      },
      {
        id: 'palestinian-solidarity',
        title: 'Palestinian solidarity',
        items: [],
      },
      {
        id: 'decolonising-healing',
        title: 'Decolonising healing practice',
        items: [],
      },
    ],
  },
  {
    id: 'nature-and-place',
    title: 'Nature and place',
    intro: 'Central Coast plants, species records, and queer nature connection.',
    items: [],
  },
  {
    id: 'metacrisis-economics-hope',
    title: 'Metacrisis, economics and hope',
    intro:
      'Collapse thinking, money and economics, and solarpunk and regeneration for imagining what comes next.',
    subsections: [
      {
        id: 'collapse-thinking',
        title: 'Collapse thinking',
        items: [],
      },
      {
        id: 'money-and-economics',
        title: 'Money and economics',
        items: [],
      },
      {
        id: 'solarpunk-and-regeneration',
        title: 'Solarpunk and regeneration',
        items: [],
      },
    ],
  },
  {
    id: 'tech-sovereignty-and-ai',
    title: 'Tech sovereignty and AI',
    intro:
      'Getting off big tech — easy swaps, creative software, games, privacy tools, and AI with a close eye on its costs.',
    subsections: [
      {
        id: 'easy-swaps',
        title: 'Easy swaps',
        items: [],
      },
      {
        id: 'creative-software',
        title: 'Creative software',
        items: [],
      },
      {
        id: 'games',
        title: 'Games',
        items: [],
      },
      {
        id: 'privacy-tools',
        title: 'Privacy tools',
        items: [],
      },
      {
        id: 'ai-costs',
        title: 'AI — watching the costs',
        items: [],
      },
    ],
  },
  {
    id: 'practices',
    title: 'Practices',
    intro: 'Neurographic art, creative prompts, spirit and astrology.',
    subsections: [
      {
        id: 'neurographic-art',
        title: 'Neurographic art',
        items: [],
      },
      {
        id: 'creative-prompts',
        title: 'Creative prompts',
        items: [],
      },
      {
        id: 'spirit-and-astrology',
        title: 'Spirit and astrology',
        items: [],
      },
    ],
  },
  {
    id: 'reading-list',
    title: 'Reading list',
    intro:
      'About fifty books across neurodiversity, grief and the living world, queer ecologies, pleasure and power, and systems and futures.',
    subsections: [
      {
        id: 'neurodiversity',
        title: 'Neurodiversity',
        items: [],
      },
      {
        id: 'grief-and-living-world',
        title: 'Grief and the living world',
        items: [],
      },
      {
        id: 'queer-ecologies',
        title: 'Queer ecologies',
        items: [],
      },
      {
        id: 'pleasure-and-power',
        title: 'Pleasure and power',
        items: [],
      },
      {
        id: 'systems-and-futures',
        title: 'Systems and futures',
        items: [],
      },
    ],
  },
]

export const CRISIS_SUPPORT: {
  heading: string
  emergency: string
  links: CrisisSupportLink[]
} = {
  heading: 'Need support now?',
  emergency: 'In an emergency, call 000.',
  links: [
    {
      name: 'QLife (LGBTIQA+)',
      detail:
        'Free, anonymous peer support. Open 3pm to 9pm every day, including end-of-year public holidays and New Year’s.',
      url: 'https://qlife.org.au',
      urlLabel: 'qlife.org.au',
    },
    {
      name: 'Lifeline',
      detail: '24-hour crisis support for all ages, nationwide.',
      phone: '13 11 14',
      url: 'https://www.lifeline.org.au',
    },
    {
      name: '13YARN (Aboriginal and Torres Strait Islander people)',
      detail: '24-hour crisis support.',
      phone: '13 92 76',
      url: 'https://www.13yarn.org.au',
    },
    {
      name: 'Suicide Call Back Service',
      detail: '24-hour support if you’re having thoughts about suicide or self-harm.',
      phone: '1300 659 467',
      url: 'https://www.suicidecallbackservice.org.au',
    },
    {
      name: 'Kids Helpline',
      detail: '24-hour counselling for people aged 25 or under.',
      phone: '1800 55 1800',
      url: 'https://kidshelpline.com.au',
    },
  ],
}
