import type { Question, Questionnaire, Section } from "../types"

/**
 * CES Academy onboarding questionnaire — 27 questions across 5 sections,
 * transcribed from the CP onboarding doc
 * (12RZq8rLbMcwKr68KpcLgGBVNrhI9PLIZRQU6nDLa-pA).
 *
 * Wording is kept verbatim from that doc so the export reads like the original.
 * Question ids are permanent: answers are stored against them.
 */

export const CES_ACADEMY: Questionnaire = {
  slug: "ces-academy",
  path: "/onboarding-ces",
  clientName: "CES Academy",
  title: "CES Academy Onboarding",
  contact: { name: "Conversion Partners", email: "hello@conversionpartners.net" },
  intro: {
    heading: "Let's get to know your organization",
    body: [
      "This is the background we use to build your value proposition work. It runs one question at a time, so you never face a wall of them.",
      "Answer what you can. None of these are required, and there is no penalty for leaving one alone. If a question belongs to someone else on your team, hand it to them and it will land in their inbox as a single question with its own link.",
      "You can close this and come back anytime. Your progress saves as you go.",
    ],
  },
  export: {
    // Clients shared drive → CES, alongside "Onboarding Questionnaire - CES".
    folderId: "1LPd5rGuQ4yCH2s5Iq32zbHyzsnCiZqm3",
    docName: "Onboarding Responses - CES",
  },
}

export const CES_ACADEMY_SECTIONS: Section[] = [
  {
    id: "business-background",
    title: "Business Background",
    questions: [
      {
        id: "org-overview",
        prompt: "Can you give me a brief overview of your organization?",
        type: "long",
      },
      {
        id: "mission-vision-values",
        prompt: "What is your mission, vision, and core values?",
        type: "long",
      },
      {
        id: "ideal-customer",
        prompt: "Who is your ideal customer (demographics, psychographics, behaviors)?",
        type: "long",
      },
      {
        id: "customer-segments",
        prompt: "Are there multiple customer segments? If so, what are they?",
        type: "long",
      },
      {
        id: "pain-points",
        prompt: "What are your customers' biggest pain points and desires?",
        type: "long",
      },
      {
        id: "primary-competitors",
        prompt: "Who are your primary competitors (top 3-5)?",
        type: "long",
      },
      {
        id: "indirect-competitors",
        prompt:
          "Are there any businesses/offerings that are not technically direct competitors, but provide a similar solution for your ideal prospect?",
        type: "long",
      },
      {
        id: "value-proposition",
        prompt: "How do you currently articulate your organization's value proposition?",
        type: "long",
      },
      {
        id: "brand-style-guide",
        prompt: "Do you have a brand style guide? If so, please provide a link.",
        type: "short",
        placeholder: "Paste a link, or tell us if there isn't one",
      },
      {
        id: "offerings-overview",
        prompt: "Can you provide an overview of your product or service offerings?",
        type: "long",
      },
    ],
  },
  {
    id: "marketing-context",
    title: "Marketing Context",
    questions: [
      {
        id: "marketing-channels",
        prompt:
          "What marketing channels are you currently using (paid, organic, social, events, email, etc.)?",
        type: "long",
      },
      {
        id: "funnel-conversion-rates",
        prompt: "What is your current conversion rate at each stage of the funnel?",
        type: "long",
        helper: "Rough numbers are fine. If you don't track this, say so — that's useful too.",
      },
      {
        id: "existing-collateral",
        prompt:
          "Can you provide links to existing marketing collateral (landing pages, ad creatives, email sequences, etc.)?",
        type: "long",
        placeholder: "One link per line",
      },
      {
        id: "what-has-worked",
        prompt: "What has worked well in the past, and what hasn't?",
        type: "long",
      },
      {
        id: "marketing-challenges",
        prompt: "What are your biggest marketing challenges right now?",
        type: "long",
      },
    ],
  },
  {
    id: "kpis",
    title: "Key Performance Indicators",
    questions: [
      {
        id: "customer-journey",
        prompt: "What does the typical customer journey look like (online and offline)?",
        type: "long",
      },
      {
        id: "important-kpis",
        prompt:
          "What KPIs are most important to you (revenue, leads, conversion rates, ROI, brand awareness)?",
        type: "long",
      },
      {
        id: "benchmarks",
        prompt: "Are there any benchmarks you'd like to achieve within the next 3-6 months?",
        type: "long",
      },
    ],
  },
  {
    id: "technology-resources",
    title: "Technology and Resources",
    questions: [
      {
        id: "tech-stack",
        prompt:
          "What does your tech stack look like? (e.g., Analytics, CMS, CRM, A/B Testing, Email, etc.)",
        type: "long",
      },
      {
        id: "other-platforms",
        prompt: "Any other platforms which may be relevant to this project?",
        type: "long",
      },
      {
        id: "test-account",
        prompt:
          "If possible, please provide a test account with which we can go through the entire conversion funnel. This might include dummy customer info, CC info, address, username, etc.",
        type: "long",
        helper:
          "Please don't paste real passwords or live payment details here. A note that one is available, and who to ask, is enough.",
      },
      {
        id: "dev-resources",
        prompt: "Do you have full-stack development resources available?",
        type: "long",
      },
      {
        id: "design-resources",
        prompt: "Do you have in-house design resources available?",
        type: "long",
      },
    ],
  },
  {
    id: "other-considerations",
    title: "Other Considerations",
    questions: [
      {
        id: "peculiarities",
        prompt:
          "Are there any peculiarities about your organization or business model that we should know about? These could include seasonality, business processes, market forces, or other considerations.",
        type: "long",
      },
      {
        id: "constraints",
        prompt:
          "Are there any constraints or limitations we should be aware of related to the area of focus you've identified? These could be business, legal, technical, or other considerations.",
        type: "long",
      },
      {
        id: "team-members",
        prompt:
          "Please provide the names, roles, and emails of the team members who will participate in the project.",
        type: "long",
        placeholder: "Name, role, email — one per line",
      },
      {
        id: "anything-else",
        prompt: "Is there anything we've not asked that we should know?",
        type: "long",
      },
    ],
  },
]

export const CES_ACADEMY_QUESTIONS: Question[] = CES_ACADEMY_SECTIONS.flatMap((s) => s.questions)
