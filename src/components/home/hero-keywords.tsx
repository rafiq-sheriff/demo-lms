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
    <div className="mt-10 sm:mt-12">
      <div className="relative min-h-[2.75rem] w-full max-w-xl overflow-hidden text-center sm:min-h-[3rem]">
        <p
          key={heroKeywords[index]}
          className="animate-keyword text-lg font-semibold text-indigo-700 sm:text-xl"
        >
          {heroKeywords[index]}
        </p>
      </div>
    </div>
  );
}
