"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="
        w-9 h-9 rounded-lg flex items-center justify-center
        text-gray-500 hover:text-blue-600
        hover:bg-gray-100 dark:hover:bg-gray-800
        dark:text-gray-400 dark:hover:text-blue-400
        transition-all duration-200
      "
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}