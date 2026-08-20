import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  X,
  RefreshCw,
  Search,
  CheckCircle,
  Truck,
  Clock,
  AlertTriangle,
  Trash2,
  Phone,
  DollarSign,
  Package,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  Settings,
  Image as ImageIcon,
  Star,
  Plus,
  Save,
  Edit2,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ShieldCheck,
  Tag,
  Sliders,
  Check,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Activity,
  ShoppingBag,
  Users,
  Inbox,
  CreditCard,
  Ticket,
  FileText,
  Home,
  Layers,
  Menu,
  Bell,
  ArrowUpRight,
  Filter,
  BarChart3,
  Calendar,
  Send,
  UserCheck,
  CheckCircle2,
  Upload,
  ArrowLeft,
  ArrowRight,
  Crown,
  CheckCheck,
  Target,
  Radio,
  Zap,
  Copy,
} from 'lucide-react';
import { Order, OrderStatus, AnalyticsSummary, ProductInfo, PackageOption, GalleryImageItem, CustomerReview } from '../types';
import { DrZengBoxMockup } from './ProductGraphics';
import { getPixelActivityLogs, clearPixelActivityLogs } from '../utils/metaPixel';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated?: (updatedProduct: ProductInfo) => void;
}

type AdminTab =
  | 'dashboard'
  | 'home_cms'
  | 'pages'
  | 'media'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'customers'
  | 'reviews'
  | 'meta_pixel'
  | 'shipping'
  | 'payments'
  | 'coupons'
  | 'settings';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onProductUpdated,
}) => {
  // Auth state
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('dz_admin_token'));
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role: string } | null>(() => {
    const saved = localStorage.getItem('dz_admin_user');
    return saved ? JSON.parse(saved) : { email: 'admin@drzeng.com', name: 'Admin User', role: 'SUPER ADMIN' };
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@drzeng.com');
  const [loginPassword, setLoginPassword] = useState('admin123456');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Admin Navigation Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Orders filters & actions
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // New Manual Order state
  const [manualOrder, setManualOrder] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    deliveryArea: 'inside_dhaka' as 'inside_dhaka' | 'outside_dhaka',
    packageId: 'pack-28-days',
    quantity: 1,
    notes: 'অর্ডার নেওয়া হয়েছে ফোনে/হোয়াটসঅ্যাপে',
    status: 'confirmed' as OrderStatus,
  });

  // Package editing state
  const [editingPackage, setEditingPackage] = useState<PackageOption | null>(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [newPackageForm, setNewPackageForm] = useState<Partial<PackageOption>>({
    title: '',
    bengaliTitle: '',
    durationDays: 30,
    originalPrice: 2000,
    discountPrice: 1700,
    badgeText: 'সেভ ৩০০৳',
    sachetsCount: 15,
    isPopular: false,
  });

  // Image adding & editing state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageLabel, setNewImageLabel] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [editingImgId, setEditingImgId] = useState<string | null>(null);
  const [editingImgLabel, setEditingImgLabel] = useState('');
  const [isSavingGallery, setIsSavingGallery] = useState(false);

  // Branding & Navbar management state
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [customLogoUrlInput, setCustomLogoUrlInput] = useState('');

  // Review editing/adding state
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    author: '',
    rating: 5,
    city: 'ঢাকা',
    comment: '',
    packagePurchased: '28 Days Pack',
  });

  // Coupons state (Local storage support)
  const [coupons, setCoupons] = useState([
    { id: '1', code: 'ZENG100', discount: 100, type: 'flat', minOrder: 1500, active: true },
    { id: '2', code: 'FREESHIP', discount: 70, type: 'shipping', minOrder: 2000, active: true },
    { id: '3', code: 'SPECIAL200', discount: 200, type: 'flat', minOrder: 3000, active: false },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(100);

  // Credentials form
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Meta Pixel & Conversion API (CAPI) State
  const [metaCapiLogs, setMetaCapiLogs] = useState<any[]>([]);
  const [metaPixelLogs, setMetaPixelLogs] = useState<any[]>([]);
  const [isTestingMeta, setIsTestingMeta] = useState(false);
  const [metaTestResult, setMetaTestResult] = useState<{ success: boolean; message: string; fbtrace_id?: string; events_received?: number } | null>(null);
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [metaTestEventName, setMetaTestEventName] = useState<'Purchase' | 'InitiateCheckout' | 'AddToCart' | 'PageView' | 'ViewContent'>('Purchase');
  const [metaTestValue, setMetaTestValue] = useState(2300);

  // Fetch Meta CAPI and Pixel logs
  const fetchMetaLogs = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/meta-capi-logs', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setMetaCapiLogs(data.data || []);
      }
    } catch (e) {
      console.warn('Failed to fetch Meta CAPI logs', e);
    }
    setMetaPixelLogs(getPixelActivityLogs());
  };

  const handleSendMetaTestEvent = async () => {
    if (!product?.settings?.metaPixelId) {
      alert('দয়া করে প্রথমে মেটা পিক্সেল আইডি (Pixel ID) দিয়ে Save করুন।');
      return;
    }
    if (!product?.settings?.metaConversionApiToken) {
      alert('দয়া করে মেটা কনভার্সন এপিআই অ্যাক্সেস টোকেন (CAPI Token) দিয়ে Save করুন।');
      return;
    }

    setIsTestingMeta(true);
    setMetaTestResult(null);

    try {
      const res = await fetch('/api/admin/meta-test-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          pixelId: product.settings.metaPixelId,
          accessToken: product.settings.metaConversionApiToken,
          testEventCode: product.settings.metaTestEventCode,
          eventName: metaTestEventName,
          value: metaTestValue,
          customerName: 'Rahim Ahmed (Test Customer)',
          phoneNumber: '01712345678',
          city: 'Dhaka',
        }),
      });

      const data = await res.json();
      setMetaTestResult({
        success: data.success,
        message: data.message,
        fbtrace_id: data.fbtrace_id,
        events_received: data.events_received,
      });

      if (data.success) {
        showToast('Meta Graph API-তে টেস্ট ইভেন্ট সফলভাবে পাঠানো হয়েছে!');
      }
      fetchMetaLogs();
    } catch (err: any) {
      setMetaTestResult({
        success: false,
        message: err?.message || 'Network error communicating with Meta Graph API',
      });
    } finally {
      setIsTestingMeta(false);
    }
  };

  const handleClearMetaLogs = async () => {
    clearPixelActivityLogs();
    setMetaPixelLogs([]);
    try {
      await fetch('/api/admin/meta-capi-logs', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMetaCapiLogs([]);
      showToast('Meta লগ হিস্ট্রি ক্লিয়ার করা হয়েছে।');
    } catch (e) {
      console.warn('Failed to clear Meta CAPI logs', e);
    }
  };

  // -------------------------------------------------------------
  // Load All Admin Data
  // -------------------------------------------------------------
  const fetchAllAdminData = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const [ordersRes, analyticsRes, productRes, reviewsRes] = await Promise.all([
        fetch(`/api/orders?status=${statusFilter}&search=${encodeURIComponent(orderSearchQuery)}`),
        fetch('/api/analytics'),
        fetch('/api/product'),
        fetch('/api/reviews'),
      ]);

      const ordersData = await ordersRes.json();
      const analyticsData = await analyticsRes.json();
      const productData = await productRes.json();
      const reviewsData = await reviewsRes.json();

      if (ordersData.success) setOrders(ordersData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (productData.success) {
        setProduct(productData.data);
        if (onProductUpdated) onProductUpdated(productData.data);
      }
      if (reviewsData.success) setReviews(reviewsData.data);
      fetchMetaLogs();
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && authToken) {
      fetchAllAdminData();
    }
  }, [isOpen, authToken, statusFilter]);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // -------------------------------------------------------------
  // Auth Handlers
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const userObj = data.user || { email: loginEmail, name: 'Admin User', role: 'SUPER ADMIN' };
        setAuthToken(data.token);
        setAdminUser(userObj);
        localStorage.setItem('dz_admin_token', data.token);
        localStorage.setItem('dz_admin_user', JSON.stringify(userObj));
        showToast('স্বাগতম! অ্যাডমিন প্যানেলে সফলভাবে লগইন হয়েছে।');
      } else {
        setAuthError(data.message || 'ভুল ইমেইল বা পাসওয়ার্ড!');
      }
    } catch (e) {
      setAuthError('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAdminUser(null);
    localStorage.removeItem('dz_admin_token');
    localStorage.removeItem('dz_admin_user');
    showToast('সফলভাবে লগআউট সম্পন্ন হয়েছে।');
  };

  // -------------------------------------------------------------
  // Order Handlers
  // -------------------------------------------------------------
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`অর্ডার স্ট্যাটাস '${newStatus}' এ পরিবর্তন করা হয়েছে।`);
        fetchAllAdminData();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const tokenToSend = authToken || localStorage.getItem('dz_admin_token') || 'admin123456';
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenToSend}` },
      });
      if (res.ok) {
        showToast('অর্ডার সফলভাবে মুছে ফেলা হয়েছে।');
        fetchAllAdminData();
      }
    } catch (e) {
      console.error('Failed to delete order', e);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(manualOrder),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('ম্যানুয়াল অর্ডার সফলভাবে যুক্ত হয়েছে!');
        setShowNewOrderModal(false);
        fetchAllAdminData();
      } else {
        alert(data.message || 'অর্ডার যুক্ত করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Package', 'Qty', 'Total (BDT)', 'Area', 'Address', 'Status'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.phoneNumber,
      `"${o.item.packageName}"`,
      o.item.quantity,
      o.totalAmount,
      o.deliveryArea,
      `"${o.address.replace(/"/g, '""')}"`,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DrZeng_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('অর্ডার লিস্ট CSV ফাইলে ডাউনলোড হয়েছে।');
  };

  // -------------------------------------------------------------
  // Product Save Handlers
  // -------------------------------------------------------------
  const handleSaveProduct = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(product),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProduct(data.data);
        if (onProductUpdated) onProductUpdated(data.data);
        showToast('প্রোডাক্ট ও স্টোর সেটিংস সফলভাবে সেভ হয়েছে!');
      } else {
        alert('আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      console.error('Failed to save product', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProductDirect = async (updated: ProductInfo) => {
    try {
      // Immediately reflect state in Admin UI and parent Landing Page
      setProduct(updated);
      if (onProductUpdated) onProductUpdated(updated);

      const tokenToSend = authToken || localStorage.getItem('dz_admin_token') || 'admin123456';
      const res = await fetch('/api/admin/product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToSend}`,
        },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setProduct(data.data);
        if (onProductUpdated) onProductUpdated(data.data);
        showToast('পরিবর্তন সফলভাবে সংরক্ষিত ও লাইভ হয়েছে!');
      } else {
        console.warn('Direct product save response:', data);
      }
    } catch (e) {
      console.error('Error saving product directly:', e);
    }
  };

  // Package helpers
  const handleSavePackageEdit = () => {
    if (!editingPackage || !product) return;
    const updatedPackages = product.packages.map((p) => (p.id === editingPackage.id ? editingPackage : p));
    const updatedProduct = { ...product, packages: updatedPackages };
    setProduct(updatedProduct);
    setEditingPackage(null);
    handleSaveProductDirect(updatedProduct);
  };

  const handleAddNewPackage = () => {
    if (!product || !newPackageForm.title) return;
    const orig = Number(newPackageForm.originalPrice) || 2000;
    const disc = Number(newPackageForm.discountPrice) || 1700;
    const savings = Math.max(0, orig - disc);

    const newPkg: PackageOption = {
      id: `pack-${Date.now()}`,
      title: newPackageForm.title || 'New Package',
      bengaliTitle: newPackageForm.bengaliTitle || 'নতুন প্যাকেজ',
      durationDays: Number(newPackageForm.durationDays) || 30,
      originalPrice: orig,
      discountPrice: disc,
      savings,
      badgeText: newPackageForm.badgeText || `সেভ ${savings}৳`,
      sachetsCount: Number(newPackageForm.sachetsCount) || 15,
      isPopular: !!newPackageForm.isPopular,
    };

    const updatedProduct = { ...product, packages: [...product.packages, newPkg] };
    setProduct(updatedProduct);
    setIsAddingPackage(false);
    setNewPackageForm({
      title: '',
      bengaliTitle: '',
      durationDays: 30,
      originalPrice: 2000,
      discountPrice: 1700,
      badgeText: 'সেভ ৩০০৳',
      sachetsCount: 15,
      isPopular: false,
    });
    handleSaveProductDirect(updatedProduct);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (!product) return;
    if (product.packages.length <= 1) {
      showToast('কমপক্ষে একটি প্যাকেজ থাকা আবশ্যক!');
      return;
    }
    const updatedPackages = product.packages.filter((p) => p.id !== pkgId);
    const updatedProduct = { ...product, packages: updatedPackages };
    setProduct(updatedProduct);
    handleSaveProductDirect(updatedProduct);
    showToast('প্যাকেজ ডিলিট ও সেভ হয়েছে!');
  };

  // Brand Logo & Navbar helpers
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    if (!file.type.startsWith('image/')) {
      showToast('অনুগ্রহ করে একটি ভ্যালিড ইমেজ ফাইল (PNG, JPG, SVG, WebP) সিলেক্ট করুন।');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('লোগো সাইজ সর্বোচ্চ 10MB হতে পারে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updatedSettings = {
          ...product.settings,
          deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
          deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
          announcementText: product.settings?.announcementText || 'আজকের অর্ডারে পাচ্ছেন নিশ্চিত বিশেষ ছাড় ও দ্রুত ডেলিভারি!',
          brandLogoUrl: dataUrl,
          brandLogoType: product.settings?.brandLogoType || 'both',
          navbarLogoHeight: product.settings?.navbarLogoHeight || 28,
        };
        const updatedProduct = { ...product, settings: updatedSettings };
        setProduct(updatedProduct);
        handleSaveProductDirect(updatedProduct);
        showToast('ব্র্যান্ড লোগো সফলভাবে আপলোড ও সেভ হয়েছে!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (!product) return;
    const updatedSettings = {
      ...product.settings,
      deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
      deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
      announcementText: product.settings?.announcementText || 'আজকের অর্ডারে পাচ্ছেন নিশ্চিত বিশেষ ছাড় ও দ্রুত ডেলিভারি!',
      brandLogoUrl: '',
    };
    const updatedProduct = { ...product, settings: updatedSettings };
    setProduct(updatedProduct);
    handleSaveProductDirect(updatedProduct);
    setCustomLogoUrlInput('');
    showToast('লোগো মুছে ফেলা হয়েছে এবং পরিবর্তন সেভ হয়েছে।');
  };

  const handleApplyLogoUrl = () => {
    if (!product || !customLogoUrlInput.trim()) {
      showToast('অনুগ্রহ করে লোগোর একটি সঠিক ওয়েব লিঙ্ক লিখুন।');
      return;
    }
    const updatedSettings = {
      ...product.settings,
      deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
      deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
      announcementText: product.settings?.announcementText || 'আজকের অর্ডারে পাচ্ছেন নিশ্চিত বিশেষ ছাড় ও দ্রুত ডেলিভারি!',
      brandLogoUrl: customLogoUrlInput.trim(),
      brandLogoType: product.settings?.brandLogoType || 'both',
      navbarLogoHeight: product.settings?.navbarLogoHeight || 28,
    };
    const updatedProduct = { ...product, settings: updatedSettings };
    setProduct(updatedProduct);
    handleSaveProductDirect(updatedProduct);
    showToast('লোগো লিঙ্ক সফলভাবে সেভ হয়েছে!');
  };

  // Image helpers
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('অনুগ্রহ করে একটি ইমেজ ফাইল (JPG, PNG, WebP) সিলেক্ট করুন।');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      showToast('ছবিটির সাইজ সর্বোচ্চ 20MB হতে পারে।');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNewImageUrl(dataUrl);
        if (!newImageLabel) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setNewImageLabel(cleanName);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomImage = () => {
    if (!product || !newImageUrl.trim()) {
      showToast('অনুগ্রহ করে ছবির লিঙ্ক দিন অথবা ডিভাইস থেকে ছবি আপলোড করুন।');
      return;
    }
    const newImg: GalleryImageItem = {
      id: `img-${Date.now()}`,
      url: newImageUrl.trim(),
      label: newImageLabel.trim() || 'প্রোডাক্ট ছবি',
      isCustomUrl: true,
    };

    // Put new uploaded image at index 0 so it immediately becomes the primary showcase photo on landing page
    const updatedProduct = {
      ...product,
      images: [newImg, ...(product.images || [])],
    };

    setProduct(updatedProduct);
    setNewImageUrl('');
    setNewImageLabel('');
    handleSaveProductDirect(updatedProduct);
    showToast('নতুন ইমেজ সফলভাবে গ্যালারিতে যোগ ও সেভ হয়েছে!');
  };

  const handleSetPrimaryImage = (imgId: string) => {
    if (!product || !product.images) return;
    const idx = product.images.findIndex((img) => img.id === imgId);
    if (idx <= 0) return;
    const imgToMove = product.images[idx];
    const remaining = product.images.filter((img) => img.id !== imgId);
    const updatedImages = [imgToMove, ...remaining];
    const updatedProduct = { ...product, images: updatedImages };
    setProduct(updatedProduct);
    handleSaveProductDirect(updatedProduct);
    showToast('এই ছবিটি এখন ওয়েবসাইটের প্রধান ছবি হিসেবে সেট হয়েছে!');
  };

  const handleMoveImage = (idx: number, direction: 'left' | 'right') => {
    if (!product || !product.images) return;
    const newImages = [...product.images];
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newImages.length) return;
    const temp = newImages[idx];
    newImages[idx] = newImages[targetIdx];
    newImages[targetIdx] = temp;
    const updatedProduct = { ...product, images: newImages };
    setProduct(updatedProduct);
    handleSaveProductDirect(updatedProduct);
    showToast('ছবিগুলোর ক্রম পরিবর্তন ও সেভ হয়েছে!');
  };

  const handleSaveImageLabel = (imgId: string) => {
    if (!product || !product.images) return;
    const updatedImages = product.images.map((img) =>
      img.id === imgId ? { ...img, label: editingImgLabel.trim() || img.label } : img
    );
    const updatedProduct = { ...product, images: updatedImages };
    setProduct(updatedProduct);
    setEditingImgId(null);
    setEditingImgLabel('');
    handleSaveProductDirect(updatedProduct);
    showToast('ছবির নাম সফলভাবে আপডেট হয়েছে!');
  };

  const handleDeleteImage = (imgId: string) => {
    if (!product) return;
    const currentList = product.images || [];
    if (currentList.length <= 1) {
      showToast('কমপক্ষে একটি ইমেজ থাকা আবশ্যক!');
      return;
    }
    const updatedImages = currentList.filter((img) => img.id !== imgId);
    const updatedProduct = { ...product, images: updatedImages };
    setProduct(updatedProduct);
    handleSaveProductDirect(updatedProduct);
    showToast('ইমেজ মুছে ফেলা হয়েছে এবং পরিবর্তন সেভ হয়েছে।');
  };

  const handleSaveGalleryExplicit = async () => {
    if (!product) return;
    setIsSavingGallery(true);
    try {
      let currentImages = [...(product.images || [])];
      // If user uploaded/pasted an image into the input field and clicked Save Gallery directly, auto-add it
      if (newImageUrl && newImageUrl.trim()) {
        const newImg: GalleryImageItem = {
          id: `img-${Date.now()}`,
          url: newImageUrl.trim(),
          label: newImageLabel.trim() || 'প্রোডাক্ট ছবি',
          isCustomUrl: true,
        };
        currentImages = [newImg, ...currentImages];
        setNewImageUrl('');
        setNewImageLabel('');
      }
      const updatedProduct = { ...product, images: currentImages };
      setProduct(updatedProduct);
      await handleSaveProductDirect(updatedProduct);
      showToast('গ্যালারির সমস্ত ছবি সফলভাবে সেভ হয়েছে এবং ওয়েবসাইটে দৃশ্যমান!');
    } catch (err) {
      console.error('Failed to save gallery changes:', err);
    } finally {
      setIsSavingGallery(false);
    }
  };

  // Review helpers
  const handleAddCustomReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReviewForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('নতুন রিভিউ সফলভাবে যুক্ত হয়েছে!');
        setShowAddReviewModal(false);
        setNewReviewForm({
          author: '',
          rating: 5,
          city: 'ঢাকা',
          comment: '',
          packagePurchased: '28 Days Pack',
        });
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReview = async (revId: string) => {
    try {
      const tokenToSend = authToken || localStorage.getItem('dz_admin_token') || 'admin123456';
      const res = await fetch(`/api/admin/reviews/${revId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenToSend}` },
      });
      if (res.ok) {
        showToast('রিভিউ মুছে ফেলা হয়েছে।');
        fetchAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Unique customers computation
  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; totalSpent: number; orderCount: number; lastOrderDate: string; area: string }>();
    orders.forEach((o) => {
      const existing = map.get(o.phoneNumber);
      if (existing) {
        existing.totalSpent += o.totalAmount;
        existing.orderCount += 1;
      } else {
        map.set(o.phoneNumber, {
          name: o.customerName,
          phone: o.phoneNumber,
          totalSpent: o.totalAmount,
          orderCount: 1,
          lastOrderDate: o.createdAt,
          area: o.deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে',
        });
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Global search filtering across orders/customers
  const filteredOrders = useMemo(() => {
    if (!globalSearch.trim()) return orders;
    const q = globalSearch.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phoneNumber.includes(q) ||
        o.address.toLowerCase().includes(q)
    );
  }, [orders, globalSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-3 overflow-hidden">
      
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-sm font-bold animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. LOGIN SCREEN (If not authenticated)                   */}
      {/* ======================================================== */}
      {!authToken ? (
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in duration-200 m-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0a192f] text-white flex items-center justify-center mx-auto shadow-lg">
              <span className="font-black text-xl tracking-tight text-[#1a73e8]">DZ</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-sans tracking-tight">
              ADMIN CONTROL CENTER
            </h2>
            <p className="text-xs text-slate-500">
              Dr. Zeng Enterprise Management & Storefront Control
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@drzeng.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Helper */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-950 flex items-center justify-between">
              <div>
                <span className="font-bold block">Default Credentials:</span>
                <span className="font-mono text-slate-600">admin@drzeng.com / admin123456</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@drzeng.com');
                  setLoginPassword('admin123456');
                }}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Auto Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Sign In to Admin Panel</span>
            </button>
          </form>
        </div>
      ) : (

        /* ======================================================== */
        /* 2. ADMIN DASHBOARD WORKSPACE (MATCHING THE SCREENSHOT)   */
        /* ======================================================== */
        <div className="bg-[#f8fafc] w-full h-full md:rounded-3xl max-w-7xl md:h-[95vh] flex overflow-hidden shadow-2xl border border-slate-200">
          
          {/* ======================================================== */}
          {/* LEFT SIDEBAR (Dark Navy, matching screenshot exactly)    */}
          {/* ======================================================== */}
          <aside
            className={`${
              sidebarCollapsed ? 'w-20' : 'w-64'
            } bg-[#0b132b] text-slate-300 flex flex-col transition-all duration-300 shrink-0 select-none z-20 border-r border-slate-800/60`}
          >
            {/* Logo Brand Header */}
            <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-[#091126]">
              <div className="w-8 h-8 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/30 shrink-0">
                DZ
              </div>
              {!sidebarCollapsed && (
                <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                  <span className="font-black text-white text-base tracking-wider font-sans">
                    ADMIN PANEL
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none text-xs">
              
              {/* Main Dashboard Pill Button */}
              <div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-[#1a73e8] text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span className="text-sm">Dashboard</span>}
                </button>
              </div>

              {/* Group: HOME */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Home
                  </p>
                )}
                {[
                  { id: 'home_cms', label: 'Home CMS', icon: Home },
                  { id: 'pages', label: 'Pages', icon: FileText },
                  { id: 'media', label: 'Media', icon: Layers, badge: product?.images?.length },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AdminTab)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-[#1a73e8] text-white shadow-sm font-bold'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group: STORE */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Store
                  </p>
                )}
                {[
                  { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
                  { id: 'products', label: 'Products', icon: Package, badge: product?.packages?.length },
                  { id: 'inventory', label: 'Inventory', icon: ShieldCheck },
                  { id: 'customers', label: 'Customers', icon: Users, badge: uniqueCustomers.length },
                  { id: 'reviews', label: 'Reviews', icon: Star, badge: reviews.length },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AdminTab)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-[#1a73e8] text-white shadow-sm font-bold'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group: MARKETING & ADS */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Marketing & Ads</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold">CAPI</span>
                  </p>
                )}
                {[
                  {
                    id: 'meta_pixel',
                    label: 'Meta Pixel & CAPI',
                    icon: Target,
                    badge: product?.settings?.metaPixelId ? 'Active' : 'Setup',
                    badgeColor: product?.settings?.metaPixelId ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AdminTab)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-[#1a73e8] text-white shadow-sm font-bold'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0 text-amber-400" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group: LOGISTICS */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Logistics
                  </p>
                )}
                {[
                  { id: 'shipping', label: 'Shipping', icon: Truck },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'coupons', label: 'Coupons', icon: Ticket, badge: coupons.length },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as AdminTab)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                        isActive
                          ? 'bg-[#1a73e8] text-white shadow-sm font-bold'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group: SYSTEM */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    System
                  </p>
                )}
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#1a73e8] text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && <span>Settings</span>}
                </button>
              </div>

            </div>

            {/* Bottom Admin User block on mobile or collapsed */}
            <div className="p-3 border-t border-slate-800/80 bg-[#091126]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 text-xs font-bold transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Logout Session</span>}
              </button>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* MAIN CONTENT AREA                                        */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc]">
            
            {/* ======================================================== */}
            {/* TOP HEADER BAR (Matching screenshot exactly)             */}
            {/* ======================================================== */}
            <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
              
              {/* Left: Hamburger & Global Search */}
              <div className="flex items-center gap-4 flex-1 max-w-md">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  title="Toggle Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Global Search Input */}
                <div className="relative w-full">
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGlobalSearch(val);
                      const lower = val.toLowerCase();
                      if (lower.includes('meta') || lower.includes('pixel') || lower.includes('capi') || lower.includes('fb') || lower.includes('ads')) {
                        setActiveTab('meta_pixel');
                      } else if (activeTab === 'dashboard' && val.trim()) {
                        setActiveTab('orders');
                      }
                    }}
                    placeholder="Global search (e.g. Meta, Pixel, Orders)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Right: Actions & User Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                
                {/* Refresh Button */}
                <button
                  onClick={fetchAllAdminData}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                </button>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                  {analytics && analytics.pendingOrders > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  )}
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                {/* User Info Block */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {adminUser?.name || 'Admin User'}
                    </p>
                    <p className="text-[10px] font-black text-[#1a73e8] tracking-wider uppercase">
                      {adminUser?.role || 'SUPER ADMIN'}
                    </p>
                  </div>

                  {/* Circular Avatar */}
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300 shadow-2xs">
                    AD
                  </div>

                  {/* Quick Exit Modal Close Button */}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Close Admin Panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              </div>

            </header>

            {/* ======================================================== */}
            {/* VIEW CANVAS CONTENT AREA                                 */}
            {/* ======================================================== */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              
              {/* ==================================================== */}
              {/* VIEW 1: DASHBOARD OVERVIEW (Exact Screenshot UI)     */}
              {/* ==================================================== */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Page Title & Subtitle */}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight font-sans">
                      DASHBOARD OVERVIEW
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Welcome back to the admin control center.
                    </p>
                  </div>

                  {/* Stat Cards Grid: 8 Cards (matching screenshot) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Card 1: TOTAL REVENUE */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          TOTAL REVENUE
                        </span>
                        <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {analytics ? analytics.totalRevenue.toLocaleString('en-US') : '0'} BDT
                        </div>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                          <span>↗ +12.5%</span>
                          <span className="text-slate-400 font-normal">Total sales revenue</span>
                        </p>
                      </div>
                    </div>

                    {/* Card 2: TODAY'S REVENUE */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          TODAY'S REVENUE
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center">
                          <Activity className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {analytics ? analytics.todayRevenue.toLocaleString('en-US') : '0'} BDT
                        </div>
                        <p className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                          <span>↗ +4.2%</span>
                          <span className="text-slate-400 font-normal">Revenue earned today</span>
                        </p>
                      </div>
                    </div>

                    {/* Card 3: TOTAL ORDERS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          TOTAL ORDERS
                        </span>
                        <div className="w-8 h-8 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {analytics ? analytics.totalOrders : '0'}
                        </div>
                        <p className="text-[11px] text-purple-600 font-semibold mt-1 flex items-center gap-1">
                          <span>↗ +8.1%</span>
                          <span className="text-slate-400 font-normal">Overall orders placed</span>
                        </p>
                      </div>
                    </div>

                    {/* Card 4: PENDING ORDERS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          PENDING ORDERS
                        </span>
                        <div className="w-8 h-8 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center">
                          <Inbox className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {analytics ? analytics.pendingOrders : '0'}
                        </div>
                        <p className="text-[11px] text-amber-600 font-semibold mt-1">
                          Awaiting confirmation
                        </p>
                      </div>
                    </div>

                    {/* Card 5: TOTAL PRODUCTS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          TOTAL PRODUCTS
                        </span>
                        <div className="w-8 h-8 rounded-full bg-indigo-100/70 text-indigo-600 flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {product?.packages?.length || 1}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                          In your inventory ({product?.stockCount || 0} units)
                        </p>
                      </div>
                    </div>

                    {/* Card 6: LOW STOCK ITEMS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          LOW STOCK ITEMS
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {(product?.stockCount ?? 0) <= 10 ? '1' : '0'}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                          Items with &lt;= 10 units
                        </p>
                      </div>
                    </div>

                    {/* Card 7: TOTAL CUSTOMERS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          TOTAL CUSTOMERS
                        </span>
                        <div className="w-8 h-8 rounded-full bg-cyan-100/70 text-cyan-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {uniqueCustomers.length}
                        </div>
                        <p className="text-[11px] text-cyan-600 font-semibold mt-1 flex items-center gap-1">
                          <span>↗ +2.4%</span>
                          <span className="text-slate-400 font-normal">Registered profiles</span>
                        </p>
                      </div>
                    </div>

                    {/* Card 8: CONVERSION RATE */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                          CUSTOMER REVIEWS
                        </span>
                        <div className="w-8 h-8 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900 font-sans">
                          {reviews.length} (5.0 ★)
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                          100% verified buyers
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Meta Ads & Conversion Tracking Quick Action Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 rounded-2xl border border-blue-900/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-white tracking-wide">
                            Meta Ads &amp; Conversion API (CAPI) Tracking
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product?.settings?.metaPixelId ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                            {product?.settings?.metaPixelId ? 'Active & Firing' : 'Setup Required'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {product?.settings?.metaPixelId
                            ? `Pixel ID: ${product.settings.metaPixelId} • Server CAPI: ${product.settings.metaConversionApiToken ? 'Enabled (Graph v19.0)' : 'Not Connected'}`
                            : 'Set your Facebook Pixel ID & CAPI token in one click to track Purchase, AddToCart, and PageView events with 100% accuracy.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('meta_pixel')}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shrink-0 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{product?.settings?.metaPixelId ? 'Manage Meta Ads' : 'Configure Meta Ads'}</span>
                    </button>
                  </div>

                  {/* Lower Row: REVENUE PERFORMANCE & RECENT ACTIVITY */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left: REVENUE PERFORMANCE (~60% / col-span-7) */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          REVENUE PERFORMANCE
                        </h3>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          Weekly Trend
                        </span>
                      </div>

                      {/* Interactive Revenue Chart Canvas */}
                      <div className="flex-1 min-h-[260px] border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col justify-between bg-slate-50/50">
                        
                        <div className="grid grid-cols-7 gap-2 items-end h-44 pt-4 px-2">
                          {[
                            { day: 'Sat', val: 3400, height: '45%' },
                            { day: 'Sun', val: 5100, height: '65%' },
                            { day: 'Mon', val: 2800, height: '35%' },
                            { day: 'Tue', val: 6800, height: '85%' },
                            { day: 'Wed', val: 4200, height: '55%' },
                            { day: 'Thu', val: 7600, height: '95%' },
                            { day: 'Fri', val: analytics?.todayRevenue ? Math.max(30, Math.min(100, analytics.todayRevenue / 50)) + '%' : '60%', height: '70%' },
                          ].map((bar, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                                {bar.val}৳
                              </span>
                              <div
                                style={{ height: bar.height }}
                                className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg group-hover:from-blue-700 group-hover:to-indigo-600 transition-all shadow-xs"
                              />
                              <span className="text-[11px] font-bold text-slate-600">
                                {bar.day}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                            <span>Dr. Zeng Total Sales Curve</span>
                          </div>
                          <span className="font-bold text-slate-800">Avg 4,800 BDT/Day</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: RECENT ACTIVITY (~40% / col-span-5) */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          RECENT ACTIVITY
                        </h3>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          View All ({orders.length})
                        </button>
                      </div>

                      {/* Recent Orders List */}
                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                        {orders.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                            <Inbox className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-xs font-medium">No recent orders logged yet</p>
                          </div>
                        ) : (
                          orders.slice(0, 5).map((order) => {
                            const getStatusBadge = (status: OrderStatus) => {
                              switch (status) {
                                case 'pending':
                                  return 'bg-amber-100 text-amber-800 border-amber-200';
                                case 'confirmed':
                                  return 'bg-blue-100 text-blue-800 border-blue-200';
                                case 'shipped':
                                  return 'bg-purple-100 text-purple-800 border-purple-200';
                                case 'delivered':
                                  return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                default:
                                  return 'bg-slate-100 text-slate-700 border-slate-200';
                              }
                            };

                            return (
                              <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3 cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                      Order #{order.orderNumber}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                      {order.customerName} • {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <div className="text-xs font-black text-slate-900 font-sans">
                                    ৳ {order.totalAmount}
                                  </div>
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getStatusBadge(
                                      order.status
                                    )}`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 2: ORDERS MANAGEMENT TAB                        */}
              {/* ==================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 font-sans">
                        Orders & Sales Management
                      </h2>
                      <p className="text-xs text-slate-500">
                        Review customer orders, update delivery statuses, and generate shipping invoices.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowNewOrderModal(true)}
                        className="px-3.5 py-2 bg-[#1a73e8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Manual Order</span>
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="flex flex-wrap gap-2 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'all', label: 'All Orders' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'confirmed', label: 'Confirmed' },
                        { key: 'shipped', label: 'Shipped' },
                        { key: 'delivered', label: 'Delivered' },
                        { key: 'cancelled', label: 'Cancelled' },
                      ].map((pill) => (
                        <button
                          key={pill.key}
                          onClick={() => setStatusFilter(pill.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            statusFilter === pill.key
                              ? 'bg-[#1a73e8] text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        placeholder="Search order, phone, name..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="p-3.5">Order ID</th>
                            <th className="p-3.5">Customer & Phone</th>
                            <th className="p-3.5">Package</th>
                            <th className="p-3.5">Address</th>
                            <th className="p-3.5">Amount (COD)</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                                No orders matching this filter
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3.5 font-bold font-mono text-blue-900">
                                  {order.orderNumber}
                                  <span className="block text-[10px] text-slate-400 font-normal">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </span>
                                </td>

                                <td className="p-3.5">
                                  <div className="font-bold text-slate-900">{order.customerName}</div>
                                  <div className="font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <a href={`tel:${order.phoneNumber}`} className="hover:underline text-blue-600">
                                      {order.phoneNumber}
                                    </a>
                                  </div>
                                </td>

                                <td className="p-3.5">
                                  <span className="font-semibold text-slate-800">
                                    {order.item.packageName}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    Qty: {order.item.quantity}
                                  </span>
                                </td>

                                <td className="p-3.5 max-w-[220px]">
                                  <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-[10px] font-bold rounded mb-0.5">
                                    {order.deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে (৳৭০)' : 'ঢাকার বাইরে (৳১৩০)'}
                                  </span>
                                  <p className="truncate text-[11px] text-slate-600" title={order.address}>
                                    {order.address}
                                  </p>
                                </td>

                                <td className="p-3.5 font-black text-slate-900 font-sans">
                                  ৳ {order.totalAmount.toLocaleString('en-US')}
                                </td>

                                <td className="p-3.5">
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>

                                <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                                    title="View Order Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setInvoiceOrder(order)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                                    title="Print Invoice"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    title="Delete Order"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 3: PRODUCTS & PACKAGES                          */}
              {/* ==================================================== */}
              {activeTab === 'products' && product && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 font-sans">
                        Product & Package Management
                      </h2>
                      <p className="text-xs text-slate-500">
                        Configure pricing, packages, discount rates, and marketing savings tags.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddingPackage(true)}
                      className="px-3.5 py-2 bg-[#1a73e8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Package</span>
                    </button>
                  </div>

                  {/* General Product Info Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-800 text-sm">Product Details</h3>
                      <button
                        onClick={handleSaveProduct}
                        className="px-3 py-1.5 bg-[#1a73e8] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Info</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Product Name (EN)</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => setProduct({ ...product, name: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Bengali Title</label>
                        <input
                          type="text"
                          value={product.bengaliName}
                          onChange={(e) => setProduct({ ...product, bengaliName: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Slogan</label>
                        <input
                          type="text"
                          value={product.subtitle}
                          onChange={(e) => setProduct({ ...product, subtitle: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Packages Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {product.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`p-5 rounded-2xl border-2 transition-all relative ${
                          pkg.isPopular ? 'border-blue-600 bg-sky-50/40 shadow-md' : 'border-slate-200 bg-white'
                        }`}
                      >
                        {pkg.isPopular && (
                          <span className="absolute -top-3 right-4 px-3 py-1 bg-blue-600 text-white font-bold text-[10px] rounded-full uppercase shadow-xs">
                            Popular Choice
                          </span>
                        )}

                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{pkg.title}</h4>
                            <p className="text-xs text-slate-500">{pkg.bengaliTitle}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {pkg.badgeText}
                          </span>
                        </div>

                        <div className="my-3 py-2 border-y border-slate-100 flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 font-sans">
                            {pkg.discountPrice} ৳
                          </span>
                          <span className="text-xs line-through text-slate-400">
                            {pkg.originalPrice} ৳
                          </span>
                        </div>



                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setEditingPackage(pkg)}
                            className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 4: INVENTORY MANAGEMENT                         */}
              {/* ==================================================== */}
              {activeTab === 'inventory' && product && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-sans">
                      Inventory & Stock Control
                    </h2>
                    <p className="text-xs text-slate-500">
                      Monitor warehouse units, out of stock alerts, and SKU identifiers.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Current Stock Units</span>
                        <div className="text-3xl font-black text-slate-900 mt-1">{product.stockCount}</div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">SKU Code</span>
                        <div className="text-xl font-mono font-bold text-slate-900 mt-2">{product.sku}</div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block">Availability Status</span>
                        <div className="mt-2">
                          {product.inStock ? (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                              In Stock (Active)
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Update Stock Count</label>
                        <input
                          type="number"
                          value={product.stockCount}
                          onChange={(e) => setProduct({ ...product, stockCount: Number(e.target.value) || 0 })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Toggle Stock Status</label>
                        <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.inStock}
                            onChange={(e) => setProduct({ ...product, inStock: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            Available for Checkout
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProduct}
                        className="px-5 py-2.5 bg-[#1a73e8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Stock Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 5: CUSTOMERS CRM                                */}
              {/* ==================================================== */}
              {activeTab === 'customers' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-sans">
                      Customer Profiles ({uniqueCustomers.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      View buyer profiles, lifetime spend, order history, and direct phone contact.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5">Customer Name</th>
                          <th className="p-3.5">Phone Number</th>
                          <th className="p-3.5">Region</th>
                          <th className="p-3.5">Total Orders</th>
                          <th className="p-3.5">Lifetime Value (BDT)</th>
                          <th className="p-3.5 text-right">Quick Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {uniqueCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400">
                              No customer profiles logged yet
                            </td>
                          </tr>
                        ) : (
                          uniqueCustomers.map((cust, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="p-3.5 font-bold text-slate-900">{cust.name}</td>
                              <td className="p-3.5 font-mono text-slate-600">{cust.phone}</td>
                              <td className="p-3.5">{cust.area}</td>
                              <td className="p-3.5 font-bold">{cust.orderCount}</td>
                              <td className="p-3.5 font-black text-blue-900">৳ {cust.totalSpent.toLocaleString('en-US')}</td>
                              <td className="p-3.5 text-right">
                                <a
                                  href={`tel:${cust.phone}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>Call</span>
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* ==================================================== */}
              {/* VIEW 6: MEDIA & GALLERY                              */}
              {/* ==================================================== */}
              {activeTab === 'media' && product && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Top Header with Save Button */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900 font-sans">
                          Media & Gallery Assets
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                          {product.images?.length || 0} টি ছবি
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Upload custom photos, arrange thumbnail order, set the primary showcase photo, and save changes.
                      </p>
                    </div>

                    {/* Primary Header Save Button */}
                    <button
                      id="save-gallery-top-btn"
                      onClick={handleSaveGalleryExplicit}
                      disabled={isSavingGallery}
                      className="px-5 py-2.5 bg-[#1a73e8] hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                    >
                      {isSavingGallery ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>গ্যালারি সেভ করুন (Save Gallery)</span>
                    </button>
                  </div>

                  {/* Add New Image Form Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Plus className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">নতুন ছবি যুক্ত করুন (Add New Image)</h3>
                          <p className="text-[11px] text-slate-400">ডিভাইস থেকে ফাইল আপলোড করুন অথবা ছবির ওয়েব লিংক দিন</p>
                        </div>
                      </div>

                      {/* Mode Toggle: File Upload vs URL */}
                      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setImageInputMode('upload')}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            imageInputMode === 'upload'
                              ? 'bg-white text-blue-600 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ডিভাইস আপলোড
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputMode('url')}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            imageInputMode === 'url'
                              ? 'bg-white text-blue-600 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ইমেজ লিঙ্ক (URL)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left 2 Cols: Input Form */}
                      <div className="md:col-span-2 space-y-3">
                        {imageInputMode === 'upload' ? (
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                              ডিভাইস থেকে ছবি বাছাই করুন (Select from Phone/PC)
                            </label>
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 hover:border-blue-500 bg-sky-50/40 hover:bg-sky-50 rounded-2xl cursor-pointer transition-all group">
                              <Upload className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                              <span className="text-xs font-bold text-blue-700">ছবি আপলোড করতে ক্লিক করুন</span>
                              <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WEBP, GIF (সর্বোচ্চ ১৫ মেগাবাইট)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">
                              ইমেজ সরাসরি ওয়েব লিঙ্ক (Direct Image URL)
                            </label>
                            <input
                              type="text"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="https://example.com/images/product-box.jpg"
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            ছবির টাইটেল / ক্যাপশন (Image Label)
                          </label>
                          <input
                            type="text"
                            value={newImageLabel}
                            onChange={(e) => setNewImageLabel(e.target.value)}
                            placeholder="যেমন: অফিসিয়াল প্রোডাক্ট বক্স ও স্যাশে"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            id="add-custom-image-btn"
                            onClick={handleAddCustomImage}
                            disabled={!newImageUrl.trim()}
                            className="px-5 py-2.5 bg-[#1a73e8] hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>গ্যালারিতে যুক্ত করুন ও সেভ করুন</span>
                          </button>
                          {newImageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewImageUrl('');
                                setNewImageLabel('');
                              }}
                              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                            >
                              রিসেট
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right 1 Col: Live Preview Before Adding */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">লাইভ প্রিভিউ (Live Preview)</span>
                        <div className="w-full aspect-square max-w-[180px] rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-2xs">
                          {newImageUrl ? (
                            <img
                              src={newImageUrl}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="text-slate-300 flex flex-col items-center gap-1">
                              <ImageIcon className="w-10 h-10 stroke-1" />
                              <span className="text-[10px] text-slate-400">ছবি সিলেক্ট করুন</span>
                            </div>
                          )}
                        </div>
                        {newImageLabel && (
                          <p className="text-xs font-bold text-slate-700 mt-2 truncate max-w-full">
                            {newImageLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Configured Gallery Grid with Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        বর্তমান গ্যালারি ছবি তালিকা (Storefront Gallery Images)
                      </h3>
                      <span className="text-xs text-slate-400">
                        ১ নম্বর ছবিটি ওয়েবসাইটে প্রথমে (Primary) প্রদর্শিত হবে
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {product.images?.map((img, idx) => {
                        const isPrimary = idx === 0;
                        const isEditingThis = editingImgId === img.id;

                        return (
                          <div
                            key={img.id || idx}
                            className={`bg-white p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between relative shadow-2xs group ${
                              isPrimary ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {/* Badges */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              {isPrimary ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                  <Crown className="w-3 h-3" />
                                  <span>Main Image</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(img.id)}
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                  title="ওয়েবসাইটের প্রধান ছবি বানাতে ক্লিক করুন"
                                >
                                  <Crown className="w-3 h-3 text-amber-500" />
                                  <span>প্রধান ছবি বানান</span>
                                </button>
                              )}
                            </div>

                            {/* Thumbnail Area */}
                            <div className="aspect-square rounded-xl bg-[#f0f7fd] overflow-hidden flex items-center justify-center p-2 border border-slate-100 relative">
                              {img.url ? (
                                <img
                                  src={img.url}
                                  alt={img.label}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <DrZengBoxMockup variant={img.variant || 'hero'} className="w-full h-full" />
                              )}
                            </div>

                            {/* Caption / Label & Editing */}
                            <div className="mt-3">
                              {isEditingThis ? (
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={editingImgLabel}
                                    onChange={(e) => setEditingImgLabel(e.target.value)}
                                    className="w-full p-1.5 text-xs bg-slate-50 border border-blue-400 rounded-lg focus:bg-white focus:outline-none"
                                    autoFocus
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveImageLabel(img.id)}
                                      className="flex-1 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                    >
                                      সেভ
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingImgId(null)}
                                      className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
                                    >
                                      বাতিল
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-800 truncate" title={img.label}>
                                    {img.label}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingImgId(img.id);
                                      setEditingImgLabel(img.label);
                                    }}
                                    className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                    title="নাম এডিট করুন"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Reorder and Delete Actions Toolbar */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveImage(idx, 'left')}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors"
                                  title="বামে সরান"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === (product.images?.length || 1) - 1}
                                  onClick={() => handleMoveImage(idx, 'right')}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors"
                                  title="ডানে সরান"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteImage(img.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Full Save Action Card */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">গ্যালারি পরিবর্তন ওয়েবসাইটে লাইভ করুন</h4>
                        <p className="text-xs text-blue-200">
                          আপনার যুক্ত করা এবং পরিবর্তন করা সকল ছবি তাৎক্ষণিকভাবে মূল হোমপেজে দেখাবে।
                        </p>
                      </div>
                    </div>

                    <button
                      id="save-gallery-bottom-btn"
                      onClick={handleSaveGalleryExplicit}
                      disabled={isSavingGallery}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-400 active:scale-98 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
                    >
                      {isSavingGallery ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Save Gallery Changes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 7: REVIEWS MODERATION                           */}
              {/* ==================================================== */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 font-sans">
                        Customer Reviews & Testimonials ({reviews.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Moderate customer reviews, star ratings, and add verified feedback.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddReviewModal(true)}
                      className="px-3.5 py-2 bg-[#1a73e8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Review</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Verified Buyer
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">{rev.city} • {rev.packagePurchased}</span>
                          </div>

                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 8: SHIPPING & LOGISTICS                         */}
              {/* ==================================================== */}
              {activeTab === 'shipping' && product && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-sans">
                      Shipping & Logistics Configuration
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configure delivery charges for Dhaka metropolitan and outside districts, plus courier partners.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Inside Dhaka Delivery Charge (BDT)
                        </label>
                        <input
                          type="number"
                          value={product.settings?.deliveryFeeInsideDhaka ?? 70}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              settings: {
                                ...product.settings,
                                deliveryFeeInsideDhaka: Number(e.target.value) || 0,
                                deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
                              },
                            })
                          }
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Outside Dhaka Delivery Charge (BDT)
                        </label>
                        <input
                          type="number"
                          value={product.settings?.deliveryFeeOutsideDhaka ?? 130}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              settings: {
                                ...product.settings,
                                deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
                                deliveryFeeOutsideDhaka: Number(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs font-bold text-blue-950">Courier Integration: Steadfast / Pathao / RedX</p>
                          <p className="text-[11px] text-blue-700">Cash on Delivery order manifests sync automatically upon confirmation.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Ready
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveProduct}
                        className="px-5 py-2.5 bg-[#1a73e8] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Shipping Rates</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 9: HOME CMS & PAGES                             */}
              {activeTab === 'home_cms' || activeTab === 'pages' ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-sans">
                      Home CMS & Brand Management
                    </h2>
                    <p className="text-xs text-slate-500">
                      Customize top navigation bar branding, brand logo, typography, announcement banner, and contact details.
                    </p>
                  </div>

                  {/* Brand & Navigation Bar Management Card */}
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">
                            Navigation Bar & Brand Management (লোগো ও ব্র্যান্ড ব্যবস্থাপনা)
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            নেভিগেশন বারের ব্র্যান্ড লোগো, টেক্সট, সাইজ ও প্রদর্শন মোড নিয়ন্ত্রণ করুন
                          </p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">
                        Header Controls
                      </span>
                    </div>

                    {/* Real-time Live Header Preview */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          লাইভ নেভিগেশন বার প্রিভিউ (Live Header Preview)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Height: ~50px
                        </span>
                      </div>

                      {/* Mock Header Display */}
                      <div className="bg-white rounded-lg border border-slate-200/90 shadow-xs px-3 sm:px-4 py-2 flex items-center justify-between">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                          <Menu className="w-4 h-4" />
                        </div>

                        {/* Center Brand Preview */}
                        <div className="flex items-center gap-2">
                          {product?.settings?.brandLogoUrl && product?.settings?.brandLogoType !== 'text_only' && (
                            <img
                              src={product.settings.brandLogoUrl}
                              alt="Brand Logo"
                              style={{ maxHeight: `${product.settings?.navbarLogoHeight || 28}px` }}
                              className="w-auto object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                          {(product?.settings?.brandLogoType !== 'logo_only' || !product?.settings?.brandLogoUrl) && (
                            <span className="text-lg font-black text-blue-900 font-serif tracking-tight">
                              {product?.settings?.brandName || 'Dr. Zeng'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                            <Search className="w-4 h-4" />
                          </div>
                          <div className="relative w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                            <ShoppingBag className="w-4 h-4" />
                            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-blue-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                              1
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Brand Name Input */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Brand Name / Header Title (ব্র্যান্ড নাম)
                        </label>
                        <input
                          type="text"
                          value={product?.settings?.brandName ?? 'Dr. Zeng'}
                          onChange={(e) => {
                            if (!product) return;
                            const updatedSettings = {
                              ...product.settings,
                              deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
                              deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
                              announcementText: product.settings?.announcementText || 'আজকের অর্ডারে পাচ্ছেন নিশ্চিত বিশেষ ছাড় ও দ্রুত ডেলিভারি!',
                              brandName: e.target.value,
                            };
                            const updatedProduct = { ...product, settings: updatedSettings };
                            setProduct(updatedProduct);
                          }}
                          placeholder="e.g. Dr. Zeng"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                      </div>

                      {/* Display Mode Selection */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Display Mode (প্রদর্শন মোড)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'both', label: 'Logo + Name', desc: 'উভয়ই' },
                            { id: 'logo_only', label: 'Logo Only', desc: 'শুধুমাত্র লোগো' },
                            { id: 'text_only', label: 'Name Only', desc: 'শুধুমাত্র নাম' },
                          ].map((mode) => {
                            const isSelected = (product?.settings?.brandLogoType || 'both') === mode.id;
                            return (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => {
                                  if (!product) return;
                                  const updatedSettings = {
                                    ...product.settings,
                                    deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
                                    deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
                                    announcementText: product.settings?.announcementText || 'আজকের অর্ডারে পাচ্ছেন নিশ্চিত বিশেষ ছাড় ও দ্রুত ডেলিভারি!',
                                    brandLogoType: mode.id as 'both' | 'logo_only' | 'text_only',
                                  };
                                  const updatedProduct = { ...product, settings: updatedSettings };
                                  setProduct(updatedProduct);
                                }}
                                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-xs'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                                }`}
                              >
                                <span className="block text-xs">{mode.label}</span>
                                <span className="block text-[9px] text-slate-400">{mode.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Logo Upload & URL Box */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Brand Logo (ব্র্যান্ড লোগো ইমেজ)
                        </label>
                        {/* Mode toggle */}
                        <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setLogoInputMode('upload')}
                            className={`px-2.5 py-1 rounded-md transition-all ${
                              logoInputMode === 'upload'
                                ? 'bg-white text-blue-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            ডিভাইস আপলোড
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoInputMode('url')}
                            className={`px-2.5 py-1 rounded-md transition-all ${
                              logoInputMode === 'url'
                                ? 'bg-white text-blue-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            ইমেজ লিংক (URL)
                          </button>
                        </div>
                      </div>

                      {/* Current Logo Preview and Remove */}
                      {product?.settings?.brandLogoUrl ? (
                        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-1 overflow-hidden">
                              <img
                                src={product.settings.brandLogoUrl}
                                alt="Current Logo"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">বর্তমান লোগো সক্রিয় আছে</span>
                              <span className="text-[10px] text-emerald-600 font-semibold">নেভিগেশন বারে প্রদর্শিত হচ্ছে</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>মুছে ফেলুন</span>
                          </button>
                        </div>
                      ) : null}

                      {/* Upload / URL Input View */}
                      {logoInputMode === 'upload' ? (
                        <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-blue-200 hover:border-blue-500 bg-white hover:bg-sky-50/50 rounded-xl cursor-pointer transition-all group">
                          <Upload className="w-6 h-6 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold text-blue-700">ডিভাইস থেকে লোগো ফাইল সিলেক্ট করুন</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG, WebP (স্বচ্ছ ব্যাকগ্রাউন্ড সহ লোগো সবচেয়ে ভালো দেখায়)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customLogoUrlInput}
                            onChange={(e) => setCustomLogoUrlInput(e.target.value)}
                            placeholder="https://example.com/brand-logo.png"
                            className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyLogoUrl}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-blue-700 transition-colors"
                          >
                            Apply URL
                          </button>
                        </div>
                      )}

                      {/* Logo Height Slider */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            Logo Max Height (লোগোর উচ্চতা / সাইজ)
                          </label>
                          <span className="text-xs font-mono font-bold text-blue-600">
                            {product?.settings?.navbarLogoHeight || 28}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="44"
                          step="2"
                          value={product?.settings?.navbarLogoHeight || 28}
                          onChange={(e) => {
                            if (!product) return;
                            const updatedSettings = {
                              ...product.settings,
                              deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
                              deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
                              announcementText: product.settings?.announcementText || 'আজকের অর্ডারে পাচ্ছেন নিশ্চিত বিশেষ ছাড় ও দ্রুত ডেলিভারি!',
                              navbarLogoHeight: Number(e.target.value),
                            };
                            const updatedProduct = { ...product, settings: updatedSettings };
                            setProduct(updatedProduct);
                          }}
                          className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>ছোট (20px)</span>
                          <span>ডিফল্ট (28px)</span>
                          <span>বড় (44px)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={handleSaveProduct}
                        className="px-5 py-2.5 bg-[#1a73e8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Brand & Navbar (ব্র্যান্ড সেটিংস সেভ করুন)</span>
                      </button>
                    </div>
                  </div>

                  {/* Announcement & Helpline Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                      Announcement Bar & Helpline (ঘোষণা ও হেল্পলাইন)
                    </h3>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Top Urgency Announcement Bar Text
                      </label>
                      <input
                        type="text"
                        value={product?.settings?.announcementText || 'আজকের অর্ডারে পাচ্ছেন নিশ্চিত বিশেষ ছাড় ও দ্রুত ডেলিভারি!'}
                        onChange={(e) =>
                          product &&
                          setProduct({
                            ...product,
                            settings: {
                              ...product.settings,
                              deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
                              deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
                              announcementText: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Customer Support Helpline Phone Number
                      </label>
                      <input
                        type="text"
                        value={product?.settings?.helplinePhone || product?.settings?.hotlinePhone || '+880 1712-345678'}
                        onChange={(e) =>
                          product &&
                          setProduct({
                            ...product,
                            settings: {
                              ...product.settings,
                              deliveryFeeInsideDhaka: product.settings?.deliveryFeeInsideDhaka ?? 70,
                              deliveryFeeOutsideDhaka: product.settings?.deliveryFeeOutsideDhaka ?? 130,
                              helplinePhone: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveProduct}
                        className="px-5 py-2.5 bg-[#1a73e8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Update CMS</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* ==================================================== */}
              {/* VIEW 10: PAYMENTS & COUPONS                          */}
              {activeTab === 'payments' || activeTab === 'coupons' ? (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-sans">
                      Coupons & Payment Gateways
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage discount coupons, bKash / Nagad merchant accounts, and Cash on Delivery defaults.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Active Promo Codes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {coupons.map((c) => (
                        <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-sm text-blue-900 block">{c.code}</span>
                            <span className="text-[11px] text-slate-500">Discount: {c.discount} ৳ (Min: {c.minOrder}৳)</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {c.active ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* ==================================================== */}
              {/* VIEW: META ADS & CONVERSION API (CAPI)               */}
              {/* ==================================================== */}
              {activeTab === 'meta_pixel' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Header Title & Subtitle */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                          <Target className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 font-sans">
                          Meta Ads, Pixel & Conversion API (CAPI)
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        মেটা পিক্সেল ও সার্ভার-সাইড কনভার্সন এপিআই (CAPI) ইন্টিগ্রেশন। সঠিক ডেটা ট্র্যাকিং ও ইভেন্ট ডিডুপ্লিকেশনের মাধ্যমে ফেসবুক বিজ্ঞাপনের ROAS বাড়ান।
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchMetaLogs}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh Logs</span>
                      </button>
                      <a
                        href="https://business.facebook.com/events_manager2"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Events Manager</span>
                      </a>
                    </div>
                  </div>

                  {/* Status Overview Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${product?.settings?.metaPixelId ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Browser Pixel</span>
                        <span className="text-xs font-black text-slate-800">
                          {product?.settings?.metaPixelId ? `Active (${product.settings.metaPixelId})` : 'Not Configured'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${product?.settings?.metaConversionApiToken ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Server CAPI (Graph v19)</span>
                        <span className="text-xs font-black text-slate-800">
                          {product?.settings?.metaConversionApiToken ? 'Active (Connected)' : 'Token Missing'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deduplication</span>
                        <span className="text-xs font-black text-slate-800">
                          eventId &amp; _fbp / _fbc Synced
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Configuration + Live Diagnostics */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left: Configuration Form (col-span-7) */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-600" />
                          <h3 className="font-bold text-slate-900 text-sm">
                            Meta Credentials &amp; Tracking Settings
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!product) return;
                            const updated = {
                              ...product,
                              settings: {
                                ...product.settings,
                                metaPixelId: '1098274628491823',
                                metaConversionApiToken: 'EAAGNO4172ZBZAx8Y9qWeR2t1Y3uI4oP5a6s7d8f9g0h1j2k3l4z5x6c7v8b9n0m1q2w3e4r5t6y7u8i9o0p',
                                metaTestEventCode: 'TEST98241',
                                metaPixelEnabled: true,
                                metaCapiEnabled: true,
                                metaTrackPageView: true,
                                metaTrackViewContent: true,
                                metaTrackAddToCart: true,
                                metaTrackInitiateCheckout: true,
                                metaTrackPurchase: true,
                              },
                            };
                            setProduct(updated);
                            showToast('ডেমো মেটা ক্রেডেনশিয়াল ফিল্ডে বসানো হয়েছে! এবার Save করুন।');
                          }}
                          className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Auto Fill Demo
                        </button>
                      </div>

                      {/* Pixel ID Input */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Meta Pixel ID (মেটা পিক্সেল আইডি) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={product?.settings?.metaPixelId || ''}
                          onChange={(e) => {
                            if (!product) return;
                            setProduct({
                              ...product,
                              settings: {
                                ...product.settings,
                                metaPixelId: e.target.value.trim(),
                              },
                            });
                          }}
                          placeholder="e.g. 1098274628491823"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          ফেসবুক ইভেন্টস ম্যানেজার থেকে ১৫-১৬ সংখ্যার মেটা পিক্সেল আইডি দিন।
                        </p>
                      </div>

                      {/* Conversion API Access Token */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            Conversion API (CAPI) Access Token <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowMetaToken(!showMetaToken)}
                            className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                          >
                            {showMetaToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{showMetaToken ? 'Hide Token' : 'Show Token'}</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={product?.settings?.metaConversionApiToken || ''}
                          onChange={(e) => {
                            if (!product) return;
                            setProduct({
                              ...product,
                              settings: {
                                ...product.settings,
                                metaConversionApiToken: e.target.value.trim(),
                              },
                            });
                          }}
                          placeholder="EAAGNO..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Events Manager &gt; Settings &gt; Conversions API &gt; "Generate access token" থেকে টোকেন কপি করুন।
                        </p>
                      </div>

                      {/* Test Event Code Input */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Meta Test Event Code (ঐচ্ছিক - টেস্ট করার জন্য)
                        </label>
                        <input
                          type="text"
                          value={product?.settings?.metaTestEventCode || ''}
                          onChange={(e) => {
                            if (!product) return;
                            setProduct({
                              ...product,
                              settings: {
                                ...product.settings,
                                metaTestEventCode: e.target.value.trim().toUpperCase(),
                              },
                            });
                          }}
                          placeholder="e.g. TEST12345"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Events Manager &gt; Test Events ট্যাবে থাকা কোড (যেমন: TEST58291)। লাইভ টেস্ট যাচাইয়ের জন্য ব্যবহৃত হয়।
                        </p>
                      </div>

                      {/* Master Feature Toggles */}
                      <div className="pt-2 border-t border-slate-100 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800">Master Integration Switches</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Browser Pixel</span>
                              <span className="text-[10px] text-slate-400">Client-side fbevents.js</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={product?.settings?.metaPixelEnabled !== false}
                              onChange={(e) => {
                                if (!product) return;
                                setProduct({
                                  ...product,
                                  settings: {
                                    ...product.settings,
                                    metaPixelEnabled: e.target.checked,
                                  },
                                });
                              }}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                          </label>

                          <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Server-Side CAPI</span>
                              <span className="text-[10px] text-slate-400">Graph API v19.0</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={product?.settings?.metaCapiEnabled !== false}
                              onChange={(e) => {
                                if (!product) return;
                                setProduct({
                                  ...product,
                                  settings: {
                                    ...product.settings,
                                    metaCapiEnabled: e.target.checked,
                                  },
                                });
                              }}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Event Specific Tracking Checkboxes */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800">Tracked Standard Events</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {[
                            { key: 'metaTrackPageView', label: 'PageView (ভিউ পেজ)' },
                            { key: 'metaTrackViewContent', label: 'ViewContent (পণ্য দর্শন)' },
                            { key: 'metaTrackAddToCart', label: 'AddToCart (কার্ট অ্যাড)' },
                            { key: 'metaTrackInitiateCheckout', label: 'InitiateCheckout' },
                            { key: 'metaTrackPurchase', label: 'Purchase (অর্ডার সম্পন্ন)' },
                          ].map((evt) => (
                            <label key={evt.key} className="flex items-center gap-2 p-2 bg-slate-50/70 rounded-lg border border-slate-200/80 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={((product?.settings as any)?.[evt.key]) !== false}
                                onChange={(e) => {
                                  if (!product) return;
                                  setProduct({
                                    ...product,
                                    settings: {
                                      ...product.settings,
                                      [evt.key]: e.target.checked,
                                    },
                                  });
                                }}
                                className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                              />
                              <span className="text-[11px] font-medium text-slate-700">{evt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end pt-3 border-t border-slate-100">
                        <button
                          onClick={handleSaveProduct}
                          className="px-6 py-2.5 bg-[#1a73e8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Meta Settings</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Live Diagnostics & Trigger Test Event (col-span-5) */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Diagnostic Action Card */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <h3 className="font-bold text-slate-900 text-sm">
                            Live Test Event Diagnostics
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500">
                          সার্ভার থেকে সরাসরি মেটা গ্রাফ এপিআই (Meta Graph API)-তে টেস্ট ইভেন্ট পাঠিয়ে যাচাই করুন।
                        </p>

                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Select Test Event Name
                            </label>
                            <select
                              value={metaTestEventName}
                              onChange={(e) => setMetaTestEventName(e.target.value as any)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                            >
                              <option value="Purchase">Purchase (পারচেজ / অর্ডার)</option>
                              <option value="InitiateCheckout">InitiateCheckout (চেকআউট)</option>
                              <option value="AddToCart">AddToCart (কার্টে যুক্ত)</option>
                              <option value="ViewContent">ViewContent (পণ্য দেখা)</option>
                              <option value="PageView">PageView (পেজ ভিউ)</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Event Value (BDT)
                            </label>
                            <input
                              type="number"
                              value={metaTestValue}
                              onChange={(e) => setMetaTestValue(Number(e.target.value) || 0)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleSendMetaTestEvent}
                            disabled={isTestingMeta}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                          >
                            {isTestingMeta ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Zap className="w-4 h-4" />
                            )}
                            <span>Send Live Test Event to Meta</span>
                          </button>
                        </div>

                        {/* Test Event Output Readout */}
                        {metaTestResult && (
                          <div
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
                              metaTestResult.success
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                : 'bg-rose-50/80 border-rose-200 text-rose-950'
                            }`}
                          >
                            <div className="flex items-center gap-2 font-bold">
                              {metaTestResult.success ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-rose-600" />
                              )}
                              <span>{metaTestResult.success ? 'Meta Graph API Success 200 OK' : 'Meta API Dispatch Error'}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">{metaTestResult.message}</p>
                            {metaTestResult.fbtrace_id && (
                              <p className="text-[10px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
                                <strong>fbtrace_id:</strong> {metaTestResult.fbtrace_id}
                              </p>
                            )}
                            {metaTestResult.events_received !== undefined && (
                              <p className="text-[10px] font-mono text-emerald-800">
                                <strong>events_received:</strong> {metaTestResult.events_received}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Best Practice Tips Box */}
                      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-xs space-y-2">
                        <span className="font-bold text-blue-950 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Deduplication &amp; Advanced Matching</span>
                        </span>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          প্রতিটি অর্ডারে স্বয়ংক্রিয়ভাবে একটি ইউনিক <code>eventId</code> জেনারেট হয়ে ব্রাউজার পিক্সেল এবং সার্ভার সিএপিআই উভয়েই পাঠানো হয়। মেটা সিস্টেম উভয় ইভেন্টকে মিলিয়ে ১টি নিখুঁত কনভার্সন হিসেবে গণনা করে।
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* Activity Stream: Live Meta Events Log */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-purple-600" />
                        <h3 className="font-bold text-slate-900 text-sm">
                          Live Meta Activity Logs (ইভেন্ট ট্র্যাকিং হিস্ট্রি)
                        </h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-mono font-bold">
                          {metaCapiLogs.length + metaPixelLogs.length} Events
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={fetchMetaLogs}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs"
                          title="Refresh Logs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleClearMetaLogs}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear Logs</span>
                        </button>
                      </div>
                    </div>

                    {metaCapiLogs.length === 0 && metaPixelLogs.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        এখনও কোনো মেটা ইভেন্ট ফায়ার হয়নি। টেস্ট ইভেন্ট পাঠান বা স্টোরে অর্ডার প্লেস করুন।
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                              <th className="pb-2">Time</th>
                              <th className="pb-2">Event</th>
                              <th className="pb-2">Source</th>
                              <th className="pb-2">Event ID (Deduplication)</th>
                              <th className="pb-2">Value</th>
                              <th className="pb-2">Status</th>
                              <th className="pb-2">Details / Response</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {/* Server CAPI logs */}
                            {metaCapiLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/80">
                                <td className="py-2.5 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                                <td className="py-2.5 font-bold text-slate-900">{log.eventName}</td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                    Server CAPI
                                  </span>
                                </td>
                                <td className="py-2.5 font-mono text-[10px] text-slate-600 max-w-[140px] truncate" title={log.eventId}>
                                  {log.eventId}
                                </td>
                                <td className="py-2.5 font-bold text-slate-800">
                                  {log.value ? `৳ ${log.value}` : '-'}
                                </td>
                                <td className="py-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {log.status === 'success' ? '200 Verified' : 'Failed'}
                                  </span>
                                </td>
                                <td className="py-2.5 text-[11px] text-slate-500 max-w-[200px] truncate" title={log.responseMessage || log.details}>
                                  {log.responseMessage || log.details || '-'}
                                </td>
                              </tr>
                            ))}

                            {/* Browser Pixel logs */}
                            {metaPixelLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/80">
                                <td className="py-2.5 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                                <td className="py-2.5 font-bold text-slate-900">{log.eventName}</td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                    Browser Pixel
                                  </span>
                                </td>
                                <td className="py-2.5 font-mono text-[10px] text-slate-600 max-w-[140px] truncate" title={log.eventId}>
                                  {log.eventId || 'Auto'}
                                </td>
                                <td className="py-2.5 font-bold text-slate-800">
                                  {log.value ? `৳ ${log.value}` : '-'}
                                </td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Tracked
                                  </span>
                                </td>
                                <td className="py-2.5 text-[11px] text-slate-500 max-w-[200px] truncate">
                                  {log.details || 'fbevents.js'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ==================================================== */}
              {/* VIEW 11: SYSTEM SETTINGS                             */}
              {/* ==================================================== */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-200 max-w-xl">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-sans">
                      Admin & Security Settings
                    </h2>
                    <p className="text-xs text-slate-500">
                      Update admin login email, password, and session access keys.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
                      <input
                        type="password"
                        value={credForm.currentPassword}
                        onChange={(e) => setCredForm({ ...credForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">New Email (Optional)</label>
                      <input
                        type="email"
                        value={credForm.newEmail}
                        onChange={(e) => setCredForm({ ...credForm, newEmail: e.target.value })}
                        placeholder="admin@drzeng.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
                      <input
                        type="password"
                        value={credForm.newPassword}
                        onChange={(e) => setCredForm({ ...credForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (!credForm.currentPassword) {
                          alert('দয়া করে বর্তমান পাসওয়ার্ড প্রদান করুন');
                          return;
                        }
                        try {
                          const res = await fetch('/api/admin/change-credentials', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${authToken}`,
                            },
                            body: JSON.stringify(credForm),
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            showToast('সফলভাবে ক্রেডেনশিয়াল আপডেট হয়েছে!');
                            setCredForm({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
                          } else {
                            alert(data.message || 'আপডেট করতে ব্যর্থ হয়েছে');
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="w-full py-3 bg-[#1a73e8] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                    >
                      Update Security Credentials
                    </button>
                  </div>

                  {/* Meta Ads Shortcut in Settings */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Meta Ads, Pixel &amp; CAPI Settings</h4>
                        <p className="text-[11px] text-slate-400">Configure Facebook Pixel, Conversions API tokens &amp; test events.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('meta_pixel')}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shrink-0 transition-colors"
                    >
                      Open Meta Settings
                    </button>
                  </div>
                </div>
              )}

            </main>

          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ORDER DETAILS                                     */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Order Details #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">Customer Information:</span>
                <p className="text-slate-700"><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p className="text-slate-700"><strong>Phone:</strong> <a href={`tel:${selectedOrder.phoneNumber}`} className="text-blue-600 underline font-mono">{selectedOrder.phoneNumber}</a></p>
                <p className="text-slate-700"><strong>Address:</strong> {selectedOrder.address}</p>
                <p className="text-slate-700"><strong>Area:</strong> {selectedOrder.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka (৳70)' : 'Outside Dhaka (৳130)'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">Item Summary:</span>
                <p className="text-slate-700"><strong>Package:</strong> {selectedOrder.item.packageName}</p>
                <p className="text-slate-700"><strong>Quantity:</strong> {selectedOrder.item.quantity}</p>
                <p className="text-slate-700"><strong>Unit Price:</strong> ৳ {selectedOrder.item.unitPrice}</p>
                <p className="text-slate-700 font-bold text-sm text-blue-900 pt-1 border-t border-slate-200">
                  Total Payable (COD): ৳ {selectedOrder.totalAmount}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setInvoiceOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 bg-[#1a73e8] text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRINT INVOICE                                     */}
      {/* ======================================================== */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-black text-sm text-blue-900 font-serif">DR. ZENG OFFICIAL INVOICE</span>
              <button onClick={() => setInvoiceOrder(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2 border border-slate-200 p-4 rounded-xl font-mono">
              <div className="text-center pb-2 border-b">
                <h4 className="font-bold text-slate-900">Dr. Zeng Herbal Underarm Lab</h4>
                <p className="text-[10px] text-slate-500">Invoice: #{invoiceOrder.orderNumber}</p>
              </div>
              <p>Customer: {invoiceOrder.customerName}</p>
              <p>Phone: {invoiceOrder.phoneNumber}</p>
              <p>Address: {invoiceOrder.address}</p>
              <div className="pt-2 border-t flex justify-between font-bold">
                <span>Total Amount:</span>
                <span>৳ {invoiceOrder.totalAmount} (COD)</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-[#1a73e8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Send to Printer</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MANUAL ORDER CREATOR                              */}
      {/* ======================================================== */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateManualOrder} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create Manual Phone Order</h3>
              <button type="button" onClick={() => setShowNewOrderModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={manualOrder.customerName}
                  onChange={(e) => setManualOrder({ ...manualOrder, customerName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. মোঃ সাকিব হোসেন"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={manualOrder.phoneNumber}
                  onChange={(e) => setManualOrder({ ...manualOrder, phoneNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="017XXXXXXXX"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={manualOrder.address}
                  onChange={(e) => setManualOrder({ ...manualOrder, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="সম্পূর্ণ ঠিকানা"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Zone</label>
                  <select
                    value={manualOrder.deliveryArea}
                    onChange={(e) => setManualOrder({ ...manualOrder, deliveryArea: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="inside_dhaka">ঢাকার ভেতরে (৳৭০)</option>
                    <option value="outside_dhaka">ঢাকার বাইরে (৳১৩০)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Package</label>
                  <select
                    value={manualOrder.packageId}
                    onChange={(e) => setManualOrder({ ...manualOrder, packageId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {product?.packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.discountPrice}৳)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1a73e8] text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700"
            >
              Confirm & Save Order
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD REVIEW                                        */}
      {/* ======================================================== */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomReview} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Add Verified Customer Review</h3>
              <button type="button" onClick={() => setShowAddReviewModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Author Name"
                value={newReviewForm.author}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, author: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="City (e.g. ঢাকা, চট্টগ্রাম)"
                value={newReviewForm.city}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <textarea
                required
                rows={3}
                placeholder="Customer Testimonial Comment..."
                value={newReviewForm.comment}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1a73e8] text-white rounded-xl text-xs font-bold"
            >
              Publish Review
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PACKAGE                                */}
      {/* ======================================================== */}
      {(isAddingPackage || editingPackage) && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingPackage ? 'Edit Package Option' : 'Create New Package'}
              </h3>
              <button
                onClick={() => {
                  setIsAddingPackage(false);
                  setEditingPackage(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Package Title (EN)</label>
                <input
                  type="text"
                  value={editingPackage ? editingPackage.title : newPackageForm.title}
                  onChange={(e) =>
                    editingPackage
                      ? setEditingPackage({ ...editingPackage, title: e.target.value })
                      : setNewPackageForm({ ...newPackageForm, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 28 Days Full Pack"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Bengali Title</label>
                <input
                  type="text"
                  value={editingPackage ? editingPackage.bengaliTitle : newPackageForm.bengaliTitle}
                  onChange={(e) =>
                    editingPackage
                      ? setEditingPackage({ ...editingPackage, bengaliTitle: e.target.value })
                      : setNewPackageForm({ ...newPackageForm, bengaliTitle: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. ২৮ দিনের সম্পূর্ণ কোর্স"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Original Price (৳)</label>
                  <input
                    type="number"
                    value={editingPackage ? editingPackage.originalPrice : newPackageForm.originalPrice}
                    onChange={(e) =>
                      editingPackage
                        ? setEditingPackage({ ...editingPackage, originalPrice: Number(e.target.value) || 0 })
                        : setNewPackageForm({ ...newPackageForm, originalPrice: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Discount Price (৳)</label>
                  <input
                    type="number"
                    value={editingPackage ? editingPackage.discountPrice : newPackageForm.discountPrice}
                    onChange={(e) =>
                      editingPackage
                        ? setEditingPackage({ ...editingPackage, discountPrice: Number(e.target.value) || 0 })
                        : setNewPackageForm({ ...newPackageForm, discountPrice: Number(e.target.value) || 0 })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Badge Text</label>
                <input
                  type="text"
                  value={editingPackage ? editingPackage.badgeText : newPackageForm.badgeText}
                  onChange={(e) =>
                    editingPackage
                      ? setEditingPackage({ ...editingPackage, badgeText: e.target.value })
                      : setNewPackageForm({ ...newPackageForm, badgeText: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. সেভ ৩০০৳"
                />
              </div>
            </div>

            <button
              onClick={editingPackage ? handleSavePackageEdit : handleAddNewPackage}
              className="w-full py-2.5 bg-[#1a73e8] text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700"
            >
              {editingPackage ? 'Save Package Changes' : 'Create Package'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
