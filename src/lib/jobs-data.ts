export type JobType = "Full-time" | "Internship";

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  /** Filter facet */
  role: string;
  shortDescription: string;
  fullDescription: string;
  requirements: string[];
  /** Set when the current user has applied via the API */
  applied?: boolean;
  appliedAt?: string | null;
};

export const jobListings: JobListing[] = [
  {
    id: "j1",
    title: "Senior Data Analyst — Growth",
    company: "Northwind Analytics",
    location: "Bengaluru · Hybrid",
    type: "Full-time",
    role: "Data Analyst",
    shortDescription:
      "Own experimentation readouts, cohort dashboards, and stakeholder narratives for a high-growth product surface.",
    fullDescription:
      "You will partner with product and marketing to design metrics, validate lift, and communicate trade-offs clearly. Strong SQL, statistics, and storytelling are essential. Experience with warehouse tools and BI stacks is expected.",
    requirements: [
      "5+ years in analytics or data science roles",
      "Advanced SQL and Python; comfortable with dbt or similar",
      "Clear written communication for executive audiences",
    ],
  },
  {
    id: "j2",
    title: "ML Engineer — Ranking",
    company: "Contoso Labs",
    location: "Remote · India",
    type: "Full-time",
    role: "Machine Learning",
    shortDescription:
      "Ship ranking and retrieval models with robust offline evaluation and safe online rollout.",
    fullDescription:
      "Join a platform team building search and recommendations. You will own feature pipelines, model serving, and monitoring. Close collaboration with backend and product is core to the role.",
    requirements: [
      "3+ years shipping ML in production",
      "PyTorch or TensorFlow; familiarity with feature stores",
      "Experience with A/B testing and model observability",
    ],
  },
  {
    id: "j3",
    title: "Analytics Engineer",
    company: "Fabrikam Data Co.",
    location: "Hyderabad · On-site",
    type: "Full-time",
    role: "Data Engineering",
    shortDescription:
      "Build trusted datasets, semantic layers, and pipelines that power self-serve analytics across the org.",
    fullDescription:
      "You will modernize pipelines, enforce data quality contracts, and partner with analysts on performant models. Prior experience with cloud warehouses and orchestration is important.",
    requirements: [
      "Strong SQL and Python; dbt or Spark experience",
      "Hands-on with Airflow, Dagster, or similar",
      "Comfortable mentoring analysts on data modeling",
    ],
  },
  {
    id: "j4",
    title: "Summer Intern — Decision Science",
    company: "Adventure Works",
    location: "Mumbai · Hybrid",
    type: "Internship",
    role: "Data Analyst",
    shortDescription:
      "12-week internship supporting pricing experiments, causal reads, and exec-ready summaries.",
    fullDescription:
      "Work with mentors on real business problems: design of experiments, metric hygiene, and insight synthesis. Ideal for students completing advanced coursework in statistics or analytics.",
    requirements: [
      "Pursuing a degree in statistics, economics, CS, or related field",
      "SQL proficiency; Python a plus",
      "Portfolio or coursework demonstrating analytical writing",
    ],
  },
  {
    id: "j5",
    title: "BI Developer — Enterprise",
    company: "Litware Inc.",
    location: "Pune · Hybrid",
    type: "Full-time",
    role: "Business Intelligence",
    shortDescription:
      "Deliver dashboards and semantic models for finance and operations with a focus on clarity and governance.",
    fullDescription:
      "Translate complex operational data into governed datasets and intuitive dashboards. Partner with IT on access patterns and with business on adoption.",
    requirements: [
      "Experience with Power BI, Tableau, or Looker",
      "Data modeling and dimensional design",
      "Stakeholder management in enterprise settings",
    ],
  },
  {
    id: "j6",
    title: "Research Intern — Agents",
    company: "Wide World Importers",
    location: "Remote",
    type: "Internship",
    role: "Machine Learning",
    shortDescription:
      "Explore tool-use reliability and evaluation harnesses for internal agent prototypes.",
    fullDescription:
      "Collaborate with research engineers on benchmarking, prompt and tool routing experiments, and safety checks. Publication-quality rigor is welcome but not required.",
    requirements: [
      "Graduate coursework in ML or related area",
      "Python; exposure to LLM tooling",
      "Comfort reading and reproducing papers",
    ],
  },
];

export const jobRoleFilters = [
  "All roles",
  "Data Analyst",
  "Machine Learning",
  "Data Engineering",
  "Business Intelligence",
] as const;

export const jobLocationFilters = [
  "All locations",
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Pune",
  "Remote",
] as const;

export const jobTypeFilters = ["All types", "Full-time", "Internship"] as const;
