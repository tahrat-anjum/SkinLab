import React from 'react';
import { usageSteps } from '../data/productData';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const HowToUseSection: React.FC = () => {
  return (
    <section id="how-to-use" className="my-6 pt-2 pb-4">
      {/* Header section */}
      <div className="mb-4">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-blue-600 uppercase block mb-0.5">
          ব্যবহারের নিয়ম
        </span>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          সহজ ৩টি ধাপে ব্যবহার করুন
        </h2>
      </div>

      {/* 3 Step Cards */}
      <div className="space-y-2.5">
        {usageSteps.map((item) => (
          <div
            key={item.stepNumber}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all"
          >
            {/* Dark Navy Numbered Circle */}
            <div className="shrink-0 w-7 h-7 rounded-full bg-[#0e2a47] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {item.stepNumber}
            </div>

            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 leading-snug">
                {item.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>
              {item.tip && (
                <div className="mt-1.5 text-[10px] sm:text-[11px] text-blue-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                  <span>{item.tip}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
