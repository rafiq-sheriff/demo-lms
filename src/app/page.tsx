import { AiProgramsSection } from "@/components/home/ai-programs-section";
import { FeaturesSection } from "@/components/home/features-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { HeroSection } from "@/components/home/hero-section";
import { Navbar } from "@/components/home/navbar";
import { PlacementOutcomesSection } from "@/components/home/placement-outcomes-section";
import { SiteFooter } from "@/components/home/site-footer";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsExpertsSection } from "@/components/home/testimonials-experts-section";
import { WhyAnalyticsAvenue } from "@/components/home/why-analytics-avenue";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground antialiased">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <AiProgramsSection />
        <WhyAnalyticsAvenue />
        <FeaturesSection />
        <TestimonialsExpertsSection />
        <PlacementOutcomesSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
