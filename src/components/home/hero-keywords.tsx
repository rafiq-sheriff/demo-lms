"use client";

import { useEffect, useState } from "react";
import { heroKeywords } from "@/lib/home-data";

export function HeroKeywords() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % heroKeywords.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mt-7 sm:mt-8">
      <div className="mx-auto flex min-h-[3rem] max-w-xl items-center justify-center px-2 lg:mx-0 lg:justify-start">
        <div className="inline-flex items-center justify-center rounded-full border border-border/90 bg-card/90 px-5 py-2.5 shadow-sm ring-1 ring-foreground/[0.04] backdrop-blur-sm">
          <p
            key={heroKeywords[index]}
            className="animate-keyword text-center text-[15px] font-semibold tracking-tight text-primary sm:text-base lg:text-left"
          >
            {heroKeywords[index]}
          </p>
        </div>
      </div>
    </div>
  );
}
