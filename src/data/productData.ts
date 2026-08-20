import { ProductInfo, CustomerReview, GalleryImageItem, UsageStep, BenefitItem, FaqItem, StoreSettings } from '../types';

export const initialImages: GalleryImageItem[] = [
  { id: 'img-1', label: 'অফিশিয়াল বক্স ও স্যাশে প্যাক', variant: 'hero', isCustomUrl: false },
  { id: 'img-2', label: 'হারবাল অ্যাক্টিভ মেকানিজম', variant: 'diagram', isCustomUrl: false },
  { id: 'img-3', label: 'ফুল কোর্স ট্রিটমেন্ট প্যাক', variant: 'bundle', isCustomUrl: false },
  { id: 'img-4', label: 'সিঙ্গেল ইউজ ইজি স্যাশে', variant: 'sachet', isCustomUrl: false },
];

export const defaultSettings: StoreSettings = {
  brandName: 'Dr. Zeng',
  brandLogoUrl: '',
  brandLogoType: 'both',
  navbarLogoHeight: 30,
  navbarTagline: '',
  hotlinePhone: '01712-345678',
  whatsappNumber: '8801712345678',
  deliveryFeeInsideDhaka: 70,
  deliveryFeeOutsideDhaka: 130,
  announcementText: '🔥 সীমিত সময়ের স্পেশাল অফার! ক্যাশ অন ডেলিভারিতে দ্রুত ডেলিভারি',
  countdownHours: 1,
  countdownMinutes: 55,
  isOfferActive: true,
  companyAddress: 'লেভেল ৪, রূপায়ন সেন্টার, গুলশান-২, ঢাকা-১২১২',
  supportEmail: 'support@drzeng-bd.com',
  bkashNumber: '01712345678 (মার্চেন্ট)',
};

export const usageSteps: UsageStep[] = [
  {
    stepNumber: 1,
    title: 'পরিষ্কার ও সম্পূর্ণ শুকানো ত্বক',
    description: 'ব্যবহারের পূর্বে আন্ডারআর্ম ভালো করে পরিষ্কার করে সম্পূর্ণ শুকিয়ে নিন।',
    tip: 'রাতে ঘুমানোর আগে ব্যবহার করলে সবচেয়ে ভালো কার্যকারিতা পাওয়া যায়।',
  },
  {
    stepNumber: 2,
    title: 'নির্দিষ্ট পরিমাণ ক্রিম ব্যবহার',
    description: 'আঙুলে সামান্য পরিমাণ ক্রিম নিয়ে আন্ডারআর্মে আলতোভাবে ম্যাসাজ করে মিশিয়ে নিন।',
    tip: 'অতিরিক্ত ক্রিম ব্যবহারের প্রয়োজন নেই, অল্প পরিমাণেই পুরো এলাকা কভার হয়।',
  },
  {
    stepNumber: 3,
    title: '৮ ঘণ্টা পানি এড়িয়ে চলুন',
    description: 'ক্রিম লাগানোর পর অন্তত ৮ ঘণ্টা ওই স্থানে পানি লাগানো বা ধোয়া থেকে বিরত থাকুন।',
    tip: 'ক্রিমটি ত্বকের গভীরে গিয়ে ঘাম সৃষ্টিকারী ব্যাকটেরিয়া দূর করে।',
  },
];

export const benefitsList: BenefitItem[] = [
  {
    title: '৭ থেকে ২১ দিনের দীর্ঘস্থায়ী সুরক্ষা',
    desc: 'নিয়মিত ব্যবহারে আন্ডারআর্মের দুর্গন্ধ দূর করে দীর্ঘ সময় সতেজ রাখে (স্থায়িত্ব: ৭ থেকে ২১ দিন)।',
    icon: 'ShieldCheck',
  },
  {
    title: 'প্রাকৃতিক হারবাল উপাদান',
    desc: 'চাইনিজ হার্বাল ফর্মুলা, কোন ক্ষতিকারক কেমিক্যাল বা কৃত্রিম অ্যালকোহল নেই।',
    icon: 'Sparkles',
  },
  {
    title: 'লোমকূপ বন্ধ করে না (No Pore Plugging)',
    desc: 'শরীরের স্বাভাবিক ঘাম প্রক্রিয়া ঠিক রেখে ব্যাকটেরিয়াজনিত দুর্গন্ধ দূর করে।',
    icon: 'Droplets',
  },
  {
    title: 'ত্বক উজ্জ্বল ও কোমল করে',
    desc: 'কালো দাগ ও ঘর্ষণজনিত জ্বালাপোড়া কমিয়ে ত্বক মসৃণ করে তোলে।',
    icon: 'HeartHandshake',
  },
];

export const faqs: FaqItem[] = [
  {
    question: 'Dr. Zeng আর্মপিট ডিওডোরেন্ট কীভাবে কাজ করে?',
    answer: 'এটি চাইনিজ হারবাল ও প্রাকৃতিক মিনারেলস দিয়ে তৈরি যা ত্বকের স্বাভাবিক ঘাম প্রক্রিয়া বাধাগ্রস্ত না করে দুর্গন্ধ সৃষ্টিকারী ব্যাকটেরিয়া নির্মূল করে এবং দীর্ঘস্থায়ী ফ্রেশনেস প্রদান করে।',
  },
  {
    question: 'আমি কীভাবে আসল Dr. Zeng চিনব?',
    answer: 'আমাদের প্রতিটি প্যাকেজে সিকিউরিটি সিল ও অফিশিয়াল ব্যাচ নাম্বার থাকে। আমরা ১০০% অরিজিনাল প্রোডাক্ট সরাসরি ইম্পোর্ট করে ক্যাশ অন ডেলিভারিতে সরবরাহ করি।',
  },
  {
    question: 'ডেলিভারি পেতে কতদিন সময় লাগবে?',
    answer: 'ঢাকার ভেতরে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২ থেকে ৩ কার্যদিবসের মধ্যে আপনার ঠিকানায় ক্যাশ অন ডেলিভারিতে পৌঁছে দেওয়া হবে।',
  },
  {
    question: 'পণ্যটি হাতে পাওয়ার পর কি মূল্য পরিশোধ করা যাবে?',
    answer: 'হ্যাঁ, অবশ্যই! ডেলিভারি ম্যানের কাছ থেকে প্রোডাক্টটি চেক করে ক্যাশ অন ডেলিভারি (COD) এর মাধ্যমে মূল্য পরিশোধ করতে পারবেন।',
  },
];

export const productData: ProductInfo = {
  id: 'dr-zeng-armpit-cream',
  name: 'Dr. Zeng - Armpit Deodorant',
  bengaliName: 'ডক্টর জেন - আর্মপিট ডিওডোরেন্ট ক্রিম',
  subtitle: '7-21 Days Average Easier & Healthier - Fresh Fragrance Herbal Care (স্থায়িত্ব: ৭ থেকে ২১ দিন)',
  rating: 5.0,
  reviewCount: 48,
  inStock: true,
  stockCount: 142,
  sku: 'DZ-21D-CREAM',
  origin: 'Guangzhou Herbal Wellness Lab',
  packages: [
    {
      id: 'pack-14-days',
      durationDays: 14,
      title: '14 Days',
      bengaliTitle: '১৪ দিনের প্যাক',
      originalPrice: 1500,
      discountPrice: 1250,
      savings: 250,
      badgeText: 'সেভ ২৫০৳',
      sachetsCount: 7,
      isPopular: false,
    },
    {
      id: 'pack-28-days',
      durationDays: 28,
      title: '28 Days',
      bengaliTitle: '২৮ দিনের প্যাক (সবচেয়ে জনপ্রিয়)',
      originalPrice: 2500,
      discountPrice: 2300,
      savings: 700,
      badgeText: 'সেভ ৭০০৳',
      sachetsCount: 14,
      isPopular: true,
    },
    {
      id: 'pack-42-days',
      durationDays: 42,
      title: '42 Days Complete Course',
      bengaliTitle: '৪২ দিনের ফুল কোর্স (সর্বোচ্চ সঞ্চয়)',
      originalPrice: 3800,
      discountPrice: 3200,
      savings: 1200,
      badgeText: 'সেভ ১২০০৳',
      sachetsCount: 21,
      isPopular: false,
    },
  ],
  images: initialImages,
  usageSteps,
  benefits: benefitsList,
  faqs,
  settings: defaultSettings,
};

export const initialReviews: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Raflul Islam',
    rating: 5,
    date: '১৫/৮/২০২৩',
    comment: 'অসাধারণ প্রোডাক্ট। এক রাতের ব্যবহারেই অনেকদিন সতেজ ছিলাম, দুর্গন্ধের সমস্যা নেই।',
    isVerified: true,
    packagePurchased: '28 Days Pack',
    city: 'ঢাকা',
    createdAt: '2023-08-15T10:30:00Z',
  },
  {
    id: 'rev-2',
    author: 'Tanvir Hossain',
    rating: 5,
    date: '০৩/০২/২০২৪',
    comment: 'প্রথমে বিশ্বাস হয়নি, কিন্তু ব্যবহারের ৩য় দিন থেকেই ঘামের তীব্র গন্ধ একদম বন্ধ হয়ে গেছে। কোন এলার্জি বা চুলকানি হয়নি। ১০০% কার্যকরী!',
    isVerified: true,
    packagePurchased: '28 Days Pack',
    city: 'চট্টগ্রাম',
    createdAt: '2024-02-03T14:20:00Z',
  },
  {
    id: 'rev-3',
    author: 'Nusrat Jahan',
    rating: 5,
    date: '১৯/০৫/২০২৪',
    comment: 'অনেক ডিওডোরেন্ট ব্যবহার করেছি, কিন্তু Dr. Zeng এর মতো স্থায়ী ফলাফল কোথাও পাইনি। ডেলিভারিও মাত্র ২ দিনে পেয়েছি। ধন্যবাদ সেলারকে।',
    isVerified: true,
    packagePurchased: '14 Days Pack',
    city: 'সিলেট',
    createdAt: '2024-05-19T09:15:00Z',
  },
  {
    id: 'rev-4',
    author: 'Kamrul Hasan',
    rating: 5,
    date: '১২/১১/২০২৪',
    comment: 'অফিসে সারাদিন ফরমাল শার্ট পরে থাকতে হয়, ঘামের দুর্গন্ধের কারণে অস্বস্তি লাগত। এখন পুরোপুরি কনফিডেন্ট। আসল প্রোডাক্ট দেওয়ার জন্য ধন্যবাদ।',
    isVerified: true,
    packagePurchased: '42 Days Complete Course',
    city: 'রাজশাহী',
    createdAt: '2024-11-12T16:45:00Z',
  },
];
