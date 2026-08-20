/**
 * Meta Pixel & Conversion API Browser Client Tracker
 * Features:
 * - Robust asynchronous injection of Meta Pixel (fbevents.js)
 * - Safe fallback handling (no breaks if adblocker or no pixel ID)
 * - Automatic event ID deduplication matching Server CAPI
 * - Automatic capture and tracking of _fbp and _fbc / fbclid cookies for high EMQ (Event Match Quality)
 * - Event activity log for admin live diagnostics
 */

import { PackageOption, Order, ProductInfo } from '../types';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    __metaPixelLoadedId?: string;
    __metaPixelLogs?: Array<{
      id: string;
      eventName: string;
      source: 'browser_pixel';
      eventId: string;
      timestamp: string;
      status: 'success' | 'failed';
      value?: number;
      currency?: string;
      details?: string;
    }>;
  }
}

// In-memory logs for live admin monitoring
const getLogStore = () => {
  if (typeof window === 'undefined') return [];
  if (!window.__metaPixelLogs) {
    window.__metaPixelLogs = [];
  }
  return window.__metaPixelLogs;
};

export const getPixelActivityLogs = () => {
  return [...getLogStore()];
};

export const clearPixelActivityLogs = () => {
  if (typeof window !== 'undefined') {
    window.__metaPixelLogs = [];
  }
};

const addPixelLog = (
  eventName: string,
  eventId: string,
  status: 'success' | 'failed',
  value?: number,
  currency: string = 'BDT',
  details?: string
) => {
  try {
    const store = getLogStore();
    store.unshift({
      id: `px-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      source: 'browser_pixel',
      eventId,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour12: true }),
      status,
      value,
      currency,
      details,
    });
    // Keep max 50 items
    if (store.length > 50) {
      store.pop();
    }
  } catch (e) {
    // ignore
  }
};

/**
 * Generate a unique Event ID for deduplication between Pixel and Conversion API
 */
export const generateEventId = (prefix: string = 'evt'): string => {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${ts}_${rand}`;
};

/**
 * Read browser cookie by name
 */
export const getCookie = (name: string): string => {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : '';
};

/**
 * Extract or generate _fbp and _fbc cookies
 */
export const getMetaCookies = (): { fbp: string; fbc: string } => {
  if (typeof window === 'undefined') return { fbp: '', fbc: '' };

  let fbp = getCookie('_fbp');
  let fbc = getCookie('_fbc');

  // If no _fbc cookie, check if fbclid is in the URL query parameters
  if (!fbc && window.location && window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    if (fbclid) {
      // Standard fbc format: fb.1.<creation_time>.<fbclid>
      fbc = `fb.1.${Date.now()}.${fbclid}`;
    }
  }

  return { fbp, fbc };
};

/**
 * Initialize Meta Pixel script
 */
export const initMetaPixel = (pixelId: string): boolean => {
  if (typeof window === 'undefined') return false;
  if (!pixelId || !pixelId.trim()) return false;

  const cleanPixelId = pixelId.trim();

  // If already initialized with same ID, no need to inject again
  if (window.__metaPixelLoadedId === cleanPixelId && window.fbq) {
    return true;
  }

  try {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        b.head.appendChild(t);
      }
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    if (window.fbq) {
      window.fbq('init', cleanPixelId);
      window.__metaPixelLoadedId = cleanPixelId;
      console.log(`[Meta Pixel] Initialized successfully with ID: ${cleanPixelId}`);
      return true;
    }
  } catch (err) {
    console.warn('[Meta Pixel] Failed to load pixel script:', err);
  }

  return false;
};

/**
 * Safe Track helper with Event ID deduplication
 */
export const trackMetaEvent = (
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
): string => {
  const finalEventId = eventId || generateEventId(eventName.toLowerCase());

  if (typeof window === 'undefined') {
    return finalEventId;
  }

  try {
    if (typeof window.fbq === 'function') {
      if (eventId) {
        window.fbq('track', eventName, params || {}, { eventID: finalEventId });
      } else {
        window.fbq('track', eventName, params || {}, { eventID: finalEventId });
      }

      const val = params?.value ? Number(params.value) : undefined;
      const curr = params?.currency || 'BDT';
      const detail = params?.content_name || (params?.content_ids ? `IDs: ${params.content_ids.join(',')}` : '');

      addPixelLog(eventName, finalEventId, 'success', val, curr, detail);
      console.log(`[Meta Pixel Event: ${eventName}] Fired with Event ID: ${finalEventId}`, params);
    } else {
      // Pixel not ready or blocked by browser extension
      addPixelLog(eventName, finalEventId, 'failed', params?.value, params?.currency || 'BDT', 'Pixel script not ready or blocked');
      console.warn(`[Meta Pixel] fbq function not found, skipped ${eventName}`);
    }
  } catch (e: any) {
    addPixelLog(eventName, finalEventId, 'failed', params?.value, params?.currency || 'BDT', e?.message || 'Error firing event');
    console.error(`[Meta Pixel] Error tracking ${eventName}:`, e);
  }

  return finalEventId;
};

/**
 * Standard Events
 */

// 1. PageView
export const trackPageView = (eventId?: string): string => {
  return trackMetaEvent('PageView', undefined, eventId);
};

// 2. ViewContent
export const trackViewContent = (product: ProductInfo, currentPackage?: PackageOption, eventId?: string): string => {
  const pack = currentPackage || (product.packages && product.packages[0]);
  const value = pack ? pack.discountPrice : 2300;

  return trackMetaEvent(
    'ViewContent',
    {
      content_name: product.name || 'Dr. Zeng Herbal Cream',
      content_category: 'Health & Beauty',
      content_ids: [pack?.id || product.id || 'dr-zeng-cream'],
      content_type: 'product',
      value: value,
      currency: 'BDT',
    },
    eventId
  );
};

// 3. AddToCart
export const trackAddToCart = (packageOption: PackageOption, quantity: number = 1, eventId?: string): string => {
  const value = packageOption.discountPrice * quantity;

  return trackMetaEvent(
    'AddToCart',
    {
      content_name: `${packageOption.title} - ${packageOption.bengaliTitle}`,
      content_ids: [packageOption.id],
      content_type: 'product',
      value: value,
      currency: 'BDT',
      num_items: quantity,
    },
    eventId
  );
};

// 4. InitiateCheckout
export const trackInitiateCheckout = (
  packageOption: PackageOption,
  quantity: number = 1,
  totalAmount?: number,
  eventId?: string
): string => {
  const value = totalAmount || packageOption.discountPrice * quantity;

  return trackMetaEvent(
    'InitiateCheckout',
    {
      content_name: `${packageOption.title} - ${packageOption.bengaliTitle}`,
      content_ids: [packageOption.id],
      content_type: 'product',
      value: value,
      currency: 'BDT',
      num_items: quantity,
    },
    eventId
  );
};

// 5. Purchase
export const trackPurchase = (order: Order, eventId?: string): string => {
  const finalEventId = eventId || `ord_${order.id || order.orderNumber}`;

  return trackMetaEvent(
    'Purchase',
    {
      content_name: order.item?.packageName || 'Dr. Zeng Herbal Treatment Pack',
      content_ids: [order.item?.packageId || 'pack-default'],
      content_type: 'product',
      value: order.totalAmount,
      currency: 'BDT',
      num_items: order.item?.quantity || 1,
      order_id: order.orderNumber,
    },
    finalEventId
  );
};
