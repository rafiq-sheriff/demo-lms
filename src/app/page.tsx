import { AnnouncementBar } from "@/components/home/announcement-bar";
import { AiProgramsSection } from "@/components/home/ai-programs-section";
import { FeaturesSection } from "@/components/home/features-section";
import { HeroSection } from "@/components/home/hero-section";
import { Navbar } from "@/components/home/navbar";
import { StatsSection } from "@/components/home/stats-section";
import { WhyAnalyticsAvenue } from "@/components/home/why-analytics-avenue";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-white text-slate-900">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <WhyAnalyticsAvenue />
        <FeaturesSection />
        <AiProgramsSection />
        <StatsSection />
      </main>
    </div>
  );
}
