"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ReviewModalProps = {
  open: boolean;
  userId: number | null;
  onClose: () => void;
  onSubmitted: () => void;
};

function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-3xl transition-transform hover:scale-110"
          aria-label={`${star} ster${star > 1 ? "ren" : ""}`}
        >
          <span
            className={
              star <= (hover || rating) ? "text-yellow-400" : "text-slate-300"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export default function ReviewModal({
  open,
  userId,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  if (!open || userId === null) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorText("Selecteer een beoordeling.");
      return;
    }

    setSaving(true);
    setErrorText("");

    const { error } = await supabase.from("reviews").insert({
      user_id: userId,
      rating,
      comment: comment.trim() || null,
    });

    setSaving(false);

    if (error) {
      setErrorText(`Review opslaan mislukt: ${error.message}`);
      return;
    }

    setRating(0);
    setComment("");
    onSubmitted();
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setErrorText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">
          Review Achterlaten
        </h2>

        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Beoordeling
          </p>
          <StarRating rating={rating} onChange={setRating} />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Uw ervaring
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Vertel ons over uw ervaring..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-blue-500"
          />
        </div>

        {errorText && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorText}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-500 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? "Versturen..." : "Verstuur Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
