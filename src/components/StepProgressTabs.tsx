import React, { useState } from "react";

export interface Step {
  title: string;
  component: React.ReactNode;
}

interface Props {
  steps: Step[];
  onFinish?: () => void;
}

export default function StepProgressTabs({ steps, onFinish }: Props) {
  const [active, setActive] = useState(0);

  const next = () => setActive((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setActive((s) => Math.max(s - 1, 0));

  return (
    <section className="bg-white w-[80%] mx-auto mt-8 p-6 rounded-2xl shadow-md relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-blue-200">
        <div
          className="h-2 bg-blue-500 transition-all duration-500"
          style={{ width: `${((active + 0.5) / steps.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex gap-2.5 justify-between mb-8 mt-6">
        {steps.map((s, i) => (
          <div
            key={i}
            onClick={() => setActive(i)}
            className={`flex-1 text-center font-semibold text-sm cursor-pointer rounded-md py-2 transition-all ${
              i === active
                ? "text-blue-600 bg-blue-50"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-500"
            }`}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* ADIM İÇERİĞİ */}
      <div className="min-h-[180px] border-t border-gray-100 pt-6">
        {steps[active].component}
      </div>

      {/* GEZİNME */}
      <div className="flex justify-between mt-6 border-t border-gray-300 pt-4">
        <button
          onClick={prev}
          disabled={active === 0}
          className={`px-4 py-2 rounded-lg ${
            active === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
          }`}
        >
          Geri
        </button>

        {active < steps.length - 1 ? (
          <button
            onClick={next}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
          >
            İleri
          </button>
        ) : (
          <button
            onClick={() => onFinish && onFinish()}
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer"
          >
            Bitir
          </button>
        )}
      </div>
    </section>
  );
}
