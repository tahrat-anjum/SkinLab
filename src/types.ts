export interface PackageOption {
  id: string;
  durationDays: number;
  title: string;
  bengaliTitle: string;
  originalPrice: number;
  discountPrice: number;
  savings: number;
  isPopular?: boolean;
  badgeText?: string;
  sachetsCount: number;
}

export interface GalleryImageItem {
  id: string;
  url?: string;
  label: string;
  variant?: 'hero' | 'diagram' | 'bundle' | 'sachet';
  isCustomUrl?: boolean;
}

export interface UsageStep {
  stepNumber: number;
  title: string;
  description: string;
  tip: string;
}

export interface BenefitItem {
  title: string;
  desc: string;
  icon: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MetaPixelConfig {
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
  isPixelEnabled?: boolean;
  isCapiEnabled?: boolean;
  trackPageView?: boolean;
  trackViewContent?: boolean;
  trackAddToCart?: boolean;
  trackInitiateCheckout?: boolean;
  trackPurchase?: boolean;
}

export interface MetaActivityLog {
  id: string;
  eventName: string;
  source: 'browser_pixel' | 'server_capi';
  eventId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  value?: number;
  currency?: string;
  details?: string;
  responseMessage?: string;
}

export interface StoreSettings {
  brandName?: string;
  brandLogoUrl?: string;
  brandLogoType?: 'both' | 'logo_only' | 'text_only';
  navbarLogoHeight?: number;
  navbarTagline?: string;
  hotlinePhone: string;
  whatsappNumber: string;
  deliveryFeeInsideDhaka: number;
  deliveryFeeOutsideDhaka: number;
  announcementText: string;
  countdownHours: number;
  countdownMinutes: number;
  isOfferActive: boolean;
  companyAddress: string;
  supportEmail: string;
  bkashNumber: string;
  helplinePhone?: string;
  // Meta Ads / Pixel / CAPI configuration
  metaPixelId?: string;
  metaConversionApiToken?: string;
  metaTestEventCode?: string;
  metaPixelEnabled?: boolean;
  metaCapiEnabled?: boolean;
  metaTrackPageView?: boolean;
  metaTrackViewContent?: boolean;
  metaTrackAddToCart?: boolean;
  metaTrackInitiateCheckout?: boolean;
  metaTrackPurchase?: boolean;
}

export interface ProductInfo {
  id: string;
  name: string;
  bengaliName: string;
  subtitle: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  sku: string;
  origin: string;
  packages: PackageOption[];
  images: GalleryImageItem[];
  usageSteps: UsageStep[];
  benefits: BenefitItem[];
  faqs: FaqItem[];
  settings: StoreSettings;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
  packagePurchased?: string;
  city?: string;
  createdAt: string;
}

export interface OrderItem {
  packageId: string;
  packageName: string;
  durationDays: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  deliveryArea: 'inside_dhaka' | 'outside_dhaka';
  deliveryFee: number;
  paymentMethod: 'cash_on_delivery' | 'bkash_advance';
  item: OrderItem;
  subtotal: number;
  totalAmount: number;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  trackingHistory: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
}

export interface CreateOrderPayload {
  customerName: string;
  phoneNumber: string;
  address: string;
  district?: string;
  deliveryArea: 'inside_dhaka' | 'outside_dhaka';
  packageId: string;
  quantity: number;
  notes?: string;
}

export interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}
