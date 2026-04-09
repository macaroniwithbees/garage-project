"use client";

import RegisterForm from "@/components/RegisterForm";
import ThemeToggle from "@/components/ThemeToggle";
import { Car } from "lucide-react";

export default function Register() {
    return (
      <main className="relative min-h-screen bg-linear-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          <Car className="inline mr-2" size={40} />AutoGarage Pro
        </h1>

        <RegisterForm />
      </main>
    )
}