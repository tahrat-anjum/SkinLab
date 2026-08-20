import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, X, ShieldCheck, Truck, Package, HelpCircle, PhoneCall, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
  onScrollToSection: (sectionId: string) => void;
  brandName?: string;
  brandLogoUrl?: string;
  brandLogoType?: 'both' | 'logo_only' | 'text_only';
  navbarLogoHeight?: number;
  helplinePhone?: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenAdmin,
  onOpenTracking,
  onScrollToSection,
  brandName = 'Dr. Zeng',
  brandLogoUrl = '',
  brandLogoType = 'both',
  navbarLogoHeight = 28,
  helplinePhone = '+880 1712-345678',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    onScrollToSection(sectionId);
  };

  const showLogoImage = Boolean(brandLogoUrl && brandLogoType !== 'text_only');
  const showBrandText = Boolean(brandLogoType !== 'logo_only' || !brandLogoUrl);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-xl mx-auto px-3 sm:px-4 h-11 sm:h-12 flex items-center justify-between">
        
        {/* Left: Hamburger Menu */}
        <div className="flex items-center gap-1">
          <button
            id="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Center: Brand Logo & Text */}
        <div className="flex items-center justify-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group transition-transform active:scale-98"
          >
            {showLogoImage && (
              <img
                src={brandLogoUrl}
                alt={brandName}
                style={{ maxHeight: `${Math.min(Math.max(navbarLogoHeight || 26, 18), 38)}px` }}
                className="w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            {showBrandText && (
              <span className="text-lg sm:text-xl font-extrabold text-blue-950 tracking-tight">
                {brandName}
              </span>
            )}
          </a>
        </div>

        {/* Right: Search & Shopping Bag */}
        <div className="flex items-center gap-1">
          <button
            id="header-search-button"
            onClick={onOpenSearch}
            aria-label="Search"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            id="header-cart-button"
            onClick={onOpenCart}
            aria-label="View Cart"
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#1a73e8] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {showLogoImage && (
                    <img
                      src={brandLogoUrl}
                      alt={brandName}
                      className="max-h-7 w-auto object-contain"
                    />
                  )}
                  <div className="text-xl font-black text-blue-950 font-serif">{brandName}</div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-6 space-y-1">
                <button
                  onClick={() => handleNavClick('package-selector')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-blue-600 transition-colors"
                >
                  <Package className="w-4 h-4 text-blue-600" />
                  প্যাকেজ ও অফার
                </button>
                <button
                  onClick={() => handleNavClick('order-form-section')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-blue-600 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  অর্ডার করুন (ক্যাশ অন ডেলিভারি)
                </button>
                <button
                  onClick={() => handleNavClick('how-to-use')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-blue-600 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ব্যবহারের নিয়ম (৩টি ধাপ)
                </button>
                <button
                  onClick={() => handleNavClick('customer-reviews')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-blue-600 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  গ্রাহকদের রিভিউ
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenTracking();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-blue-600 transition-colors"
                >
                  <Truck className="w-4 h-4 text-indigo-600" />
                  অর্ডার ট্র্যাকিং
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-800 hover:bg-sky-50 hover:text-blue-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-600" />
                  অ্যাডমিন প্যানেল (ম্যানেজমেন্ট)
                </button>
              </nav>
            </div>

            {/* Bottom Support Info */}
            <div className="pt-5 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-5 rounded-b-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">হটলাইন হেল্পলাইন (সকাল ৯টা - রাত ১০টা)</p>
                  <a href={`tel:${helplinePhone}`} className="text-xs font-bold text-slate-900 hover:text-blue-600">
                    {helplinePhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
