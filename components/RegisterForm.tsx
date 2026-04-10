"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "">("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setType("");

    if (password !== confirmPassword) {
      setType("error");
      setMessage("Wachtwoorden komen niet overeen.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setType("error");
      setMessage("Fout: " + error.message);
    } else if (data.session) {
      // Email confirmation is OFF — user is immediately logged in
      setType("success");
      setMessage("Account aangemaakt!");
      router.push("/dashboard"); // adjust to your route
    } else {
      // Email confirmation is ON
      setType("success");
      setMessage("Account aangemaakt! Check je email om te bevestigen.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto transition-colors duration-300">
      <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-2 text-center">
        Account aanmaken
      </h2>

      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        Maak een nieuw account aan
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
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

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
            Bevestig wachtwoord
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors"
        >
          Account maken
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
        Heb je al een account?{" "}
        <Link href="/" className="text-blue-600 hover:underline">
          Login hier
        </Link>
      </p>
    </div>
  );
}