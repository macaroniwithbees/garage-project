"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Car } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      {/* logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg">
        <Car className="text-blue-600" size={22} />
        <span>AutoGarage Pro</span>
      </Link>

      {/* nav links */}
      <div className="hidden md:flex items-center gap-8">
        {["#diensten", "#waarom", "#reviews"].map((href, i) => (
          <a
            key={href}
            href={href}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {["Diensten", "Over ons", "Reviews"][i]}
          </a>
        ))}
      </div>

      {/* actions */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Inloggen
        </Link>
        <Link
          href="/register"
          className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-150"
        >
          Registreren
        </Link>
      </div>
    </nav>
  );
}