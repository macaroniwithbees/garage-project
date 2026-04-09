"use client";

import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { Car, CircleUser, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type NavbarProps = {
  user: User | null;
  onLogout: () => void;
};

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  const displayName =
    user?.email?.split("@")[0] || "Gebruiker";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-20 py-2 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* logo */}
        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg">
          <Car className="text-blue-600" size={22} />
          <span>AutoGarage Pro</span>
        </div>

        {/* right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* user */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
            <CircleUser size={18} />
            <span className="text-sm font-medium">{displayName}</span>
          </div>

          {/* logout button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Uitloggen
          </button>
        </div>
      </div>
    </nav>
  );
}