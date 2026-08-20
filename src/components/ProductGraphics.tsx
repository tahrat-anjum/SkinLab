import React from 'react';

interface BoxMockupProps {
  className?: string;
  variant?: 'hero' | 'sachet' | 'bundle' | 'diagram';
}

export const DrZengBoxMockup: React.FC<BoxMockupProps> = ({ className = 'w-full h-full', variant = 'hero' }) => {
  if (variant === 'sachet') {
    return (
      <div className={`relative flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-white to-sky-100 rounded-2xl border border-sky-100 shadow-sm ${className}`}>
        {/* Sachet Packet SVG */}
        <div className="relative w-64 h-80 bg-white rounded-xl shadow-xl border border-slate-200 p-5 flex flex-col justify-between overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-300">
          {/* Top Notch for tear */}
          <div className="absolute top-0 left-4 w-3 h-2 bg-slate-200 rounded-b-sm" />
          <div className="absolute top-0 right-4 w-3 h-2 bg-slate-200 rounded-b-sm" />
          
          {/* Sachet Header */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 mb-1 text-slate-700 font-serif text-xs font-bold">
              DZ
            </div>
            <h4 className="text-sm font-bold tracking-widest text-slate-800 uppercase font-serif">DOCTOR ZENG</h4>
            <p className="text-[10px] tracking-wider text-slate-500 font-sans font-medium">ARMPIT DEODORANT CREAM</p>
          </div>

          {/* Sachet Center Graphic */}
          <div className="my-2 relative flex items-center justify-center">
            <div className="relative z-10 text-center">
              <span className="text-2xl font-black text-slate-800 tracking-tight font-serif">7-21</span>
              <span className="text-[10px] block font-semibold text-slate-600 uppercase tracking-wider">Days Protection (স্থায়িত্ব ৭-২১ দিন)</span>
            </div>
            <div className="absolute w-28 h-28 rounded-full bg-emerald-50/80 border border-emerald-200 -z-0 animate-pulse" />
          </div>

          {/* Sachet Bottom */}
          <div className="border-t border-slate-100 pt-3 text-center">
            <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold rounded tracking-wider uppercase mb-1">
              Fresh Fragrance
            </span>
            <p className="text-[9px] text-slate-500 leading-tight">Chinese Herbal Extract • Non-Pore Clogging</p>
            <p className="text-[8px] text-slate-400 mt-1 font-mono">Net: 3g Single Use Pack</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'bundle') {
    return (
      <div className={`relative flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50 rounded-2xl border border-sky-100 ${className}`}>
        <div className="relative flex items-center justify-center -space-x-8">
          {/* Box 1 */}
          <div className="w-48 h-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 transform -rotate-6 scale-95 opacity-90">
            <div className="w-6 h-6 rounded-full border border-slate-300 mx-auto text-[9px] flex items-center justify-center font-serif">DZ</div>
            <p className="text-[11px] font-bold text-center mt-1 text-slate-800">DOCTOR ZENG</p>
            <div className="text-center my-6">
              <span className="text-2xl font-serif font-black text-slate-800">7-21</span>
              <span className="text-[8px] block text-slate-500">DAYS AVERAGE</span>
            </div>
          </div>
          {/* Main Box */}
          <div className="w-52 h-72 bg-white rounded-xl shadow-2xl border border-blue-200 p-5 relative z-10">
            <div className="w-7 h-7 rounded-full border border-slate-300 mx-auto text-[10px] flex items-center justify-center font-serif font-bold text-slate-800">DZ</div>
            <p className="text-xs font-black tracking-widest text-center mt-1 text-slate-800">DOCTOR ZENG</p>
            <p className="text-[9px] text-center text-slate-500">ARMPIT DEODORANT</p>
            <div className="text-center my-4">
              <span className="text-3xl font-serif font-black text-slate-900">7-21</span>
              <span className="text-[9px] block font-bold text-slate-600">DAYS FORMULA</span>
            </div>
            <div className="mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-800">14 Sachets Box</span>
            </div>
          </div>
          {/* Box 3 */}
          <div className="w-48 h-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 transform rotate-6 scale-95 opacity-90">
            <div className="w-6 h-6 rounded-full border border-slate-300 mx-auto text-[9px] flex items-center justify-center font-serif">DZ</div>
            <p className="text-[11px] font-bold text-center mt-1 text-slate-800">DOCTOR ZENG</p>
            <div className="text-center my-6">
              <span className="text-2xl font-serif font-black text-slate-800">7-21</span>
              <span className="text-[8px] block text-slate-500">DAYS AVERAGE</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'diagram') {
    return (
      <div className={`relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-sky-100 shadow-sm ${className}`}>
        <div className="w-full max-w-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            চাইনিজ হার্বাল ফর্মুলা মেকানিজম
          </div>
          <div className="space-y-2 text-[11px] text-slate-600">
            <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-100">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>লোমকূপ স্বাভাবিক রেখে ব্যাকটেরিয়ার বৃদ্ধি রোধ করে</span>
            </div>
            <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-100">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>একবার ব্যবহারে একাধিক দিন পর্যন্ত সুগন্ধ ও ফ্রেশনেস</span>
            </div>
            <div className="flex items-start gap-2 bg-white p-2 rounded border border-slate-100">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>সংবেদনশীল ত্বকের জন্য সম্পূর্ণ নিরাপদ ও অ্যালকোহল মুক্ত</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hero Packaging Default (Exact Screenshot 1 representation)
  return (
    <div className={`relative w-full h-full min-h-[340px] flex items-center justify-center p-4 bg-gradient-to-b from-[#eaf4fb] via-[#f4f9fd] to-[#e8f3fb] overflow-hidden rounded-2xl ${className}`}>
      {/* Background Soft Glow & Botanical leaves */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-sky-200/40 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-emerald-100/50 blur-2xl pointer-events-none" />

      {/* Decorative Mint / Herb leaves floating */}
      <div className="absolute top-4 right-8 opacity-70 transform rotate-45 pointer-events-none">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C7 2 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 7 17 2 12 2Z" fill="#86efac" fillOpacity="0.4" />
          <path d="M4 12C9 12 12 9 12 4C12 9 15 12 20 12C15 12 12 15 12 20C12 15 9 12 4 12Z" fill="#15803d" fillOpacity="0.6" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-6 opacity-60 transform -rotate-12 pointer-events-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M21 3C16 3 13 8 13 13C13 18 16 21 21 21" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 21C3 16 8 13 13 13" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Main Presentation Mockup */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm">
        <div className="relative z-20 transform hover:scale-105 transition-transform duration-300 shadow-md">
          <div className="w-64 h-32 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200/90 p-4 shadow-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center text-[8px] font-bold text-slate-700">DZ</div>
                <span className="text-[10px] font-black tracking-widest text-slate-800">DOCTOR ZENG</span>
              </div>
              <p className="text-[8px] tracking-wider text-slate-500 uppercase font-semibold">Armpit Deodorant Cream</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-serif">7-21</span>
                <span className="text-[8px] text-slate-600 font-semibold uppercase">Days (স্থায়িত্ব ৭-২১ দিন)</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-center p-1">
              <span className="text-[7px] font-bold text-emerald-800 leading-tight">CHINESE HERBAL</span>
              <span className="text-[6px] text-emerald-600 uppercase">Natural</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
