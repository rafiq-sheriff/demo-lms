import Link from "next/link";
import { Suspense } from "react";

import { AnnouncementBar } from "@/components/home/announcement-bar";
import { Navbar } from "@/components/home/navbar";
import { SectionContainer } from "@/components/layout/section-container";

import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <AnnouncementBar />
      <Navbar />
      <main className="flex flex-1 flex-col py-12 sm:py-16">
        <SectionContainer>
          <nav className="text-sm text-muted-foreground">
            <Link href="/" className="font-medium text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Login</span>
          </nav>
          <div className="mt-10">
            <Suspense fallback={<LoginFallback />}>
              <LoginForm />
            </Suspense>
          </div>
        </SectionContainer>
      </main>
    </div>
  );
}
