import { AnnouncementBar } from "@/components/home/announcement-bar";
import { Navbar } from "@/components/home/navbar";
import { CoursesCatalog } from "@/components/courses/courses-catalog";

export default function CoursesPage() {
  return (
    <div className="flex min-h-full flex-col bg-muted/30 text-foreground antialiased">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <CoursesCatalog />
      </main>
    </div>
  );
}
