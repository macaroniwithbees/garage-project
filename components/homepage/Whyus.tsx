import { Users, Clock, ShieldCheck } from "lucide-react";
import { type ReactNode } from "react";
import FadeIn from "./FadeIn";

interface Reason {
  icon: ReactNode;
  title: string;
  desc: string;
}

const REASONS: Reason[] = [
  {
    icon: <Users size={24} />,
    title: "Ervaren Team",
    desc: "4 gecertificeerde monteurs met jarenlange ervaring in de autobranche.",
  },
  {
    icon: <Clock size={24} />,
    title: "Snelle Service",
    desc: "Efficiënte werkwijze en realistische tijdinschattingen voor uw gemak.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Kwaliteitsgarantie",
    desc: "Garantie op alle werkzaamheden en gebruik van originele onderdelen.",
  },
];

export default function WhyUs() {
  return (
    <section id="waarom" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
            Waarom wij
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Waarom Voor Ons Kiezen?
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Wij combineren technische expertise met een persoonlijke aanpak.
          </p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REASONS.map((r, i) => (
            <FadeIn key={r.title} delay={i * 100}>
              <div className="flex gap-4 items-start p-6 border border-gray-100 rounded-2xl hover:shadow-md hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}