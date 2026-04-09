import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20 px-6 text-center">
      <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">
        Klaar om een afspraak te maken?
      </h2>
      <p className="text-blue-100 text-lg mb-8">
        Plan vandaag nog uw bezoek — wij staan voor u klaar.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150"
      >
        Afspraak maken
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}