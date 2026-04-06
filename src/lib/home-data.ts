/**
 * Homepage content — features, programs, and navigation labels.
 */

export const navLinks = [
  { label: "All Programs", href: "/courses" },
  { label: "Home", href: "#" },
  { label: "Podcasts", href: "#" },
  { label: "Referral", href: "#" },
  { label: "Blogs", href: "#" },
  { label: "Payment", href: "#" },
  { label: "IT Services", href: "#" },
  { label: "Contact Us", href: "#" },
] as const;

export const heroKeywords = [
  "Data Analytics",
  "Data Engineering",
  "BI",
  "Machine Learning",
  "Statistics",
  "Agentic AI",
] as const;

export const whyAnalyticsAvenue = {
  heading: "Why Analytics Avenue",
  body:
    "Analytics Avenue is built by Indian data experts who have shipped analytics, AI, and ML systems in production. We combine structured learning paths with hands-on portfolio projects, mentorship from industry practitioners, and hiring touchpoints that connect you to real opportunities. Whether you are pivoting into data roles or advancing your career, we help you build proof that employers can trust.",
} as const;

export const features = [
  {
    title: "Industry-aligned curriculum",
    description: "Skills mapped to real job descriptions and hiring bar for analytics & AI roles.",
  },
  {
    title: "Portfolio-ready projects",
    description: "End-to-end projects you can present in interviews with clear narratives.",
  },
  {
    title: "1:1 mentorship",
    description: "Focused sessions to unblock concepts, projects, and career decisions.",
  },
  {
    title: "Live instructor-led classes",
    description: "Interactive sessions with space for questions, demos, and deep dives.",
  },
  {
    title: "Recordings & lifetime access",
    description: "Revisit lessons on your schedule and keep materials as you grow.",
  },
  {
    title: "Certificates of completion",
    description: "Recognized milestones for programs you complete with assessments.",
  },
  {
    title: "Interview preparation",
    description: "Practice stories, case prompts, and structured feedback for data roles.",
  },
  {
    title: "Resume & LinkedIn reviews",
    description: "Tighten positioning, impact bullets, and recruiter-facing signals.",
  },
  {
    title: "Community & peer groups",
    description: "Learn alongside motivated peers with moderated discussions.",
  },
  {
    title: "Hiring partner sessions",
    description: "Exposure to how teams hire, evaluate portfolios, and shortlist candidates.",
  },
  {
    title: "Career roadmap planning",
    description: "Clarify next steps across analytics, BI, ML, and AI-adjacent paths.",
  },
  {
    title: "Hands-on labs",
    description: "Guided exercises with realistic datasets, tools, and constraints.",
  },
  {
    title: "AI tools & sandboxes",
    description: "Safe environments to experiment with models, agents, and workflows.",
  },
  {
    title: "Case study breakdowns",
    description: "Learn how decisions were made end-to-end in real analytics problems.",
  },
  {
    title: "Weekly doubt sessions",
    description: "Dedicated time to resolve questions from classes and assignments.",
  },
  {
    title: "Academic collaborations",
    description: "Programs shaped with academic and industry partners for depth and rigor.",
  },
] as const;

export const aiPrograms = [
  {
    id: "agentic-ai-for-data-practitioners",
    title: "Agentic AI for Data Practitioners",
    price: "Free",
    isFree: true,
    rating: 4.9,
    lessons: 28,
  },
  {
    id: "machine-learning-engineering-production-path",
    title: "Machine Learning Engineering — Production Path",
    price: "Free",
    isFree: true,
    rating: 4.8,
    lessons: 36,
  },
  {
    id: "data-engineering-modern-stack",
    title: "Data Engineering on the Modern Stack",
    price: "Free",
    isFree: true,
    rating: 4.8,
    lessons: 32,
  },
  {
    id: "business-intelligence-analytics-storytelling",
    title: "Business Intelligence & Analytics Storytelling",
    price: "₹18,999",
    isFree: false,
    rating: 4.7,
    lessons: 22,
  },
  {
    id: "statistics-decision-making-modeling",
    title: "Statistics for Decision-Making & Modeling",
    price: "₹16,499",
    isFree: false,
    rating: 4.8,
    lessons: 20,
  },
  {
    id: "generative-ai-foundations-analytics-teams",
    title: "Generative AI Foundations for Analytics Teams",
    price: "₹21,999",
    isFree: false,
    rating: 4.9,
    lessons: 24,
  },
] as const;

/** Homepage programs grid — matches spec (3–6). */
export const homeProgramsPreviewCount = 6;

/** Initial feature cards before “View All Features”. */
export const featuresPreviewCount = 8;

/** Existing feature rows surfaced in the Experts section (titles must match `features`). */
export const expertsSectionFeatureTitles = [
  "Industry-aligned curriculum",
  "1:1 mentorship",
  "Live instructor-led classes",
] as const;

/** Hiring / career features for the Placement section (titles must match `features`). */
export const placementSectionFeatureTitles = [
  "Interview preparation",
  "Hiring partner sessions",
  "Resume & LinkedIn reviews",
  "Career roadmap planning",
] as const;

export const stats = [
  { value: "2000+", label: "Professionals Upskilled Globally" },
  { value: "50+", label: "Academic & Industry Collaborations" },
  { value: "540+", label: "Industry Hiring Touchpoints" },
  { value: "40+", label: "Core Team & Industry Mentors" },
] as const;
