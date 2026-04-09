import { Car } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 border-t border-gray-800 pt-6">
        <div className="flex items-center gap-2 font-bold text-white">
          <Car size={18} className="text-blue-500" />
          AutoGarage Pro
        </div>
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} AutoGarage Pro. Alle rechten voorbehouden.
        </p>
      </div>
    </footer>
  );
}