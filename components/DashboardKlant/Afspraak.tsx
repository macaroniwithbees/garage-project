"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type FormState = {
  datum: string;
  dienst: string;
  kenteken: string;
  merk: string;
  model: string;
  opmerkingen: string;
};

export default function Afspraak() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    datum: "",
    dienst: "",
    kenteken: "",
    merk: "",
    model: "",
    opmerkingen: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDatum = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8); // alleen cijfers, max DDMMYYYY
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const onChange =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = key === "datum" ? formatDatum(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Je bent niet ingelogd.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("afspraken").insert({
      user_id: user.id,
      datum: form.datum,
      dienst: form.dienst,
      kenteken: form.kenteken,
      merk: form.merk,
      model: form.model,
      opmerkingen: form.opmerkingen,
      status: "in_afwachting",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push("/dashboard/MijnAfspraken");
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white/90 p-8 shadow-xl">
      <h1 className="mb-6 text-4xl font-bold text-slate-900">Afspraak Maken</h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Gewenste datum *</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="DD/MM/YYYY"
              value={form.datum}
              onChange={onChange("datum")}
              required
              pattern="^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/\d{4}$"
              maxLength={10}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Type dienst *</label>
            <select
              value={form.dienst}
              onChange={onChange("dienst")}
              required
              className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-blue-500 ${
                form.dienst ? "text-slate-900" : "text-slate-500"
              }`}
            >
              <option value="">
                Selecteer een dienst
              </option>
              <option value="onderhoud" className="text-slate-900">
                Onderhoud
              </option>
              <option value="apk" className="text-slate-900">
                APK
              </option>
              <option value="reparatie" className="text-slate-900">
                Reparatie
              </option>
              <option value="diagnose" className="text-slate-900">
                Diagnose
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Kenteken *</label>
            <input
              value={form.kenteken}
              onChange={onChange("kenteken")}
              required
              placeholder="12-ABC-3"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Merk *</label>
            <input
              value={form.merk}
              onChange={onChange("merk")}
              required
              placeholder="Volkswagen"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Model *</label>
            <input
              value={form.model}
              onChange={onChange("model")}
              required
              placeholder="Golf"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-700"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Opmerkingen / Specifieke klachten</label>
          <textarea
            value={form.opmerkingen}
            onChange={onChange("opmerkingen")}
            rows={5}
            placeholder="Beschrijf eventuele klachten of specifieke wensen..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 text-slate-700"
          />
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <strong>Let op:</strong> Na het indienen van uw afspraak, zal onze receptie deze bevestigen en een monteur
          toewijzen. U ontvangt updates over de status.
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Bezig met versturen..." : "Afspraak Bevestigen"}
        </button>
      </form>
    </div>
  );
}