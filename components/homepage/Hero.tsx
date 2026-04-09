import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 text-center">
      {/* background blobs */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-200/50 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-green-200/50 blur-[80px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        {/* badge */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Nu open · Ma–Vr 08:00–18:00
        </div>

        {/* heading */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-5">
          Uw betrouwbare{" "}
          <span className="text-blue-600">autogaragebedrijf</span>
        </h1>

        {/* subtitle */}
        <p className="text-lg text-gray-500 leading-relaxed max-w-lg mx-auto mb-10">
          Professioneel onderhoud en reparaties voor uw auto. Met jarenlange
          ervaring en een team van gecertificeerde monteurs staan wij voor u klaar.
        </p>

        {/* ctas */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-150"
          >
            Maak een afspraak
            <ArrowRight size={16} />
          </Link>
          <a
            href="#diensten"
            className="inline-flex items-center gap-2 bg-white text-gray-800 font-semibold px-7 py-3.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-150"
          >
            Onze diensten
          </a>
        </div>
      </div>
    </section>
  );
}