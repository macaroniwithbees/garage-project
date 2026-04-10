"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "">("");
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const router = useRouter();

  const { theme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setType("");

    if (mode === "otp") {
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
        setMessage(
          `Magic Link gestuurd! Check je e-mail om in te loggen bij ${email}`,
        );
      }
    }

    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setType("error");
        setMessage("Fout bij inloggen: " + error.message);
      } else {
        setType("success");
        setMessage("Succesvol ingelogd!");
        router.push("/dashboard"); // adjust to your route
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto transition-colors duration-300">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-6 text-center">
        Welkom terug
      </h2>

      <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
        Log in op uw account
      </p>

      {/* mode switch */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("otp")}
          className={`flex-1 py-2 rounded ${
            mode === "otp"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Magic Link
        </button>

        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 py-2 rounded ${
            mode === "password"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Password
        </button>
      </div>

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
            className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100"
          />
        </div>

        {mode === "password" && (
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
              Wachtwoord
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors"
        >
          {mode === "otp" ? "Stuur Magic Link" : "Login"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
        Nog geen account?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Registreer hier
        </Link>
      </p>
    </div>
  );
}