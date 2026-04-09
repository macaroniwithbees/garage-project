import { Star } from "lucide-react";
import FadeIn from "./FadeIn";

interface Review {
  name: string;
  date: string;
  stars: number;
  text: string;
}

const REVIEWS: Review[] = [
  {
    name: "Jan Janssen",
    date: "15 januari 2024",
    stars: 5,
    text: "Uitstekende service! Zeer tevreden over de snelheid en kwaliteit.",
  },
  {
    name: "Lisa de Boer",
    date: "20 januari 2024",
    stars: 5,
    text: "Professioneel en betrouwbaar. Mijn auto rijdt weer als nieuw!",
  },
  {
    name: "Michiel Peters",
    date: "1 februari 2024",
    stars: 4,
    text: "Goede garage met eerlijke prijzen. Zeker een aanrader.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={i < count ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="bg-gray-50 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
            Reviews
          </span>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            Wat Onze Klanten Zeggen
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Lees wat onze klanten over ons zeggen.
          </p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <FadeIn key={r.name} delay={i * 100}>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <Stars count={r.stars} />
                <p className="text-gray-700 text-sm leading-relaxed italic mb-4">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                  <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}