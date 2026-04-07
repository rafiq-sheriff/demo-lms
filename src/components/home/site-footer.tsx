import Link from "next/link";

import { SectionContainer } from "@/components/layout/section-container";

const quickLinks = ["Home", "Industries", "Services", "Solutions", "Career"] as const;
const services = [
  "Data Engineering",
  "Data Analytics",
  "Data Science",
  "Machine Learning",
  "NLP",
  "Open AI",
  "Digital Marketing",
] as const;
const industries = [
  "Oil & Gas",
  "Constructional",
  "Semiconductors",
  "Electronics",
  "Automotive",
  "Chemical",
  "Pharmaceutical",
  "Aerospace",
  "Healthcare",
] as const;
const help = ["FAQs", "Contact Us"] as const;

function FooterList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item}>
            <Link href="#" className="text-sm text-foreground transition hover:text-primary">
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background py-14 sm:py-16">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xl font-semibold tracking-tight text-foreground">Analytics Avenue</p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Analytics Avenue is an IT and EdTech organization specializing in advanced
              analytics, data engineering, and AI-driven solutions. We enable enterprise BI,
              GenAI, predictive analytics, and scalable data platforms to drive real business
              impact. Our model combines analytics solution delivery with industry-aligned
              upskilling. We support career growth through hands-on training, real project
              exposure, and curated freelancing opportunities, working with global clients and
              professionals to deliver measurable, data-driven outcomes.
            </p>
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">SOCIAL</p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href="#"
                  aria-label="X (Twitter)"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <span className="text-xs font-semibold">X</span>
                </Link>
                <Link
                  href="#"
                  aria-label="Facebook"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <span className="text-xs font-semibold">f</span>
                </Link>
                <Link
                  href="#"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  <span className="text-xs font-semibold">in</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
            <FooterList title="QUICK LINKS" items={quickLinks} />
            <FooterList title="SERVICES" items={services} />
            <FooterList title="INDUSTRIES" items={industries} />
            <FooterList title="HELP" items={help} />
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
}
