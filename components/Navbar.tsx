"use client";

import { User } from "@supabase/supabase-js";
import { Car, CircleUser, LogOut } from "lucide-react";

type NavbarProps = {
  user: User;
  onLogout: () => void;
};

export default function Navbar({ user, onLogout }: NavbarProps) {
  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Gebruiker";

  return (
    <nav className="w-full bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* linkerzijde met logo */}
        <div className="flex items-center gap-2">
          <Car className="inline text-blue-800 mr-2" size={40} />
          <span className="font-semibold text-gray-800 text-lg">
            AutoGarage Pro
          </span>
        </div>

        {/* rechterzijde met gebruiker & uitloggen */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
                <CircleUser />
                <span className="font-medium">{displayName}</span>
            </div>

            <div className="flex items-center gap-2 hover:text-red-600 transition-colors">
                <LogOut />
                <button
                    onClick={onLogout}
                >
                    Uitloggen
                </button>
            </div>
        </div>
      </div>
    </nav>
  );
}