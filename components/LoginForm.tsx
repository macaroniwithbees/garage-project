"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/context/ThemeContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "">("");
  const { theme } = useTheme(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `http://localhost:3000/auth/callback`,
      },
    });
    if (error) {
      setType("error");
      setMessage("Fout bij inloggen: " + error.message);
    } else {
      setType("success");
      setMessage(`Magic Link gestuurd! Check je e-mail om in te loggen bij ${email}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto transition-colors duration-300">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-6 text-center">
        Welkom terug
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Log in op uw account
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
            E-mailadres
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="uw@email.nl"
            className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!!message && type === "success"}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          Stuur Magic Link
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            type === "success"
              ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700"
              : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700"
          }`}
        >
          {type === "success" ? "✓ " : "× "}
          {message}
        </div>
      )}

      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Nog geen account?{" "}
        <Link href="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
          Registreer hier
        </Link>
      </p>
      <p className="mt-4 text-center text-gray-400 dark:text-gray-500 hover:underline cursor-pointer">
        <Link href="/">&larr; Terug naar homepage</Link>
      </p>
    </div>
  );
}