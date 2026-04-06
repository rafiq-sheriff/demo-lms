"use client";

import { use } from "react";

import { CoursePlayerPageClient } from "./course-player-page-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function DashboardCoursePlayerPage({ params }: PageProps) {
  const { id } = use(params);
  return <CoursePlayerPageClient courseId={id} />;
}
