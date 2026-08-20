import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck } from 'lucide-react';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection, onOpenTracking, onOpenAdmin }) => {
  return (
    <footer className="bg-[#0e2a47] text-slate-300 pt-12 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Brand & Slogan */}
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mb-1">
            Dr. Zeng
          </h2>
          <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-lg">
            প্রিমিয়াম পার্সোনাল কেয়ার — সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-700/60">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              কুইক লিংক
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onScrollToSection('package-selector')}
                  className="hover:text-white transition-colors"
                >
                  শপ / প্যাকেজ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('how-to-use')}
                  className="hover:text-white transition-colors"
                >
                  ব্যবহারের নিয়ম
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('customer-reviews')}
                  className="hover:text-white transition-colors"
                >
                  গ্রাহকদের রিভিউ
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTracking}
                  className="text-sky-300 font-bold hover:underline"
                >
                  অর্ডার ট্র্যাক করুন
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              কাস্টমার সাপোর্ট
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>+880 1712-345678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>support@drzeng.bd</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>গুলশান-২, ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              নিরাপদ কেনাকাটা
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>১০০% আসল প্রোডাক্টের নিশ্চয়তা</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Truck className="w-4 h-4 text-sky-400" />
                <span>হোম ডেলিভারিতে মূল্য পরিশোধ</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                >
                  অ্যাডমিন ড্যাশবোর্ড
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Dr. Zeng Bangladesh. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-[11px] text-slate-400">
            অফিশিয়াল অনুমোদিত ডিস্ট্রিবিউটর
          </p>
        </div>

      </div>
    </footer>
  );
};
