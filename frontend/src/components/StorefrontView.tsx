import { AuthModal } from '../modules/auth/AuthModal';
import { OrderHistoryModal } from '../modules/orders/OrderHistoryModal';
import { CheckoutModal } from '../modules/checkout/CheckoutModal';
// @ts-ignore React is available at runtime; its type declarations are not installed.
import React, { useState, useEffect } from 'react';
import { StoreProduct, CATALOG_PRODUCTS } from '../data/storeProducts';
import { CartItem } from '../types';
import { UltronLogo } from './UltronLogo';
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  CreditCard,
  Building,
  Smartphone,
  Check,
  Server,
  Radio,
  AlertCircle,
  RefreshCw,
  Eye,
  BadgeCheck,
  MapPin,
  ArrowRight,
  User,
  LogOut,
  ListOrdered
} from 'lucide-react';

export const StorefrontView: React.FC = () => {
  // State
  const [products, setProducts] = useState<StoreProduct[]>(CATALOG_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'battery'>('featured');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  
  useEffect(() => {
    if (authToken) {
       // Just basic setup, normally we'd fetch profile
       try {
         const payload = JSON.parse(atob(authToken.split('.')[1]));
         setUserProfile(payload);
       } catch(e) { setAuthToken(null); }
    }
  }, [authToken]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string>('');

  // Server Connection & Standalone Mode state
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:4000');
  const [serverStatus, setServerStatus] = useState<'STANDALONE' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('CONNECTING');
  const [serverHealthMessage, setServerHealthMessage] = useState<string>('Connecting to Modular Monolith Backend...');
  const [sessionId] = useState<string>('session_' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const fetchLiveInventory = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/inventory/phones`);
        if (!res.ok) throw new Error('Gateway returned ' + res.status);
        const json = await res.json();
        
        if (json.success && json.data) {
          const liveProducts = json.data.map((row: any) => {
            const originalProduct = CATALOG_PRODUCTS.find(p => p.model === row.model_name) || CATALOG_PRODUCTS[0];
            return {
              ...originalProduct,
              id: row.id,
              imei: row.imei,
              serialNumber: row.serial_number,
              brand: row.brand,
              model: row.model_name,
              conditionGrade: row.condition_grade,
              batteryHealthPct: row.battery_health_percentage,
              cosmeticRating: row.cosmetic_scratches_rating,
              priceZar: Math.round(row.selling_price_cents / 100),
              warehouseLocation: `${row.warehouse_facility_code} / ${row.warehouse_bin_location}`,
              status: row.status
            };
          });
          setProducts(liveProducts.length > 0 ? liveProducts : CATALOG_PRODUCTS);
          setServerStatus('CONNECTED');
          setServerHealthMessage('Connected to live Modular Monolith API.');
        }
      } catch (err) {
        setServerStatus('OFFLINE');
        setServerHealthMessage('Microservices offline or unreachable. Operating in Standalone Mock Mode.');
      }
    };
    
    fetchLiveInventory();
    const interval = setInterval(fetchLiveInventory, 5000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Checkout flow state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [customerInfo, setCustomerInfo] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card'
  });
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  // Cart Lock countdown simulation
  const [lockTimeRemaining, setLockTimeRemaining] = useState<number>(900); // 15 minutes in seconds

  useEffect(() => {
    if (cart.length === 0) {
      setLockTimeRemaining(900);
      return;
    }
    const timer = setInterval(() => {
      setLockTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cart.length]);

  // Handle adding product to cart (Simulating Redlock Stock Hold)
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}) },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      localStorage.setItem('token', data.token);
      setAuthToken(data.token);
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
      if (data.user) {
         setCustomerInfo(prev => ({ ...prev, name: data.user.name || '', email: data.user.email || '' }));
      }
    } catch(err: any) {
      alert(err.message || "Authentication failed");
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/orders/history`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) setOrderHistory(data.data);
    } catch(err) {
      console.warn(err);
    }
  };
  
  useEffect(() => {
    if (showOrderHistory && authToken) fetchOrderHistory();
  }, [showOrderHistory, authToken]);

  const handleAddToCart = async (product: StoreProduct) => {
    if (product.status !== 'AVAILABLE') return;

    try {
      const res = await fetch(`${backendUrl}/api/v1/inventory/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei: product.imei, sessionId })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not hold stock');
      }
    } catch (err) {
      console.warn("API failed, falling back to local simulation.", err);
    }

    const newItem: CartItem = {
      phone: product,
      reservedAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    setCart((prev) => [...prev, newItem]);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, status: 'LOCKED_CHECKOUT_HOLD' as const } : p));
    setIsCartOpen(true);
  };

  // Handle removing product from cart (Releasing Redlock Stock Hold)
  const handleRemoveFromCart = async (productId: string) => {
    const itemToRemove = cart.find(i => i.phone.id === productId);
    if (itemToRemove) {
      try {
        await fetch(`${backendUrl}/api/v1/inventory/release`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imei: itemToRemove.phone.imei, sessionId })
        });
      } catch (err) {
        console.warn("API failed, falling back to local simulation.", err);
      }
    }

    setCart((prev) => prev.filter((item) => item.phone.id !== productId));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: 'AVAILABLE' as const } : p
      )
    );
  };

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.imei.includes(searchQuery);

    const matchesBrand = selectedBrand === 'ALL' || product.brand.toUpperCase() === selectedBrand.toUpperCase();
    const matchesGrade = selectedGrade === 'ALL' || product.conditionGrade === selectedGrade;

    return matchesSearch && matchesBrand && matchesGrade;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceZar - b.priceZar;
    if (sortBy === 'price-desc') return b.priceZar - a.priceZar;
    if (sortBy === 'battery') return b.batteryHealthPct - a.batteryHealthPct;
    return 0; // featured
  });

  // Calculate cart subtotal
  const subtotal = cart.reduce((acc, item) => acc + item.phone.priceZar, 0);
  const shippingCost = subtotal > 1500 || subtotal === 0 ? 0 : 150;
  const total = subtotal + shippingCost;

  // Format currency
  const formatZar = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Test ping to backend server
  const testBackendConnection = async () => {
    setServerStatus('CONNECTING');
    try {
      const res = await fetch(`${backendUrl}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setServerStatus('CONNECTED');
        setServerHealthMessage(`Connected to live ${data.service || 'backend'} service! Status: ${data.status}`);
      } else {
        setServerStatus('OFFLINE');
        setServerHealthMessage(`Backend responded with status ${res.status}. Falling back to Standalone Client Mode.`);
      }
    } catch (err: any) {
      setServerStatus('OFFLINE');
      setServerHealthMessage(`Could not reach backend at ${backendUrl}. Running in Standalone Client Mode (all UI features work 100% locally).`);
    }
  };

  // Complete checkout
  const handlePlaceOrder = async () => {
    if (customerInfo.paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      alert("Please fill in your card details.");
      return;
    }
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      alert("Please fill in your shipping details.");
      setCheckoutStep(1);
      return;
    }
    try {
      const items = cart.map((i) => i.phone);
      const totalCents = items.reduce((acc, curr) => acc + curr.priceZar, 0) * 100;
      
      const res = await fetch(`${backendUrl}/api/v1/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerInfo, 
          items, 
          sessionId,
          totalCents 
        })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Checkout failed');
      }

      setConfirmedOrderId(data.orderId || `ULT-${Math.floor(100000 + Math.random() * 900000)}`);
      setCheckoutStep(3);

      const boughtIds = items.map((i) => i.id);
      setProducts((prev) => prev.map((p) => (boughtIds.includes(p.id) ? { ...p, status: 'SOLD' as const } : p)));
      setCart([]);
    } catch (err) {
      console.warn("API failed, falling back to local simulation.", err);
      // Fallback
      const orderNum = `ULT-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedOrderId(orderNum);
      setCheckoutStep(3);
      const boughtIds = cart.map((i) => i.phone.id);
      setProducts((prev) => prev.map((p) => (boughtIds.includes(p.id) ? { ...p, status: 'SOLD' as const } : p)));
      setCart([]);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Header */}
      <div className="bg-transparent border-b border-black/[0.06] dark:border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <UltronLogo variant="icon" size="md" className="h-9 w-auto" />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
                ULTRON
              </h2>
              <span className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">Certified pre-owned store</span>
            </div>
            <p className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6] mt-0.5">
              Every device passes a 40-point inspection, with your stock held for 10 minutes at checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {authToken ? (
            <div className="flex items-center gap-1 mr-1">
              <button
                onClick={() => setShowOrderHistory(true)}
                className="px-3 py-2 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <ListOrdered className="w-4 h-4" /> Orders
              </button>
              <button
                onClick={() => { setAuthToken(null); localStorage.removeItem('token'); setUserProfile(null); }}
                className="p-2 text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3.5 py-2 rounded-full text-[13px] font-medium text-[#1d1d1f] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4" /> Sign in
            </button>
          )}

          <button
            onClick={() => setIsServerModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6] transition-colors"
            title="Backend connection settings"
          >
            <Radio className={`w-3.5 h-3.5 ${serverStatus === 'CONNECTED' ? 'text-[#1d7a3c]' : 'text-[#86868b]'}`} />
            <span>{serverStatus === 'CONNECTED' ? 'Live' : 'Demo mode'}</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[13px] transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#0071e3] text-[11px] font-semibold flex items-center justify-center ml-0.5">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[28px] bg-[#fbfbfd] dark:bg-[#1c1c1e] p-10 sm:p-16 lg:p-20 transition-colors duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="text-[15px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
              Apple iPhone 15 Pro Max
            </div>

            <h1 className="text-4xl sm:text-6xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight leading-[1.05]">
              Titanium. So strong.<br className="hidden sm:block" /> So light. So Pro.
            </h1>

            <p className="text-base sm:text-lg text-[#6e6e73] dark:text-[#a1a1a6] max-w-lg leading-relaxed">
              Certified Grade A+ mint condition, genuine Super Retina XDR display, and 98% original battery capacity — backed by a 12-month replacement warranty.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="flex items-center gap-1.5 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                40-point inspection
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1.5 rounded-full">
                <Truck className="w-3.5 h-3.5" />
                Free overnight delivery
              </span>
              <span className="flex items-center gap-1.5 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] bg-black/[0.04] dark:bg-white/[0.06] px-3 py-1.5 rounded-full">
                <RotateCcw className="w-3.5 h-3.5" />
                7-day returns
              </span>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-5">
              <div>
                <span className="text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">R22,499</span>
                <span className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6] ml-2">or R1,875/mo for 12 months</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const heroProduct = products.find((p) => p.id === 'ph_01') || products[0];
                    handleAddToCart(heroProduct);
                  }}
                  className="px-6 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-medium transition-all active:scale-95"
                >
                  Hold this device
                </button>
                <button
                  onClick={() => {
                    const heroProduct = products.find((p) => p.id === 'ph_01') || products[0];
                    setSelectedProduct(heroProduct);
                    setActiveModalImage(heroProduct.imageUrl);
                  }}
                  className="px-5 py-3 rounded-full text-[#0071e3] text-[15px] font-medium hover:underline transition-all flex items-center gap-1"
                >
                  <span>View specs</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hero Studio Image */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-sm">
              <img
                src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85"
                alt="Apple iPhone 15 Pro Max Natural Titanium"
                referrerPolicy="no-referrer"
                className="relative z-10 w-full max-h-80 sm:max-h-96 object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85';
                }}
              />
              <div className="text-center mt-3 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                Natural Titanium · 256GB · Grade A+
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & filters */}
      <div className="bg-transparent border-b border-black/[0.06] dark:border-white/10 pb-8 space-y-5 transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <input
              type="text"
              placeholder="Search by model, brand, or IMEI"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#f5f5f7] dark:bg-white/[0.06] rounded-full text-[14px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0071e3] text-[13px] font-medium"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-[#f5f5f7] dark:bg-white/[0.06] rounded-full px-4 py-3 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] outline-none w-full md:w-auto"
            >
              <option value="ALL">Any condition</option>
              <option value="MINT">Mint</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#f5f5f7] dark:bg-white/[0.06] rounded-full px-4 py-3 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] outline-none w-full md:w-auto"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="battery">Battery health</option>
            </select>
          </div>
        </div>

        {/* Brand tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[13px]">
          {['ALL', 'Apple', 'Samsung', 'Google', 'OnePlus'].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedBrand.toUpperCase() === brand.toUpperCase()
                  ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f]'
                  : 'bg-[#f5f5f7] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
              }`}
            >
              {brand === 'ALL' ? 'All devices' : brand}
            </button>
          ))}
          <span className="ml-auto text-[13px] text-[#6e6e73] dark:text-[#a1a1a6] whitespace-nowrap">
            {filteredProducts.length} available
          </span>
        </div>
      </div>

      {/* Product Catalog Grid (Apple iStore Device Cards with Real High-Res Photography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const isAvailable = product.status === 'AVAILABLE';
          const isHeldInCart = product.status === 'LOCKED_CHECKOUT_HOLD';
          const isSold = product.status === 'SOLD';

          return (
            <div
              key={product.id}
              className="bg-white dark:bg-[#1d1d1f] rounded-[22px] overflow-hidden flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Product Visual Container */}
              <div className="relative h-64 bg-[#f5f5f7] dark:bg-[#141414] p-8 flex items-center justify-center overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 ${
                      isAvailable
                        ? 'bg-white/90 dark:bg-black/50 text-[#1d7a3c]'
                        : isHeldInCart
                        ? 'bg-white/90 dark:bg-black/50 text-[#0071e3]'
                        : 'bg-white/90 dark:bg-black/50 text-[#86868b]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#1d7a3c]' : isHeldInCart ? 'bg-[#0071e3]' : 'bg-[#86868b]'}`} />
                    {isAvailable ? 'In stock' : isHeldInCart ? 'Reserved' : 'Sold out'}
                  </span>
                </div>

                {/* Grade Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 dark:bg-black/50 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Grade {product.conditionGrade}
                  </span>
                </div>

                {/* Real High-Resolution Studio Device Photograph */}
                <img
                  src={product.imageUrl}
                  alt={`${product.brand} ${product.model}`}
                  referrerPolicy="no-referrer"
                  className="relative z-10 h-48 w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Battery Pill */}
                <div className="absolute bottom-3.5 left-4 z-20 bg-white/90 dark:bg-black/50 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-[#1d7a3c]" />
                  <span>{product.batteryHealthPct}%</span>
                </div>

                {/* Warehouse Location Pill */}
                <div className="absolute bottom-3.5 right-4 z-20 bg-white/90 dark:bg-black/50 rounded-full px-2.5 py-1 text-[11px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#0071e3]" />
                  <span>{product.warehouseLocation.split('/')[0].trim()}</span>
                </div>
              </div>

              {/* Product Info & Specification */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    {product.colorSwatches && product.colorSwatches.length > 0 ? (
                      product.colorSwatches.map((swatch, idx) => (
                        <span
                          key={idx}
                          title={swatch.name}
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 dark:ring-white/20"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))
                    ) : (
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 dark:ring-white/20"
                        style={{ backgroundColor: product.imageColorHex }}
                      />
                    )}
                    <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6] ml-1">
                      {product.color}
                    </span>
                  </div>

                  <div className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
                    {product.brand} · {product.storageGb}GB
                  </div>

                  <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight mt-0.5">
                    {product.model}
                  </h3>

                  <p className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6] mt-1.5 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  <div className="mt-3.5 py-2 px-3 bg-[#f5f5f7] dark:bg-white/[0.06] rounded-lg text-[12px] text-[#6e6e73] dark:text-[#a1a1a6] flex items-center justify-between">
                    <span>IMEI</span>
                    <span className="text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">{product.imei}</span>
                  </div>
                </div>

                {/* Price and Financing Actions */}
                <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-baseline justify-between mb-1">
                    <div>
                      <span className="text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
                        {formatZar(product.priceZar)}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6] bg-[#f5f5f7] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full">
                      12mo warranty
                    </span>
                  </div>

                  <div className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6] mb-4">
                    or {formatZar(product.monthlyFinancingZar || Math.round(product.priceZar / 12))}/mo · 0% interest
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setActiveModalImage(product.imageUrl);
                      }}
                      className="px-3 py-2.5 rounded-full bg-[#f5f5f7] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick look</span>
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!isAvailable}
                      className={`px-3 py-2.5 rounded-full text-[13px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                        isAvailable
                          ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-95'
                          : 'bg-[#f5f5f7] dark:bg-white/[0.06] text-[#86868b] cursor-not-allowed'
                      }`}
                    >
                      <span>{isAvailable ? 'Hold stock' : isHeldInCart ? 'In bag' : 'Sold out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer / Bag */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1d1d1f] h-full flex flex-col justify-between shadow-2xl transition-colors duration-300">
            {/* Cart Header */}
            <div className="p-6 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Your bag ({cart.length})</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-full text-[#86868b] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Redlock Countdown Timer Banner */}
            {cart.length > 0 && (
              <div className="bg-[#f5f5f7] dark:bg-white/[0.04] px-6 py-3 flex items-center justify-between text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Stock reserved for</span>
                </div>
                <span className="font-medium text-[#1d1d1f] dark:text-white">
                  {formatTime(lockTimeRemaining)}
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 rounded-full bg-[#f5f5f7] dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-4 text-[#86868b]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-[15px] text-[#1d1d1f] dark:text-white font-medium">Your bag is empty</p>
                  <p className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6] mt-1 max-w-xs mx-auto">
                    Choose a certified pre-owned device to hold it for checkout.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.phone.id}
                    className="p-4 bg-[#f5f5f7] dark:bg-white/[0.04] rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.phone.imageUrl}
                        alt={item.phone.model}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-contain rounded-xl bg-white dark:bg-[#1d1d1f] p-1 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div>
                        <div className="text-[14px] font-medium text-[#1d1d1f] dark:text-white">{item.phone.model}</div>
                        <div className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6] mt-0.5">
                          {item.phone.storageGb}GB · {item.phone.color}
                        </div>
                        <div className="text-[11px] text-[#86868b] mt-1">
                          IMEI {item.phone.imei}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[14px] font-medium text-[#1d1d1f] dark:text-white">
                        {formatZar(item.phone.priceZar)}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.phone.id)}
                        className="text-[12px] text-[#0071e3] hover:underline mt-1.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-black/[0.06] dark:border-white/[0.08] space-y-4">
                <div className="space-y-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1d1d1f] dark:text-white font-medium">{formatZar(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-[#1d7a3c] font-medium">
                      {shippingCost === 0 ? 'Free' : formatZar(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[16px] font-semibold text-[#1d1d1f] dark:text-white pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08]">
                    <span>Total</span>
                    <span>{formatZar(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setCheckoutStep(1);
                  }}
                  className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[15px] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Check out</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 40-Point Diagnostic Inspection Modal (Apple-grade Tech Specs & Diagnostics) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#161617] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    40-POINT HARDWARE DIAGNOSTIC PASSPORT
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    100% PASSED
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
                  {selectedProduct.brand} {selectedProduct.model}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  IMEI: {selectedProduct.imei} • Serial: {selectedProduct.serialNumber} • Grade {selectedProduct.conditionGrade}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Device Studio Photo Showcase & Angles */}
            <div className="bg-gradient-to-b from-[#1d1d1f] to-[#121214] rounded-2xl p-6 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 blur-3xl pointer-events-none rounded-full"
                style={{ backgroundColor: selectedProduct.imageColorHex }}
              />

              {/* Main Image */}
              <img
                src={activeModalImage || selectedProduct.imageUrl}
                alt={selectedProduct.model}
                referrerPolicy="no-referrer"
                className="relative z-10 h-60 w-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)] transition-all duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Thumbnail Angles Selector */}
              {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 1 && (
                <div className="flex items-center gap-2.5 mt-4 z-10">
                  {selectedProduct.galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveModalImage(imgUrl)}
                      className={`w-12 h-12 rounded-xl bg-black/60 p-1 border transition-all ${
                        (activeModalImage || selectedProduct.imageUrl) === imgUrl
                          ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/20'
                          : 'border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Angle ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Battery & Health Stats */}
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-4 bg-slate-100 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">BATTERY HEALTH</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {selectedProduct.batteryHealthPct}%
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">OEM Peak Capacity</div>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">CYCLE COUNT</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {selectedProduct.batteryCycleCount}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Low Degradation</div>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">COSMETIC SCORE</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {selectedProduct.cosmeticRating}/10
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Grade {selectedProduct.conditionGrade} Mint</div>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2.5">
                Verified 40-Point Diagnostic Checklist:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {[
                  'Clean ESN & Unlocked (CheckMEND Database Passed)',
                  'Biometric Sensor & Face ID Latency Under 150ms',
                  'Original OLED Assembly & TrueTone Calibrated',
                  '5G Sub-6 & mmWave Radio Transceivers Tested',
                  'Dual Noise-Canceling Microphones & Speakers',
                  'Qi Wireless & Fast Wired Charging Rate Verified',
                  'IP68 Hermetic Barometric Chamber Seal Passed',
                  'Camera Sensors OIS, Lidar & Telephoto Alignment'
                ].map((check, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2.5">
                Factory Specifications:
              </h4>
              <div className="p-4 bg-slate-100 dark:bg-black/30 rounded-2xl border border-slate-200 dark:border-white/5 font-mono text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Display:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedProduct.specs.screen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Processor:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedProduct.specs.chipset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Memory & Storage:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedProduct.specs.ram} RAM • {selectedProduct.storageGb}GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Camera System:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedProduct.specs.camera}</span>
                </div>
              </div>
            </div>

            {/* In The Box */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
              <span className="font-bold text-slate-900 dark:text-white">Included Accessories: </span>
              {selectedProduct.inTheBox.join(' • ')}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatZar(selectedProduct.priceZar)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  or {formatZar(selectedProduct.monthlyFinancingZar || Math.round(selectedProduct.priceZar / 12))}/mo x 12
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2.5 rounded-full bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.status !== 'AVAILABLE'}
                  className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Bag & Hold Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Checkout Modal */}
      
      {/* Auth Modal */}
      <AuthModal 
        showAuthModal={showAuthModal} 
        setShowAuthModal={setShowAuthModal} 
        authMode={authMode} 
        setAuthMode={setAuthMode} 
        authForm={authForm} 
        setAuthForm={setAuthForm} 
        handleAuth={handleAuth} 
      />

      <OrderHistoryModal 
        showOrderHistory={showOrderHistory} 
        setShowOrderHistory={setShowOrderHistory} 
        orderHistory={orderHistory} 
      />

      <CheckoutModal
        isCheckoutOpen={isCheckoutOpen}
        setIsCheckoutOpen={setIsCheckoutOpen}
        checkoutStep={checkoutStep}
        setCheckoutStep={setCheckoutStep}
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
        cardDetails={cardDetails}
        setCardDetails={setCardDetails}
        handleCheckout={handlePlaceOrder}
        cart={cart}
        cartTotal={total}
      />

      {/* Backend Connection Manager Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Backend Connection Settings</h3>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              The ULTRON Storefront is built to operate with <strong>100% full fidelity in Standalone Mode</strong> before you boot the backend server. All browsing, filters, stock holds, and simulated checkout work client-side.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Target Backend API URL</label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  placeholder="http://localhost:4000"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#010409] rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-500">Connection Status:</span>
                  <span className={`font-bold ${
                    serverStatus === 'CONNECTED' ? 'text-emerald-400' :
                    serverStatus === 'CONNECTING' ? 'text-amber-400' :
                    'text-cyan-400'
                  }`}>
                    {serverStatus}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {serverHealthMessage}
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <div className="text-[11px] font-bold text-cyan-400 mb-1">To run backend services locally:</div>
                <code className="text-[11px] text-slate-700 dark:text-slate-300 block bg-black/50 p-2 rounded">
                  cd services/inventory-service<br />
                  node src/index.js
                </code>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  setServerStatus('STANDALONE');
                  setServerHealthMessage('Operating in Standalone Client Mode. Zero external dependency required.');
                }}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs"
              >
                Use Standalone Mode
              </button>

              <button
                onClick={testBackendConnection}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${serverStatus === 'CONNECTING' ? 'animate-spin' : ''}`} />
                <span>Ping Health Endpoint</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
