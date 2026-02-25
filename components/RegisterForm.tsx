"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterForm() {
    return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Welkom bij AutoGarage Pro</h2>
        <p className="text-gray-600 text-center mb-6">Registreer uw account</p>

        <form className="space-y-4">
            <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">Vul uw e-mailadres</label>
            <input
                type="email"
                required
                placeholder="uw@email.nl"
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
            />
            </div>

            <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors"
            >
            Stuur Magic Link
            </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
            Heb je al een account? <a href="/" className="text-blue-600 font-medium">Login hier</a>
        </p>

        <p className="mt-4 text-center text-gray-400 hover:underline cursor-pointer">
            &larr; Terug naar homepage
        </p>
    </div>
    )
}