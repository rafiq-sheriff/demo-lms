import Link from "next/link";

import { CourseCard } from "@/components/home/course-card";
import { SectionContainer } from "@/components/layout/section-container";
import { Card, CardContent } from "@/components/ui/card";

const specialFeatures = [
  {
    title: "Industry-aligned curriculum",
    description: "Skills mapped to real job descriptions and hiring bar.",
  },
  {
    title: "Portfolio-ready projects",
    description: "End-to-end projects you can present in interviews.",
  },
  {
    title: "1:1 mentorship",
    description: "Focused sessions to unlock concepts, projects, and career decisions.",
  },
  {
    title: "Live instructor-led classes",
    description: "Interactive sessions with Q&A and demos.",
  },
  {
    title: "Recordings & lifetime access",
    description: "Revisit sessions anytime.",
  },
  {
    title: "Certificates of completion",
    description: "Recognized credentials.",
  },
  {
    title: "Interview preparation",
    description: "Case studies, mock interviews, structured feedback.",
  },
  {
    title: "Resume & LinkedIn reviews",
    description: "Improve visibility and recruiter reach.",
  },
] as const;

const masteryItems = [
  "AI Tools",
  "Projects",
  "Mentorship",
  "Placement Support",
  "Certifications",
  "Real-world Practice",
] as const;

const expertPanel = [
  {
    name: "Riya Sharma",
    role: "AI Engineer",
    description: "Builds production-ready ML systems and mentors learners on applied AI delivery.",
  },
  {
    name: "Arjun Mehta",
    role: "Data Scientist",
    description: "Specializes in experimentation, model interpretation, and stakeholder storytelling.",
  },
  {
    name: "Neha Verma",
    role: "AI Engineer",
    description: "Guides students through portfolio projects and interview-focused implementation.",
  },
] as const;

const strategySteps = ["Learn", "Build", "Practice", "Get Hired"] as const;

const upcomingBatches = [
  { name: "AI Foundations Bootcamp", startDate: "15 Apr 2026", duration: "12 Weeks" },
  { name: "Data Science Career Track", startDate: "22 Apr 2026", duration: "16 Weeks" },
  { name: "ML Engineering Live Program", startDate: "01 May 2026", duration: "14 Weeks" },
] as const;

const industryPrograms = [
  {
    id: "industry-ready-genai",
    title: "Industry Ready Generative AI Program",
    price: "Premium",
    rating: 4.9,
    lessons: 30,
  },
  {
    id: "industry-ready-data-science",
    title: "Industry Ready Data Science Program",
    price: "Premium",
    rating: 4.8,
    lessons: 36,
  },
  {
    id: "industry-ready-data-engineering",
    title: "Industry Ready Data Engineering Program",
    price: "Premium",
    rating: 4.8,
    lessons: 32,
  },
] as const;

const hiringCompanies = [
  "Google",
  "Amazon",
  "Microsoft",
  "Accenture",
  "Infosys",
  "TCS",
  "Deloitte",
] as const;

const placementModules = [
  "Resume preparation",
  "Mock interviews",
  "Placement assistance",
] as const;

const onboardingSteps = ["Sign up", "Choose course", "Start learning"] as const;

const faqs = [
  "What is included in the course?",
  "Do I get placement support?",
  "Are sessions live or recorded?",
  "Can beginners join?",
] as const;

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
    </div>
  );
}

export function LandingExtensions() {
  return (
    <>
      <section className="border-b border-border/70 bg-background py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Special Features in Our Analytics Avenue LMS" />
          <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {specialFeatures.map((feature) => (
              <li key={feature.title}>
                <Card className="h-full rounded-xl border-border/80 bg-muted/30 shadow-sm ring-1 ring-foreground/[0.04] transition hover:border-primary/15 hover:bg-card hover:shadow-md">
                  <CardContent className="pt-6">
                    <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-zinc-50/70 py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Mastering AI, unlocking your opportunities" />
          <div className="mt-12 flex justify-center">
            <div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3 md:relative md:h-[320px] md:w-[320px] md:grid-cols-1 md:gap-0">
              {masteryItems.map((item, index) => {
                const positions = [
                  "md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2",
                  "md:absolute md:right-0 md:top-1/4",
                  "md:absolute md:right-0 md:bottom-1/4",
                  "md:absolute md:left-1/2 md:bottom-0 md:-translate-x-1/2",
                  "md:absolute md:left-0 md:bottom-1/4",
                  "md:absolute md:left-0 md:top-1/4",
                ];

                return (
                  <div
                    key={item}
                    className={`${positions[index]} inline-flex items-center justify-center rounded-full border border-border/80 bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm`}
                  >
                    {item}
                  </div>
                );
              })}
              <div className="col-span-2 flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:h-28 md:w-28 md:-translate-x-1/2 md:-translate-y-1/2">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white md:h-28 md:w-28 md:text-sm">
                  AI Mastery
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-background py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Our Data Experts Panel" />
          <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
            {expertPanel.map((expert) => (
              <li key={expert.name}>
                <Card className="h-full rounded-2xl border-border/70 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="pt-6">
                    <p className="text-sm text-amber-500">★★★★★</p>
                    <p className="mt-3 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
                      {expert.name}
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-indigo-600">{expert.role}</p>
                    <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                      {expert.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-zinc-50/70 py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Our Success Strategy Module" />
          <ol className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {strategySteps.map((step, index) => (
              <li key={step}>
                <Card className="h-full rounded-xl border-border/80 bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{step}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-background py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Upcoming Live Batches" />
          <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
            {upcomingBatches.map((batch) => (
              <li key={batch.name}>
                <Card className="h-full rounded-xl border-border/80 bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="text-[15px] font-semibold text-foreground">{batch.name}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Start Date:</span> {batch.startDate}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Duration:</span> {batch.duration}
                    </p>
                    <Link
                      href="/courses"
                      className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Enroll Now
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-zinc-50/70 py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Our Industry Ready AI Programs" />
          <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {industryPrograms.map((program) => (
              <CourseCard
                key={program.id}
                courseId={program.id}
                title={program.title}
                price={program.price}
                rating={program.rating}
                lessons={program.lessons}
                isFree={false}
                variant="catalog"
                programHref="/courses"
              />
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-background py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Aspirants Working With Top Companies Like" />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
            {hiringCompanies.map((company) => (
              <span
                key={company}
                className="inline-flex min-w-24 items-center justify-center rounded-lg border border-border/80 bg-card px-4 py-2 text-sm font-semibold text-foreground"
              >
                {company}
              </span>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-zinc-50/70 py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="3 Module Placement Opportunities" />
          <ul className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3">
            {placementModules.map((item) => (
              <li key={item}>
                <Card className="rounded-xl border-border/80 bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-[15px] font-semibold text-foreground">{item}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-background py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Check Our Onboardings" />
          <ol className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3">
            {onboardingSteps.map((step, index) => (
              <li key={step}>
                <Card className="rounded-xl border-border/80 bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Step {index + 1}
                    </p>
                    <p className="mt-2 text-[15px] font-semibold text-foreground">{step}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </SectionContainer>
      </section>

      <section className="border-b border-border/70 bg-zinc-50/70 py-14 sm:py-16 lg:py-20">
        <SectionContainer>
          <SectionTitle title="Frequently Asked Questions" />
          <div className="mx-auto mt-10 max-w-3xl space-y-3 sm:mt-12">
            {faqs.map((question) => (
              <details
                key={question}
                className="group rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground sm:text-base">
                  {question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Please contact our team for detailed guidance tailored to your learning goals.
                </p>
              </details>
            ))}
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
