import { Wrench, CheckCircle, Truck, Clock } from "lucide-react";
import { type ReactNode } from "react";
import FadeIn from "./FadeIn";

interface Service {
  icon: ReactNode;
  title: string;
  desc: string;
}

const SERVICES: Service[] = [
  {
    icon: <Wrench size={28} />,
    title: "Onderhoud",
    desc: "Regulier onderhoud volgens fabrieksspecificaties voor optimale prestaties.",
  },
  {
    icon: <CheckCircle size={28} />,
    title: "APK Keuring",
    desc: "Erkende APK keuring uitgevoerd door gecertificeerde keurmeesters.",
  },
  {
    icon: <Truck size={28} />,
    title: "Reparaties",
    desc: "Snelle en betrouwbare reparaties aan alle merken en modellen.",
  },
  {
    icon: <Clock size={28} />,
    title: "Airco Service",
    desc: "Professionele airco reiniging en reparatie voor optimaal comfort.",
  },
];

export default function Services() {
  return (
    <section id="diensten" className="bg-gray-50 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
            Diensten
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Onze Diensten
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Van APK tot airco — alles onder één dak, uitgevoerd door vakmensen.
          </p>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s, i) => (
            <FadeIn key={s.title} delay={i * 80}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-blue-100 transition-all duration-250">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}