"use client";

import { useState } from "react";

function getAge(birthDate: Date, today: Date) {
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += previousMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export default function AgeCalculator() {
  const [birth, setBirth] = useState("");
  const [result, setResult] = useState<ReturnType<typeof getAge> | null>(null);
  const [error, setError] = useState("");

  function calculate() {
    if (!birth) {
      setError("জন্মতারিখ নির্বাচন করুন। / Please select your birth date.");
      setResult(null);
      return;
    }
    const date = new Date(`${birth}T00:00:00`);
    const today = new Date();
    if (Number.isNaN(date.getTime()) || date > today) {
      setError("সঠিক অতীতের তারিখ দিন। / Enter a valid past date.");
      setResult(null);
      return;
    }
    setError("");
    setResult(getAge(date, today));
  }

  return (
    <div>
      <label htmlFor="birth-date" className="block text-sm font-semibold text-zinc-200">
        জন্মতারিখ / Date of birth
      </label>
      <input
        id="birth-date"
        type="date"
        max={new Date().toISOString().slice(0, 10)}
        value={birth}
        onChange={(event) => setBirth(event.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-[#090909] px-4 py-3 text-white outline-none focus:border-[#ff6b00]"
      />
      <button onClick={calculate} className="mt-4 rounded-xl bg-[#ff6b00] px-5 py-3 font-bold text-white transition hover:bg-[#e65f00]">
        বয়স হিসাব করুন / Calculate age
      </button>
      {error && <p role="alert" className="mt-4 text-sm text-rose-400">{error}</p>}
      {result && (
        <div aria-live="polite" className="mt-6 grid grid-cols-3 gap-3">
          {([["বছর", "Years", result.years], ["মাস", "Months", result.months], ["দিন", "Days", result.days]] as const).map(([bn, en, value]) => (
            <div key={en} className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
              <strong className="block text-2xl font-black text-[#ff8a36]">{value}</strong>
              <span className="mt-1 block text-xs text-zinc-400">{bn} / {en}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
