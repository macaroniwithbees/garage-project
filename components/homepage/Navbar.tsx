"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Car } from "lucide-react";

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
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      {/* logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
        <Car className="text-blue-600" size={22} />
        <span>AutoGarage Pro</span>
      </Link>

      {/* nav links */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#diensten" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          Diensten
        </a>
        <a href="#waarom" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          Over ons
        </a>
        <a href="#reviews" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          Reviews
        </a>
      </div>

      {/* actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-colors"
        >
          Inloggen
        </Link>
        <Link
          href="/register"
          className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-150"
        >
          Registreren
        </Link>
      </div>
    </nav>
  );
}