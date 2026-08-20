import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Sparkles, X, Flame, ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface ScrollConversionPopupProps {
  onOrderClick: () => void;
}

export const ScrollConversionPopup: React.FC<ScrollConversionPopupProps> = ({ onOrderClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play pleasant conversion notification chime
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Note 1: Soft high bell (880Hz -> 1046.5Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.08);

      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: Harmonic crystal chime (1318.5Hz -> 1567.98Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.2);

      gain2.gain.setValueAtTime(0.12, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.55);
    } catch {
      // Audio autoplay policy handled silently
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollYRef.current);
      const now = Date.now();

      // Trigger if scrolled slightly (at least 80px from top) and moved noticeably
      if (currentScrollY > 80 && scrollDiff > 25) {
        // Cooldown of 6 seconds before re-showing to avoid spamming
        if (now - cooldownRef.current > 6000) {
          cooldownRef.current = now;
          setIsVisible(true);
          playNotificationSound();

          // Auto disappear after 3.5 seconds (3 to 4 seconds)
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
          hideTimerRef.current = setTimeout(() => {
            setIsVisible(false);
          }, 3500);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [soundEnabled]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const handleCtaClick = () => {
    setIsVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    onOrderClick();
  };

  return (
    <div
      aria-live="polite"
      className={`fixed z-50 transition-all duration-500 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      } left-4 right-4 sm:left-auto sm:right-6 bottom-20 sm:bottom-6 max-w-sm sm:max-w-md`}
    >
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl border-2 border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-500/20 p-3.5 sm:p-4 hover:border-blue-600 transition-colors">
        {/* Animated Background Highlight */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header row with badge & close/sound toggles */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <Flame className="w-3 h-3 text-amber-600 animate-pulse" />
              অফার সীমিত সময়
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              ক্যাশ অন ডেলিভারি
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSoundEnabled(!soundEnabled);
              }}
              title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDismiss}
              title="বন্ধ করুন"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main CTA Button Action */}
        <button
          onClick={handleCtaClick}
          className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-between gap-3 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="block text-sm sm:text-base font-extrabold leading-tight tracking-wide">
                অর্ডার করতে ক্লিক করুন
              </span>
              <span className="block text-[10px] sm:text-[11px] text-blue-100 font-medium">
                ফ্রি ডেলিভারি ও দ্রুত হোম ডেলিভারি
              </span>
            </div>
          </div>

          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* Auto disappear progress indicator */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            লাইভ অর্ডার চলছে
          </span>
          <span className="italic text-[9px] text-slate-400">স্ক্রোল শেষ হলে স্বয়ংক্রিয়ভাবে অদৃশ্য হবে</span>
        </div>
      </div>
    </div>
  );
};
