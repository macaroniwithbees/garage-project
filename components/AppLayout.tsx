"use client";

import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";

type Props = {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function AppLayout({ user, onLogout, children }: Props) {
  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-950">
      <Navbar user={user} onLogout={onLogout} />

      {/* spacing for fixed navbar */}
      <div className="pt-24">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </div>
      </div>
    </div>
  );
}