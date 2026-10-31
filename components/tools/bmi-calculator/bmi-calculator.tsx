"use client";

import { useState } from "react";

function getCategory(bmi: number) {
  if (bmi < 18.5) return { bn: "ওজন কম", en: "Underweight" };
  if (bmi < 25) return { bn: "স্বাভাবিক", en: "Normal range" };
  if (bmi < 30) return { bn: "ওজন বেশি", en: "Overweight" };
  return { bn: "স্থূলতা", en: "Obesity" };
}

export default function BmiCalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    const heightCm = Number(height);
    const weightKg = Number(weight);
    if (!height || !weight || heightCm <= 0 || weightKg <= 0 || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
      setError("সঠিক উচ্চতা ও ওজন লিখুন। / Enter valid height and weight.");
      setBmi(null);
      return;
    }
    setError("");
    setBmi(weightKg / ((heightCm / 100) ** 2));
  }

  const category = bmi === null ? null : getCategory(bmi);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="height" className="block text-sm font-semibold text-zinc-200">উচ্চতা (সেমি) / Height (cm)</label>
          <input id="height" type="number" min="1" step="0.1" inputMode="decimal" value={height} onChange={(event) => setHeight(event.target.value)} placeholder="যেমন 170" className="mt-2 w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3 text-white outline-none focus:border-[#ff6b00]" />
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-semibold text-zinc-200">ওজন (কেজি) / Weight (kg)</label>
          <input id="weight" type="number" min="1" step="0.1" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="যেমন 65" className="mt-2 w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3 text-white outline-none focus:border-[#ff6b00]" />
        </div>
      </div>
      <button onClick={calculate} className="mt-4 rounded-xl bg-[#ff6b00] px-5 py-3 font-bold text-white transition hover:bg-[#e65f00]">
        BMI হিসাব করুন / Calculate BMI
      </button>
      {error && <p role="alert" className="mt-4 text-sm text-rose-400">{error}</p>}
      {bmi !== null && category && (
        <div aria-live="polite" className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
          <p className="text-sm text-zinc-400">আপনার BMI / Your BMI</p>
          <strong className="mt-1 block text-4xl font-black text-[#ff8a36]">{bmi.toFixed(1)}</strong>
          <p className="mt-2 font-semibold">{category.bn} · {category.en}</p>
          <p className="mt-3 text-xs leading-5 text-zinc-500">BMI একটি সাধারণ screening measure; এটি একা স্বাস্থ্য নির্ণয় করে না।</p>
        </div>
      )}
    </div>
  );
}
