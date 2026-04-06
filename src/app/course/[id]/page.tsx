"use client";

import { use } from "react";

import { CourseDetailPageClient } from "./course-detail-page-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  return <CourseDetailPageClient courseId={id} />;
}
