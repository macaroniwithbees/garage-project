"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 1200, suffix: "+", label: "Tevreden klanten" },
  { value: 15,   suffix: " jaar", label: "Ervaring" },
  { value: 4,    suffix: "",      label: "Gecertificeerde monteurs" },
  { value: 98,   suffix: "%",     label: "Klanttevredenheid" },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatItem({ value, suffix, label }: Stat) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 1800, inView);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <span className="block text-4xl font-extrabold text-white leading-none">
        {count}{suffix}
      </span>
      <span className="block text-sm text-gray-400 mt-1.5">{label}</span>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <div className="bg-gray-900 py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-around gap-8">
        {STATS.map((s) => (
          <StatItem key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}