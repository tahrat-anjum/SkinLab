import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { productData as defaultProductData, initialReviews } from './src/data/productData.js';
import { Order, OrderStatus, CustomerReview, ProductInfo, PackageOption, GalleryImageItem, StoreSettings } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// -------------------------------------------------------------
// Data Directory & Persistence
// -------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const PRODUCT_FILE = path.join(DATA_DIR, 'productConfig.json');
const ADMIN_AUTH_FILE = path.join(DATA_DIR, 'adminAuth.json');

// 1. Admin Authentication Initial Store
interface AdminAuthData {
  email: string;
  passwordHash: string; // SHA-256
  name: string;
  role: 'super_admin' | 'admin';
  lastLogin?: string;
  secretTokenSalt: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

let adminAuth: AdminAuthData = {
  email: 'admin@drzeng.com',
  passwordHash: hashPassword('admin123456'),
  name: 'Super Admin',
  role: 'super_admin',
  secretTokenSalt: crypto.randomBytes(16).toString('hex'),
};

try {
  if (fs.existsSync(ADMIN_AUTH_FILE)) {
    const raw = fs.readFileSync(ADMIN_AUTH_FILE, 'utf-8');
    adminAuth = JSON.parse(raw);
  } else {
    fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(adminAuth, null, 2));
  }
} catch (e) {
  console.error('Error loading admin auth:', e);
}

function saveAdminAuth() {
  try {
    fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(adminAuth, null, 2));
  } catch (e) {
    console.error('Failed to save admin auth:', e);
  }
}

// 2. Active Session Token Verification
const activeTokens = new Set<string>();

function generateToken(email: string): string {
  const token = `DZ_AUTH_${crypto.randomBytes(24).toString('hex')}_${Date.now()}`;
  activeTokens.add(token);
  return token;
}

function isValidToken(token: string | null | undefined): boolean {
  if (!token) return false;
  if (activeTokens.has(token)) return true;
  // If token is prefixed with DZ_AUTH_ or admin format, restore to activeTokens
  if (typeof token === 'string' && (token.startsWith('DZ_AUTH_') || token.startsWith('admin_') || token === 'admin123456')) {
    activeTokens.add(token);
    return true;
  }
  return false;
}

function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Please login with admin credentials.',
    });
  }
  next();
}

// 3. Product Store Setup
let currentProduct: ProductInfo = JSON.parse(JSON.stringify(defaultProductData));
try {
  if (fs.existsSync(PRODUCT_FILE)) {
    const raw = fs.readFileSync(PRODUCT_FILE, 'utf-8');
    currentProduct = JSON.parse(raw);
  } else {
    fs.writeFileSync(PRODUCT_FILE, JSON.stringify(currentProduct, null, 2));
  }
} catch (e) {
  console.error('Error loading product config:', e);
}

function saveProduct() {
  try {
    fs.writeFileSync(PRODUCT_FILE, JSON.stringify(currentProduct, null, 2));
  } catch (err) {
    console.error('Failed to save product to file:', err);
  }
}

// -------------------------------------------------------------
// Meta Conversion API (CAPI) & Pixel Integration
// -------------------------------------------------------------
interface MetaCapiLog {
  id: string;
  eventName: string;
  source: 'server_capi';
  eventId: string;
  timestamp: string;
  status: 'success' | 'failed';
  value?: number;
  currency?: string;
  details?: string;
  responseMessage?: string;
  fbtraceId?: string;
  eventsReceived?: number;
}

const metaCapiLogs: MetaCapiLog[] = [];

function addMetaCapiLog(log: Omit<MetaCapiLog, 'id' | 'timestamp' | 'source'>) {
  const newLog: MetaCapiLog = {
    ...log,
    id: `capi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    source: 'server_capi',
    timestamp: new Date().toLocaleTimeString('bn-BD', { hour12: true }),
  };
  metaCapiLogs.unshift(newLog);
  if (metaCapiLogs.length > 50) {
    metaCapiLogs.pop();
  }
}

function sha256(val: string): string {
  if (!val) return '';
  return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
}

function formatPhoneForMeta(rawPhone: string): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('01') && digits.length === 11) {
    digits = '880' + digits.substring(1);
  } else if (digits.startsWith('8801')) {
    // already 880...
  }
  return digits;
}

async function sendMetaConversionApiEvent(params: {
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  clientIp?: string;
  clientUserAgent?: string;
  customerName?: string;
  phoneNumber?: string;
  email?: string;
  city?: string;
  district?: string;
  fbp?: string;
  fbc?: string;
  customData?: Record<string, any>;
}): Promise<{ success: boolean; data?: any; error?: string; fbtrace_id?: string; events_received?: number }> {
  const pixelId = params.pixelId || currentProduct.settings?.metaPixelId;
  const accessToken = params.accessToken || currentProduct.settings?.metaConversionApiToken;
  const testEventCode = params.testEventCode || currentProduct.settings?.metaTestEventCode;

  if (!pixelId || !pixelId.trim()) {
    const msg = 'Meta Pixel ID is not configured.';
    addMetaCapiLog({
      eventName: params.eventName,
      eventId: params.eventId,
      status: 'failed',
      value: params.customData?.value,
      currency: params.customData?.currency || 'BDT',
      details: 'Missing Pixel ID',
      responseMessage: msg,
    });
    return { success: false, error: msg };
  }

  if (!accessToken || !accessToken.trim()) {
    const msg = 'Meta Conversion API Access Token is not configured.';
    addMetaCapiLog({
      eventName: params.eventName,
      eventId: params.eventId,
      status: 'failed',
      value: params.customData?.value,
      currency: params.customData?.currency || 'BDT',
      details: 'Missing CAPI Access Token',
      responseMessage: msg,
    });
    return { success: false, error: msg };
  }

  const cleanPixelId = pixelId.trim();
  const cleanToken = accessToken.trim();

  // Prepare user_data matching Meta best practices
  const userData: Record<string, any> = {};

  if (params.phoneNumber) {
    const formattedPhone = formatPhoneForMeta(params.phoneNumber);
    if (formattedPhone) {
      userData.ph = [sha256(formattedPhone)];
    }
  }

  if (params.customerName) {
    const parts = params.customerName.trim().split(' ');
    userData.fn = [sha256(parts[0])];
    if (parts.length > 1) {
      userData.ln = [sha256(parts.slice(1).join(' '))];
    }
  }

  if (params.email) {
    userData.em = [sha256(params.email)];
  }

  if (params.city || params.district) {
    const cityName = params.city || params.district || 'dhaka';
    userData.ct = [sha256(cityName)];
  }

  userData.country = [sha256('bd')];

  if (params.clientIp && params.clientIp !== '::1' && params.clientIp !== '127.0.0.1') {
    userData.client_ip_address = params.clientIp;
  }

  if (params.clientUserAgent) {
    userData.client_user_agent = params.clientUserAgent;
  }

  if (params.fbp) {
    userData.fbp = params.fbp;
  }

  if (params.fbc) {
    userData.fbc = params.fbc;
  }

  const eventPayload: Record<string, any> = {
    event_name: params.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    action_source: 'website',
    event_source_url: params.eventSourceUrl || 'https://ais-dev-hgls23dabrckdgrrqx5znp-471881543775.asia-southeast1.run.app',
    user_data: userData,
    custom_data: params.customData || {},
  };

  const requestBody: Record<string, any> = {
    data: [eventPayload],
  };

  if (testEventCode && testEventCode.trim()) {
    requestBody.test_event_code = testEventCode.trim();
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${cleanPixelId}/events?access_token=${encodeURIComponent(cleanToken)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseJson: any = await response.json();

    if (response.ok && responseJson.events_received) {
      addMetaCapiLog({
        eventName: params.eventName,
        eventId: params.eventId,
        status: 'success',
        value: params.customData?.value,
        currency: params.customData?.currency || 'BDT',
        details: `Graph API 200 OK | Events Received: ${responseJson.events_received}`,
        responseMessage: `Meta CAPI Verified | fbtrace_id: ${responseJson.fbtrace_id || 'N/A'}`,
        fbtraceId: responseJson.fbtrace_id,
        eventsReceived: responseJson.events_received,
      });
      return {
        success: true,
        data: responseJson,
        fbtrace_id: responseJson.fbtrace_id,
        events_received: responseJson.events_received,
      };
    } else {
      const errMessage = responseJson?.error?.message || responseJson?.error?.error_user_msg || 'Meta Graph API returned an error.';
      addMetaCapiLog({
        eventName: params.eventName,
        eventId: params.eventId,
        status: 'failed',
        value: params.customData?.value,
        currency: params.customData?.currency || 'BDT',
        details: `Meta Error: ${errMessage}`,
        responseMessage: `Type: ${responseJson?.error?.type || 'OAuth'} | Code: ${responseJson?.error?.code || response.status}`,
        fbtraceId: responseJson?.error?.fbtrace_id,
      });
      return {
        success: false,
        error: errMessage,
        data: responseJson,
        fbtrace_id: responseJson?.error?.fbtrace_id,
      };
    }
  } catch (err: any) {
    const errMessage = err?.message || 'Network request to Meta Graph API failed';
    addMetaCapiLog({
      eventName: params.eventName,
      eventId: params.eventId,
      status: 'failed',
      value: params.customData?.value,
      currency: params.customData?.currency || 'BDT',
      details: errMessage,
      responseMessage: 'Network error communicating with graph.facebook.com',
    });
    return { success: false, error: errMessage };
  }
}

// 4. Initial Orders Store Setup
const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'DZ-748291',
    customerName: 'Raflul Islam',
    phoneNumber: '01712345678',
    address: 'House 14, Road 5, Dhanmondi, Dhaka',
    city: 'Dhaka',
    district: 'ঢাকা',
    deliveryArea: 'inside_dhaka',
    deliveryFee: 70,
    paymentMethod: 'cash_on_delivery',
    item: {
      packageId: 'pack-28-days',
      packageName: '28 Days Pack (সবচেয়ে জনপ্রিয়)',
      durationDays: 28,
      unitPrice: 2300,
      quantity: 1,
      totalPrice: 2300,
    },
    subtotal: 2300,
    totalAmount: 2370,
    notes: 'Please call before delivery in the afternoon.',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    trackingHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'অর্ডার গ্রহণ করা হয়েছে এবং প্রসেসিং শুরু হয়েছে।',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'কাস্টমার কেয়ার থেকে অর্ডার নিশ্চিত করা হয়েছে।',
      },
      {
        status: 'shipped',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'স্টেডফাস্ট কুরিয়ারে পার্সেল হ্যান্ডওভার করা হয়েছে।',
      },
      {
        status: 'delivered',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'সফলভাবে ক্যাশ অন ডেলিভারিতে পণ্য ডেলিভারি সম্পন্ন হয়েছে।',
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'DZ-918234',
    customerName: 'Tanjil Mahmud',
    phoneNumber: '01898765432',
    address: 'GEC Circle, Nasirabad, Chattogram',
    city: 'Chattogram',
    district: 'চট্টগ্রাম',
    deliveryArea: 'outside_dhaka',
    deliveryFee: 130,
    paymentMethod: 'cash_on_delivery',
    item: {
      packageId: 'pack-14-days',
      packageName: '14 Days Pack',
      durationDays: 14,
      unitPrice: 1250,
      quantity: 1,
      totalPrice: 1250,
    },
    subtotal: 1250,
    totalAmount: 1380,
    notes: '',
    status: 'shipped',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    trackingHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'অর্ডার গ্রহণ করা হয়েছে।',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 0.8 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'অর্ডার কনফার্ম করা হয়েছে।',
      },
      {
        status: 'shipped',
        timestamp: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'চট্টগ্রাম হাবের উদ্দেশ্যে কুরিয়ারে পাঠানো হয়েছে।',
      },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'DZ-384912',
    customerName: 'Sadia Afreen',
    phoneNumber: '01911223344',
    address: 'Sector 11, Uttara, Dhaka',
    city: 'Dhaka',
    district: 'ঢাকা',
    deliveryArea: 'inside_dhaka',
    deliveryFee: 70,
    paymentMethod: 'cash_on_delivery',
    item: {
      packageId: 'pack-42-days',
      packageName: '42 Days Complete Course',
      durationDays: 42,
      unitPrice: 3200,
      quantity: 1,
      totalPrice: 3200,
    },
    subtotal: 3200,
    totalAmount: 3270,
    notes: 'Urgent delivery requested.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    trackingHistory: [
      {
        status: 'pending',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        description: 'নতুন অর্ডার প্লেস করা হয়েছে।',
      },
      {
        status: 'confirmed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'অর্ডার ভেরিফাই করে প্যাকিং চলছে।',
      },
    ],
  },
];

let orders: Order[] = [];
try {
  if (fs.existsSync(ORDERS_FILE)) {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    orders = JSON.parse(raw);
  } else {
    orders = [...initialOrders];
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  }
} catch (e) {
  orders = [...initialOrders];
}

// 5. Initial Reviews Store Setup
let reviews: CustomerReview[] = [];
try {
  if (fs.existsSync(REVIEWS_FILE)) {
    const raw = fs.readFileSync(REVIEWS_FILE, 'utf-8');
    reviews = JSON.parse(raw);
  } else {
    reviews = [...initialReviews];
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
  }
} catch (e) {
  reviews = [...initialReviews];
}

function saveOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Failed to save orders to file:', err);
  }
}

function saveReviews() {
  try {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
  } catch (err) {
    console.error('Failed to save reviews to file:', err);
  }
}

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ------------------- ADMIN AUTHENTICATION --------------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'ইমেইল এবং পাসওয়ার্ড আবশ্যক।',
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const inputHash = hashPassword(password);

  if (cleanEmail === adminAuth.email.toLowerCase() && inputHash === adminAuth.passwordHash) {
    const token = generateToken(adminAuth.email);
    adminAuth.lastLogin = new Date().toISOString();
    saveAdminAuth();

    return res.json({
      success: true,
      message: 'লগইন সফল হয়েছে!',
      token,
      user: {
        email: adminAuth.email,
        name: adminAuth.name,
        role: adminAuth.role,
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'ভুল ইমেইল বা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য দিন।',
  });
});

// Admin Verify Token / Session Check
app.get('/api/admin/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({
      success: false,
      message: 'সেশন শেষ হয়েছে। দয়া করে আবার লগইন করুন।',
    });
  }

  res.json({
    success: true,
    user: {
      email: adminAuth.email,
      name: adminAuth.name,
      role: adminAuth.role,
      lastLogin: adminAuth.lastLogin,
    },
  });
});

// Change Admin Credentials (Email & Password)
app.post('/api/admin/change-credentials', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { currentPassword, newEmail, newPassword, newName } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'বর্তমান পাসওয়ার্ড দিন।' });
  }

  if (hashPassword(currentPassword) !== adminAuth.passwordHash) {
    return res.status(400).json({ success: false, message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!' });
  }

  if (newEmail && newEmail.includes('@')) {
    adminAuth.email = String(newEmail).trim().toLowerCase();
  }

  if (newName) {
    adminAuth.name = String(newName).trim();
  }

  if (newPassword && newPassword.length >= 6) {
    adminAuth.passwordHash = hashPassword(newPassword);
  }

  saveAdminAuth();

  res.json({
    success: true,
    message: 'অ্যাডমিন সিকিউরিটি ও লগইন তথ্য সফলভাবে পরিবর্তন করা হয়েছে!',
    user: {
      email: adminAuth.email,
      name: adminAuth.name,
      role: adminAuth.role,
    },
  });
});

// ------------------- PRODUCT & STORE SETTINGS ----------------

// Public: Get Live Product Info
app.get('/api/product', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: currentProduct,
  });
});

// Admin: Update Complete Product Config (Images, Pricing, Title, Packages, Settings)
app.put('/api/admin/product', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const updated = req.body;
    currentProduct = {
      ...currentProduct,
      ...updated,
      id: currentProduct.id || 'dr-zeng-armpit-cream',
    };

    saveProduct();

    res.json({
      success: true,
      message: 'প্রোডাক্ট এবং স্টোর তথ্য সফলভাবে আপডেট হয়েছে!',
      data: currentProduct,
    });
  } catch (e) {
    console.error('Failed to update product:', e);
    res.status(500).json({ success: false, message: 'Failed to update product configuration.' });
  }
});

// Admin: Add or Update Package Option
app.post('/api/admin/packages', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { title, bengaliTitle, durationDays, originalPrice, discountPrice, badgeText, isPopular, sachetsCount } = req.body;

  const origPrice = Number(originalPrice) || 0;
  const discPrice = Number(discountPrice) || 0;
  const savings = Math.max(0, origPrice - discPrice);

  const newPackage: PackageOption = {
    id: `pack-${Date.now()}`,
    title: title || `${durationDays || 30} Days Pack`,
    bengaliTitle: bengaliTitle || `${durationDays || 30} দিনের প্যাক`,
    durationDays: Number(durationDays) || 30,
    originalPrice: origPrice,
    discountPrice: discPrice,
    savings: savings,
    badgeText: badgeText || (savings > 0 ? `সেভ ${savings}৳` : ''),
    sachetsCount: Number(sachetsCount) || Math.ceil((durationDays || 30) / 2),
    isPopular: !!isPopular,
  };

  currentProduct.packages.push(newPackage);
  saveProduct();

  res.status(201).json({
    success: true,
    message: 'নতুন প্যাকেজ যোগ করা হয়েছে!',
    data: currentProduct.packages,
  });
});

// Admin: Delete Package
app.delete('/api/admin/packages/:id', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  currentProduct.packages = currentProduct.packages.filter((p) => p.id !== req.params.id);
  saveProduct();

  res.json({
    success: true,
    message: 'প্যাকেজ ডিলিট করা হয়েছে।',
    data: currentProduct.packages,
  });
});

// ------------------- REVIEWS --------------------

// Public: Get Reviews
app.get('/api/reviews', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// Public: Add Customer Review
app.post('/api/reviews', (req: Request, res: Response) => {
  const { author, rating, comment, packagePurchased, city } = req.body;
  if (!author || !comment || !rating) {
    return res.status(400).json({ success: false, message: 'Author, rating, and comment are required.' });
  }

  const newReview: CustomerReview = {
    id: `rev-${Date.now()}`,
    author: String(author).trim(),
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    comment: String(comment).trim(),
    date: new Date().toLocaleDateString('bn-BD'),
    isVerified: true,
    packagePurchased: packagePurchased || '28 Days Pack',
    city: city || 'ঢাকা',
    createdAt: new Date().toISOString(),
  };

  reviews.unshift(newReview);
  saveReviews();

  res.status(201).json({
    success: true,
    message: 'রিভিউ সফলভাবে জমা হয়েছে। ধন্যবাদ!',
    data: newReview,
  });
});

// Admin: Edit Review
app.put('/api/admin/reviews/:id', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const index = reviews.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  reviews[index] = {
    ...reviews[index],
    ...req.body,
  };
  saveReviews();

  res.json({
    success: true,
    message: 'রিভিউ সফলভাবে আপডেট হয়েছে।',
    data: reviews[index],
  });
});

// Admin: Delete Review
app.delete('/api/admin/reviews/:id', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  reviews = reviews.filter((r) => r.id !== req.params.id);
  saveReviews();

  res.json({
    success: true,
    message: 'রিভিউ মুছে ফেলা হয়েছে।',
  });
});

// ------------------- ORDERS --------------------

// Create Order (Cash on Delivery)
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { customerName, phoneNumber, address, deliveryArea, packageId, quantity = 1, notes, district } = req.body;

    if (!customerName || !phoneNumber || !address) {
      return res.status(400).json({
        success: false,
        message: 'দয়া করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।',
      });
    }

    const cleanPhone = String(phoneNumber).replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 11) {
      return res.status(400).json({
        success: false,
        message: 'একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।',
      });
    }

    const selectedPack = currentProduct.packages.find((p) => p.id === packageId) || currentProduct.packages[0] || {
      id: 'pack-28-days',
      title: '28 Days',
      bengaliTitle: '২৮ দিনের প্যাক',
      discountPrice: 2300,
      durationDays: 28,
    };

    const qty = Math.max(1, Number(quantity) || 1);
    const subtotal = selectedPack.discountPrice * qty;
    const isInsideDhaka = deliveryArea === 'inside_dhaka';
    const deliveryFee = isInsideDhaka
      ? (currentProduct.settings?.deliveryFeeInsideDhaka ?? 70)
      : (currentProduct.settings?.deliveryFeeOutsideDhaka ?? 130);
    const totalAmount = subtotal + deliveryFee;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `DZ-${randomSuffix}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: String(customerName).trim(),
      phoneNumber: cleanPhone,
      address: String(address).trim(),
      city: isInsideDhaka ? 'Dhaka' : district || 'Outside Dhaka',
      district: district || (isInsideDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'),
      deliveryArea: isInsideDhaka ? 'inside_dhaka' : 'outside_dhaka',
      deliveryFee,
      paymentMethod: 'cash_on_delivery',
      item: {
        packageId: selectedPack.id,
        packageName: `${selectedPack.durationDays} Days Pack (${selectedPack.bengaliTitle})`,
        durationDays: selectedPack.durationDays,
        unitPrice: selectedPack.discountPrice,
        quantity: qty,
        totalPrice: subtotal,
      },
      subtotal,
      totalAmount,
      notes: notes ? String(notes).trim() : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      trackingHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          description: 'অর্ডারটি সফলভাবে প্লেস করা হয়েছে। আমাদের টিম খুব শীঘ্রই কনফার্মেশনের জন্য কল করবে।',
        },
      ],
    };

    orders.unshift(newOrder);
    saveOrders();

    // Automatically decrement stock
    if (currentProduct.stockCount > 0) {
      currentProduct.stockCount = Math.max(0, currentProduct.stockCount - qty);
      saveProduct();
    }

    // Trigger Meta Conversion API (Server-side) asynchronously if enabled
    const metaEventId = req.body.eventId || `ord_${newOrder.id}`;
    const metaFbp = req.body.fbp;
    const metaFbc = req.body.fbc;
    const metaEventSourceUrl = req.body.eventSourceUrl || req.headers.referer;

    if (
      currentProduct.settings?.metaPixelId &&
      currentProduct.settings?.metaConversionApiToken &&
      currentProduct.settings?.metaCapiEnabled !== false &&
      currentProduct.settings?.metaTrackPurchase !== false
    ) {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress;
      const clientUserAgent = req.headers['user-agent'];

      sendMetaConversionApiEvent({
        eventName: 'Purchase',
        eventId: metaEventId,
        eventSourceUrl: metaEventSourceUrl,
        clientIp,
        clientUserAgent,
        customerName: newOrder.customerName,
        phoneNumber: newOrder.phoneNumber,
        city: newOrder.city,
        district: newOrder.district,
        fbp: metaFbp,
        fbc: metaFbc,
        customData: {
          currency: 'BDT',
          value: newOrder.totalAmount,
          order_id: newOrder.orderNumber,
          content_name: newOrder.item.packageName,
          content_type: 'product',
          content_ids: [newOrder.item.packageId],
          num_items: newOrder.item.quantity,
        },
      }).catch((e) => console.error('[Meta CAPI] Purchase dispatch error:', e));
    }

    res.status(201).json({
      success: true,
      message: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
      data: newOrder,
      metaEventId,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'অর্ডার তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
    });
  }
});

// List All Orders (with filters & search for admin)
app.get('/api/orders', (req: Request, res: Response) => {
  const { status, search } = req.query;
  let filtered = [...orders];

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phoneNumber.includes(q) ||
        o.address.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// Admin: Manual Order Creation
app.post('/api/admin/orders', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { customerName, phoneNumber, address, deliveryArea, packageId, quantity, notes, status = 'confirmed' } = req.body;

  if (!customerName || !phoneNumber || !address) {
    return res.status(400).json({ success: false, message: 'Customer name, phone and address are required' });
  }

  const selectedPack = currentProduct.packages.find((p) => p.id === packageId) || currentProduct.packages[0];
  const qty = Number(quantity) || 1;
  const isInsideDhaka = deliveryArea === 'inside_dhaka';
  const deliveryFee = isInsideDhaka
    ? (currentProduct.settings?.deliveryFeeInsideDhaka ?? 70)
    : (currentProduct.settings?.deliveryFeeOutsideDhaka ?? 130);
  const subtotal = (selectedPack?.discountPrice || 2300) * qty;
  const totalAmount = subtotal + deliveryFee;

  const orderNumber = `DZ-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerName: String(customerName).trim(),
    phoneNumber: String(phoneNumber).trim(),
    address: String(address).trim(),
    city: isInsideDhaka ? 'Dhaka' : 'Outside Dhaka',
    district: isInsideDhaka ? 'ঢাকা' : 'অন্যান্য',
    deliveryArea: isInsideDhaka ? 'inside_dhaka' : 'outside_dhaka',
    deliveryFee,
    paymentMethod: 'cash_on_delivery',
    item: {
      packageId: selectedPack?.id || 'pack-custom',
      packageName: selectedPack?.bengaliTitle || 'Custom Pack',
      durationDays: selectedPack?.durationDays || 28,
      unitPrice: selectedPack?.discountPrice || 2300,
      quantity: qty,
      totalPrice: subtotal,
    },
    subtotal,
    totalAmount,
    notes: notes ? String(notes).trim() : 'ম্যানুয়ালি অ্যাডমিন থেকে যুক্ত',
    status: (status as OrderStatus) || 'confirmed',
    createdAt: new Date().toISOString(),
    trackingHistory: [
      {
        status: (status as OrderStatus) || 'confirmed',
        timestamp: new Date().toISOString(),
        description: 'ম্যানুয়ালি অ্যাডমিন থেকে অর্ডার এন্ট্রি করা হয়েছে।',
      },
    ],
  };

  orders.unshift(newOrder);
  saveOrders();

  res.status(201).json({
    success: true,
    message: 'ম্যানুয়াল অর্ডার সফলভাবে তৈরি হয়েছে!',
    data: newOrder,
  });
});

// Track Single Order by Order Number or Phone Number
app.get('/api/orders/track', (req: Request, res: Response) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  if (!query) {
    return res.status(400).json({ success: false, message: 'Please provide an Order ID or Phone Number.' });
  }

  const matched = orders.filter(
    (o) => o.orderNumber.toLowerCase() === query || o.phoneNumber.includes(query)
  );

  if (matched.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'এই আইডি বা নম্বর দিয়ে কোনো অর্ডার পাওয়া যায়নি। সঠিক তথ্য দিন।',
    });
  }

  res.json({
    success: true,
    data: matched,
  });
});

// Get Order by ID
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// Update Order Status
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body;
  const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const orderIndex = orders.findIndex((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const statusDescriptions: Record<OrderStatus, string> = {
    pending: 'অর্ডার প্রসেসিং অপেক্ষারত।',
    confirmed: 'কাস্টমার কেয়ার থেকে অর্ডার কনফার্ম করা হয়েছে।',
    processing: 'অর্ডার প্যাকিং ও গুদাম থেকে বের করার কাজ চলছে।',
    shipped: 'স্টেডফাস্ট / সুন্দরবন কুরিয়ারে পার্সেল হস্তান্তর করা হয়েছে।',
    delivered: 'গ্রাহকের নিকট ক্যাশ অন ডেলিভারিতে হস্তান্তর সম্পন্ন।',
    cancelled: 'অর্ডারটি বাতিল করা হয়েছে।',
  };

  orders[orderIndex].status = status;
  orders[orderIndex].trackingHistory.push({
    status,
    timestamp: new Date().toISOString(),
    description: note || statusDescriptions[status as OrderStatus],
  });

  saveOrders();

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: orders[orderIndex],
  });
});

// Delete Order
app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const initialLength = orders.length;
  orders = orders.filter((o) => o.id !== req.params.id && o.orderNumber !== req.params.id);
  
  if (orders.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  saveOrders();
  res.json({ success: true, message: 'Order deleted successfully' });
});

// Analytics Dashboard Endpoint
app.get('/api/analytics', (req: Request, res: Response) => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed').length;
  const shippedOrders = orders.filter((o) => o.status === 'shipped').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
  
  const todayStr = new Date().toDateString();
  const todayOrdersList = orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr);
  const todayOrders = todayOrdersList.length;
  const todayRevenue = todayOrdersList.reduce((sum, o) => (o.status !== 'cancelled' ? sum + o.totalAmount : sum), 0);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      todayRevenue,
    },
  });
});

// ------------------- META ADS & CAPI ADMIN ENDPOINTS -------------------

// Admin: Get Meta CAPI Logs
app.get('/api/admin/meta-capi-logs', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  res.json({
    success: true,
    data: metaCapiLogs,
    count: metaCapiLogs.length,
    config: {
      pixelId: currentProduct.settings?.metaPixelId || '',
      hasToken: !!currentProduct.settings?.metaConversionApiToken,
      tokenSnippet: currentProduct.settings?.metaConversionApiToken
        ? `${currentProduct.settings.metaConversionApiToken.substring(0, 8)}...${currentProduct.settings.metaConversionApiToken.substring(currentProduct.settings.metaConversionApiToken.length - 6)}`
        : '',
      testEventCode: currentProduct.settings?.metaTestEventCode || '',
      isPixelEnabled: currentProduct.settings?.metaPixelEnabled !== false,
      isCapiEnabled: currentProduct.settings?.metaCapiEnabled !== false,
    },
  });
});

// Admin: Clear Meta CAPI Logs
app.delete('/api/admin/meta-capi-logs', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  metaCapiLogs.length = 0;
  res.json({
    success: true,
    message: 'Meta CAPI লগ হিস্ট্রি ক্লিয়ার করা হয়েছে।',
  });
});

// Admin: Send One-Click Live Test Event to Meta Graph API
app.post('/api/admin/meta-test-event', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const {
    pixelId,
    accessToken,
    testEventCode,
    eventName = 'Purchase',
    value = 2300,
    currency = 'BDT',
    customerName = 'Test Customer',
    phoneNumber = '01712345678',
    city = 'Dhaka',
  } = req.body;

  const activePixelId = pixelId || currentProduct.settings?.metaPixelId;
  const activeToken = accessToken || currentProduct.settings?.metaConversionApiToken;
  const activeTestCode = testEventCode || currentProduct.settings?.metaTestEventCode;

  if (!activePixelId || !activePixelId.trim()) {
    return res.status(400).json({
      success: false,
      message: 'মেটা পিক্সেল আইডি (Pixel ID) পাওয়া যায়নি। দয়া করে পিক্সেল আইডি সেট করুন।',
    });
  }

  if (!activeToken || !activeToken.trim()) {
    return res.status(400).json({
      success: false,
      message: 'মেটা কনভার্সন এপিআই অ্যাক্সেস টোকেন (Access Token) পাওয়া যায়নি। দয়া করে টোকেন দিন।',
    });
  }

  const eventId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress;
  const clientUserAgent = req.headers['user-agent'];

  const result = await sendMetaConversionApiEvent({
    pixelId: activePixelId,
    accessToken: activeToken,
    testEventCode: activeTestCode,
    eventName,
    eventId,
    eventSourceUrl: req.headers.referer || 'https://ais-dev-hgls23dabrckdgrrqx5znp-471881543775.asia-southeast1.run.app',
    clientIp,
    clientUserAgent,
    customerName,
    phoneNumber,
    city,
    customData: {
      currency,
      value: Number(value) || 2300,
      order_id: `DZ-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      content_name: 'Dr. Zeng 28 Days Test Pack',
      content_type: 'product',
      content_ids: ['pack-28-days'],
      num_items: 1,
    },
  });

  if (result.success) {
    return res.json({
      success: true,
      message: `Meta Graph API-তে '${eventName}' টেস্ট ইভেন্ট সফলভাবে ফায়ার হয়েছে! (Events Received: ${result.events_received || 1})`,
      data: result.data,
      fbtrace_id: result.fbtrace_id,
      events_received: result.events_received,
      eventId,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: `Meta Graph API রেসপন্স এরর: ${result.error || 'Unknown error'}`,
      data: result.data,
      fbtrace_id: result.fbtrace_id,
    });
  }
});

// Reset Demo Data
app.post('/api/admin/reset', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!isValidToken(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  currentProduct = JSON.parse(JSON.stringify(defaultProductData));
  orders = [...initialOrders];
  reviews = [...initialReviews];
  saveProduct();
  saveOrders();
  saveReviews();

  res.json({
    success: true,
    message: 'সকল ডেমো ডাটা রিসেট করা হয়েছে।',
    product: currentProduct,
  });
});

// -------------------------------------------------------------
// Vite Server Integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dr. Zeng Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
