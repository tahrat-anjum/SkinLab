import React, { useState, useRef } from 'react';
import { PackageOption, Order } from '../types';
import { ShoppingBag, ShieldCheck, Truck, Check, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackInitiateCheckout, trackPurchase, getMetaCookies, generateEventId } from '../utils/metaPixel';

interface OrderFormProps {
  selectedPackage: PackageOption;
  quantity: number;
  onOrderSuccess: (order: Order) => void;
  deliveryFeeInsideDhaka?: number;
  deliveryFeeOutsideDhaka?: number;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  selectedPackage,
  quantity,
  onOrderSuccess,
  deliveryFeeInsideDhaka = 70,
  deliveryFeeOutsideDhaka = 130,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const hasInitiatedCheckoutRef = useRef(false);

  const deliveryFee = deliveryArea === 'inside_dhaka' ? deliveryFeeInsideDhaka : deliveryFeeOutsideDhaka;
  const subtotal = selectedPackage.discountPrice * quantity;
  const totalAmount = subtotal + deliveryFee;

  const handleFormInteraction = () => {
    if (!hasInitiatedCheckoutRef.current) {
      hasInitiatedCheckoutRef.current = true;
      trackInitiateCheckout(selectedPackage, quantity, totalAmount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('দয়া করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMessage('দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('দয়া করে আপনার সম্পূর্ণ ঠিকানা বিস্তারিত লিখুন যাতে কুরিয়ার সহজে পৌঁছাতে পারে।');
      return;
    }

    setIsSubmitting(true);

    // Prepare deduplicated eventId and Meta cookies for Conversion API & Pixel
    const metaEventId = generateEventId('ord');
    const { fbp, fbc } = getMetaCookies();

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phoneNumber: cleanPhone,
          address: address.trim(),
          district: deliveryArea === 'inside_dhaka' ? 'ঢাকা' : district,
          deliveryArea,
          packageId: selectedPackage.id,
          quantity,
          notes: notes.trim(),
          eventId: metaEventId,
          fbp,
          fbc,
          eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Fire browser Meta Pixel Purchase event with identical eventID for deduplication
        try {
          trackPurchase(data.data, metaEventId);
        } catch (pxErr) {
          console.warn('[Meta Pixel] Error firing Purchase event:', pxErr);
        }

        // Fire celebration confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // fallback
        }

        onOrderSuccess(data.data);
      } else {
        setErrorMessage(data.message || 'অর্ডার করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMessage('সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order-form-section" className="my-6 pt-2">
      {/* Big Call-to-Action Order Button */}
      <div className="mb-4">
        <a
          href="#direct-checkout-form"
          onClick={handleFormInteraction}
          className="w-full py-3 px-5 rounded-xl bg-[#1a73e8] hover:bg-blue-600 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all text-center cursor-pointer"
        >
          <ShoppingBag className="w-4.5 h-4.5" />
          অর্ডার করতে নিচে ফর্মটি পূরণ করুন
        </a>
      </div>

      {/* Embedded Checkout Card */}
      <div
        id="direct-checkout-form"
        className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-blue-200 shadow-lg relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wide">
              ক্যাশ অন ডেলিভারি
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              অর্ডার কনফার্মেশন ফর্ম
            </h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} onFocusCapture={handleFormInteraction} className="space-y-3">
          
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার নাম লিখুন *
            </label>
            <input
              id="customer-name-input"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="সম্পূর্ণ নাম লিখুন"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মোবাইল নাম্বার * (১১ ডিজিট)
            </label>
            <input
              id="customer-phone-input"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            />
          </div>

          {/* Delivery Area Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ডেলিভারি এলাকা নির্বাচন করুন *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                onClick={() => {
                  setDeliveryArea('inside_dhaka');
                  setDistrict('ঢাকা');
                }}
                className={`cursor-pointer flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${
                  deliveryArea === 'inside_dhaka'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="text-xs">
                  <p className="font-bold text-xs">ঢাকার ভেতরে</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">চার্জ: ৳{deliveryFeeInsideDhaka}</p>
                </div>
                {deliveryArea === 'inside_dhaka' && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
              </label>

              <label
                onClick={() => setDeliveryArea('outside_dhaka')}
                className={`cursor-pointer flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${
                  deliveryArea === 'outside_dhaka'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="text-xs">
                  <p className="font-bold text-xs">ঢাকার বাইরে</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-normal">চার্জ: ৳{deliveryFeeOutsideDhaka}</p>
                </div>
                {deliveryArea === 'outside_dhaka' && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
              </label>
            </div>
          </div>

          {/* District if outside Dhaka */}
          {deliveryArea === 'outside_dhaka' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার জেলা / শহর *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="যেমন: চট্টগ্রাম, সিলেট, রাজশাহী, খুলনা ইত্যাদি"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          {/* Detailed Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা) *
            </label>
            <textarea
              id="customer-address-input"
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="যেমন: বাসা # ১২, রোড # ৪, ব্লক # সি, বনানী, ঢাকা"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Order Summary Receipt */}
          <div className="bg-sky-50/70 rounded-xl p-3.5 border border-sky-100 space-y-1.5 mt-3">
            <div className="flex justify-between text-xs text-slate-600">
              <span>নির্বাচিত প্যাকেজ:</span>
              <span className="font-bold text-slate-900">{selectedPackage.title} ({quantity} টি)</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>পণ্যের মূল্য:</span>
              <span className="font-bold text-slate-900">{subtotal.toLocaleString('en-US')} ৳</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-slate-900">{deliveryFee} ৳</span>
            </div>
            <div className="pt-2 border-t border-sky-200 flex justify-between text-xs sm:text-sm font-black text-blue-950">
              <span>সর্বমোট প্রদেয় মূল্য:</span>
              <span className="text-[#1a73e8] text-base font-extrabold">{totalAmount.toLocaleString('en-US')} ৳</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-800 flex items-center gap-1 font-semibold pt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করবেন।
            </p>
          </div>

          {/* Submit Order Button */}
          <button
            id="submit-order-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-xl bg-[#1a73e8] hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                অর্ডার প্রক্রিয়াধীন...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5" />
                অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)
              </span>
            )}
          </button>

          <p className="text-[10px] sm:text-[11px] text-center text-slate-500">
            অর্ডার করার পর আমাদের প্রতিনিধি আপনাকে কল করে ডেলিভারি নিশ্চিত করবেন।
          </p>
        </form>
      </div>
    </section>
  );
};
