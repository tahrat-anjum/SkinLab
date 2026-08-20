import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, ShoppingBag, ArrowUp, PhoneCall, Sparkles, CheckCircle2 } from 'lucide-react';
import { Header } from './components/Header';
import { ImageGallery } from './components/ImageGallery';
import { OfferCountdown } from './components/OfferCountdown';
import { PackageSelector } from './components/PackageSelector';
import { TrustBadges } from './components/TrustBadges';
import { HowToUseSection } from './components/HowToUseSection';
import { ProductBenefits } from './components/ProductBenefits';
import { CustomerReviews } from './components/CustomerReviews';
import { OrderForm } from './components/OrderForm';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { SearchModal } from './components/SearchModal';
import { LiveSalesNotification } from './components/LiveSalesNotification';
import { ScrollConversionPopup } from './components/ScrollConversionPopup';

import { productData as defaultProductData, initialReviews } from './data/productData';
import { PackageOption, Order, CustomerReview, ProductInfo } from './types';
import { initMetaPixel, trackPageView, trackViewContent } from './utils/metaPixel';

export default function App() {
  const [product, setProduct] = useState<ProductInfo>(defaultProductData);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption>(defaultProductData.packages[1] || defaultProductData.packages[0]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<CustomerReview[]>(initialReviews);

  // Modals and Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInitialQuery, setTrackingInitialQuery] = useState('');
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  // Fetch product data & reviews from backend on load
  useEffect(() => {
    // Fetch live product config
    fetch('/api/product')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProduct(data.data);
          // Auto sync selected package if exists
          if (data.data.packages && data.data.packages.length > 0) {
            setSelectedPackage((prev) => {
              const matched = data.data.packages.find((p: PackageOption) => p.id === prev.id);
              return matched || data.data.packages[0];
            });
          }
        }
      })
      .catch((e) => console.log('Using local productData fallback', e));

    // Fetch live reviews
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setReviews(data.data);
        }
      })
      .catch((e) => console.log('Using local reviews fallback', e));
  }, []);

  // Initialize Meta Pixel & Track PageView / ViewContent
  useEffect(() => {
    const pixelId = product?.settings?.metaPixelId;
    const isPixelEnabled = product?.settings?.metaPixelEnabled !== false;

    if (pixelId && isPixelEnabled) {
      initMetaPixel(pixelId);

      if (product?.settings?.metaTrackPageView !== false) {
        trackPageView();
      }

      if (product?.settings?.metaTrackViewContent !== false && product) {
        trackViewContent(product, selectedPackage);
      }
    }
  }, [product?.settings?.metaPixelId, product?.settings?.metaPixelEnabled]);

  const handleAddReview = async (newRev: { author: string; rating: number; comment: string; city: string }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRev,
          packagePurchased: `${selectedPackage.title} (${selectedPackage.bengaliTitle})`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviews((prev) => [data.data, ...prev]);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to submit review', e);
      return false;
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setLatestOrder(order);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrackFromSuccess = (orderNumber: string) => {
    setLatestOrder(null);
    setTrackingInitialQuery(orderNumber);
    setIsTrackingOpen(true);
  };

  const handleProductUpdated = (updated: ProductInfo) => {
    setProduct(updated);
    if (updated.packages && updated.packages.length > 0) {
      const stillExists = updated.packages.find((p) => p.id === selectedPackage.id);
      if (!stillExists) {
        setSelectedPackage(updated.packages[0]);
      } else {
        setSelectedPackage(stillExists);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Announcement Bar if enabled in store settings */}
      {product.settings?.announcementText && (
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-center py-1.5 px-3 text-[11px] sm:text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{product.settings.announcementText}</span>
        </div>
      )}

      {/* Top Header matching Screenshot 1 & 2 */}
      <Header
        cartCount={quantity}
        brandName={product.settings?.brandName || 'Dr. Zeng'}
        brandLogoUrl={product.settings?.brandLogoUrl}
        brandLogoType={product.settings?.brandLogoType || 'both'}
        navbarLogoHeight={product.settings?.navbarLogoHeight || 28}
        helplinePhone={product.settings?.helplinePhone || product.settings?.hotlinePhone}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTracking={() => {
          setTrackingInitialQuery('');
          setIsTrackingOpen(true);
        }}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Single-View Product Page Container */}
      <main className="max-w-xl mx-auto px-3.5 sm:px-5 pt-3 pb-24 space-y-5">
        
        {/* Top Product Gallery with dynamic images from admin */}
        <ImageGallery images={product.images} />

        {/* Urgency Countdown Banner (Screenshot 1) */}
        <div className="pt-1">
          <OfferCountdown />
        </div>

        {/* Product Title & Rating (Screenshot 1 & 2) */}
        <div className="space-y-1">
          {/* 5-star Rating */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">
              5.0 ({reviews.length} Reviews)
            </span>
            {product.inStock ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                ইন স্টক ({product.stockCount} টি অবশিষ্ট)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                স্টক আউট
              </span>
            )}
          </div>

          {/* Product Headline */}
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {product.name}
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {product.subtitle}
          </p>
        </div>

        {/* Package Selector Cards (Screenshots 1 & 2) */}
        <PackageSelector
          packages={product.packages}
          selectedPackage={selectedPackage}
          onSelectPackage={setSelectedPackage}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />

        {/* Call To Action Button (Screenshot 2) */}
        <div>
          <button
            id="main-order-now-btn"
            onClick={() => handleScrollToSection('direct-checkout-form')}
            className="w-full py-3.5 px-5 rounded-xl bg-[#1a73e8] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all text-center cursor-pointer"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            অর্ডার করতে ক্লিক করুন
          </button>
        </div>

        {/* Trust Badges (Screenshot 2) */}
        <TrustBadges />

        {/* How to Use Section (Screenshot 4) */}
        <HowToUseSection />

        {/* Product Benefits, Comparison & FAQ */}
        <ProductBenefits />

        {/* Customer Reviews Section (Screenshot 3) */}
        <CustomerReviews
          reviews={reviews}
          onAddReview={handleAddReview}
        />

        {/* Instant Cash on Delivery Checkout Form */}
        <OrderForm
          selectedPackage={selectedPackage}
          quantity={quantity}
          onOrderSuccess={handleOrderSuccess}
          deliveryFeeInsideDhaka={product.settings?.deliveryFeeInsideDhaka}
          deliveryFeeOutsideDhaka={product.settings?.deliveryFeeOutsideDhaka}
        />

      </main>

      {/* Dark Navy Footer (Screenshot 3) */}
      <Footer
        onScrollToSection={handleScrollToSection}
        onOpenTracking={() => {
          setTrackingInitialQuery('');
          setIsTrackingOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Floating Bottom Sticky Bar on Mobile for Instant Ordering */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-xl sm:hidden flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 font-bold block truncate max-w-[120px]">
            {selectedPackage.title}
          </span>
          <span className="text-sm font-black text-[#1a73e8]">
            {(selectedPackage.discountPrice * quantity).toLocaleString('en-US')} ৳
          </span>
        </div>
        <button
          onClick={() => handleScrollToSection('direct-checkout-form')}
          className="flex-1 py-2.5 px-3 rounded-lg bg-[#1a73e8] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          অর্ডার করুন
        </button>
      </div>

      {/* Real-time Sales Social Proof Toast */}
      <LiveSalesNotification />

      {/* Dynamic Scroll Conversion Popup with Notification Sound */}
      <ScrollConversionPopup
        onOrderClick={() => handleScrollToSection('direct-checkout-form')}
      />

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        selectedPackage={selectedPackage}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onProceedToCheckout={() => handleScrollToSection('direct-checkout-form')}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPackage={(pkgId) => {
          const pkg = product.packages.find((p) => p.id === pkgId);
          if (pkg) setSelectedPackage(pkg);
          handleScrollToSection('package-selector');
        }}
        onOpenTracking={(q) => {
          setTrackingInitialQuery(q || '');
          setIsTrackingOpen(true);
        }}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialQuery={trackingInitialQuery}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductUpdated={handleProductUpdated}
      />

      <OrderSuccessModal
        order={latestOrder}
        onClose={() => setLatestOrder(null)}
        onTrackOrder={handleTrackFromSuccess}
      />

    </div>
  );
}
