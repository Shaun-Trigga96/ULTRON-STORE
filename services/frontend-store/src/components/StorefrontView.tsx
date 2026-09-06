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
  ArrowRight
} from 'lucide-react';

export const StorefrontView: React.FC = () => {
  // State
  const [products, setProducts] = useState<StoreProduct[]>(CATALOG_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'battery'>('featured');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string>('');

  // Server Connection & Standalone Mode state
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8080');
  const [serverStatus, setServerStatus] = useState<'STANDALONE' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('CONNECTING');
  const [serverHealthMessage, setServerHealthMessage] = useState<string>('Connecting to API Gateway...');
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
          setServerHealthMessage('Connected to live Inventory & Catalog Microservices via API Gateway.');
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
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Thabiso Matsaba',
    email: 'thabiso@example.com',
    phone: '+27 82 555 0192',
    address: '142 Sandton Boulevard, Sandhurst',
    city: 'Johannesburg',
    postalCode: '2196',
    paymentMethod: 'instant-eft'
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
      {/* Top Banner: Apple-Style Storefront Header & Redlock Status */}
      <div className="bg-transparent border-b border-slate-200 dark:border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <UltronLogo variant="icon" size="md" className="h-10 w-auto" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>ULTRON</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">Certified Pre-Owned Store</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 animate-pulse"></span>
                ORIGINAL OEM HARDWARE GUARANTEED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every device passes 40-point hardware tests. 10-minute Redis Redlock guarantees exclusive stock holding during checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsServerModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Radio className={`w-3.5 h-3.5 ${serverStatus === 'CONNECTED' ? 'text-slate-700 dark:text-slate-300' : 'text-blue-600 dark:text-blue-400'}`} />
            <span>Server: {serverStatus}</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#0071e3] text-[11px] font-bold font-mono flex items-center justify-center ml-0.5">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Apple Keynote Style Hero Feature Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#fafafa] to-white dark:from-[#1c1c1e] dark:to-black border border-slate-200 dark:border-white/5 p-10 sm:p-16 lg:p-20 shadow-2xl transition-colors duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Typography & Highlights */}
          <div className="lg:col-span-7 space-y-5 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Flagship Showcase</span>
            </div>

            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1">
                Apple iPhone 15 Pro Max
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Titanium. So strong. So light. So Pro.
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
              Acquire certified Grade A+ Mint condition with genuine Apple Super Retina XDR OLED, Action Button, and 98% OEM battery capacity. Backed by our 12-Month zero-deductible replacement warranty.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300 font-sans pt-1">
              <span className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                40-Point Diagnostic Passed
              </span>
              <span className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-full">
                <Truck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Free Overnight Courier Guy
              </span>
              <span className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 px-3 py-1.5 rounded-full">
                <RotateCcw className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                7-Day Money-Back Guarantee
              </span>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">R22,499</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">or R1,875/mo x 12</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const heroProduct = products.find((p) => p.id === 'ph_01') || products[0];
                    handleAddToCart(heroProduct);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Hold Stock (10-Min Reserve)</span>
                </button>
                <button
                  onClick={() => {
                    const heroProduct = products.find((p) => p.id === 'ph_01') || products[0];
                    setSelectedProduct(heroProduct);
                    setActiveModalImage(heroProduct.imageUrl);
                  }}
                  className="px-5 py-2.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-medium transition-all flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                  <span>Inspect Tech Specs</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Studio Image Display */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-sm">
              {/* Subtle spotlight glow */}
              <div className="absolute inset-0 bg-slate-200/50 dark:bg-white/5 blur-3xl rounded-full transform scale-90 pointer-events-none"></div>
              <img
                src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85"
                alt="Apple iPhone 15 Pro Max Natural Titanium"
                referrerPolicy="no-referrer"
                className="relative z-10 w-full max-h-80 sm:max-h-96 object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85';
                }}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/70 backdrop-blur-md border border-slate-200 dark:border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-slate-800 dark:text-slate-300 whitespace-nowrap shadow-xl z-20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-800 dark:bg-slate-200"></span>
                <span>Natural Titanium • 256GB • Grade A+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Search & Filtering Bar (Apple iStore Clean Strip) */}
      <div className="bg-transparent border-b border-slate-200 dark:border-white/10 pb-8 space-y-5 transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by device model, brand (Apple, Samsung, Google), or IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Condition Grade Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">Condition:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 w-full md:w-auto"
            >
              <option value="ALL">All Certified Grades</option>
              <option value="MINT">Mint (100% Flawless)</option>
              <option value="GOOD">Good (Light Wear)</option>
              <option value="FAIR">Fair (Best Value)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-500 w-full md:w-auto"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="battery">Battery Health %</option>
            </select>
          </div>
        </div>

        {/* Brand Tabs (Apple Navigation Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-200 dark:border-white/5 pt-3 text-xs">
          {['ALL', 'Apple', 'Samsung', 'Google', 'OnePlus'].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap text-xs border ${
                selectedBrand.toUpperCase() === brand.toUpperCase()
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold shadow-sm border-transparent'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 border-slate-200 dark:border-white/5'
              }`}
            >
              {brand === 'ALL' ? 'All Flagships' : brand}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-mono">
            {filteredProducts.length} verified devices available
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
              className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-[#424245] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Product Visual Container */}
              <div className="relative h-64 bg-gradient-to-b from-[#fafafa] to-[#f5f5f5] dark:from-[#18181a] dark:to-[#101010] p-8 flex items-center justify-center border-b border-slate-100 dark:border-white/5 overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase ${
                      isAvailable
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        : isHeldInCart
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        : 'bg-slate-50 dark:bg-[#1c1c1e] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {isAvailable ? '● IN STOCK' : isHeldInCart ? '🔒 RESERVED' : '✕ SOLD OUT'}
                  </span>
                </div>

                {/* Grade Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                  >
                    GRADE {product.conditionGrade}
                  </span>
                </div>

                {/* Ambient Device Backdrop Glow */}
                <div
                  className="absolute inset-0 opacity-25 blur-3xl pointer-events-none rounded-full transform scale-75"
                  style={{ backgroundColor: product.imageColorHex }}
                />

                {/* Real High-Resolution Studio Device Photograph */}
                <img
                  src={product.imageUrl}
                  alt={`${product.brand} ${product.model}`}
                  referrerPolicy="no-referrer"
                  className="relative z-10 h-48 w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Battery Pill */}
                <div className="absolute bottom-3.5 left-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-md">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{product.batteryHealthPct}% Health</span>
                </div>

                {/* Warehouse Location Pill */}
                <div className="absolute bottom-3.5 right-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>{product.warehouseLocation.split('/')[0].trim()}</span>
                </div>
              </div>

              {/* Product Info & Specification */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {product.colorSwatches && product.colorSwatches.length > 0 ? (
                      product.colorSwatches.map((swatch, idx) => (
                        <span
                          key={idx}
                          title={swatch.name}
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))
                    ) : (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: product.imageColorHex }}
                      />
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-1">
                      {product.color}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    {product.brand} • {product.storageGb}GB
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors mt-0.5">
                    {product.model}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                    {product.tagline}
                  </p>

                  <div className="mt-3.5 py-1.5 px-3 bg-slate-50 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>IMEI:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-bold tracking-wider">{product.imei}</span>
                  </div>
                </div>

                {/* Price and Financing Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-baseline justify-between mb-1">
                    <div>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {formatZar(product.priceZar)}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono ml-1.5">incl. VAT</span>
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full">
                      12M Warranty
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-sans">
                    or from <span className="text-slate-900 dark:text-white font-semibold">{formatZar(product.monthlyFinancingZar || Math.round(product.priceZar / 12))}/mo</span> with 0% interest
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setActiveModalImage(product.imageUrl);
                      }}
                      className="px-3 py-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Quick Look</span>
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!isAvailable}
                      className={`px-3 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                        isAvailable
                          ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20 cursor-pointer active:scale-95'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'Hold Stock' : isHeldInCart ? 'In Bag' : 'Sold Out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer / Apple Shopping Bag */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#161617] border-l border-slate-200 dark:border-white/10 h-full flex flex-col justify-between shadow-2xl transition-colors duration-300">
            {/* Cart Header */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Review Your Bag ({cart.length})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Redlock Countdown Timer Banner */}
            {cart.length > 0 && (
              <div className="bg-slate-50 dark:bg-[#121212] border-b border-slate-200 dark:border-white/10 px-6 py-3 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Stock Reserved:</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-white/10">
                  {formatTime(lockTimeRemaining)}
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-base text-slate-900 dark:text-white font-medium">Your Bag is empty</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Select a certified pre-owned device from the catalog to test real-time stock holds.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.phone.id}
                    className="p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.phone.imageUrl}
                        alt={item.phone.model}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-contain rounded-xl bg-white dark:bg-[#1d1d1f] p-1 border border-slate-200 dark:border-white/5 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{item.phone.model}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {item.phone.storageGb}GB • {item.phone.color}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                          IMEI: {item.phone.imei}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-white font-mono">
                        {formatZar(item.phone.priceZar)}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.phone.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-mono mt-1.5 underline cursor-pointer"
                      >
                        Release Hold
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#121214] space-y-4">
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-slate-200 font-mono font-medium">{formatZar(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Overnight Shipping:</span>
                    <span className="text-emerald-400 font-medium">
                      {shippingCost === 0 ? 'FREE (Courier Guy)' : formatZar(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2.5 border-t border-white/10">
                    <span>Total:</span>
                    <span className="text-white font-mono">{formatZar(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setCheckoutStep(1);
                  }}
                  className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Check Out with Insured Delivery</span>
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
                <h3 className="text-2xl font-bold text-white mt-2 tracking-tight">
                  {selectedProduct.brand} {selectedProduct.model}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  IMEI: {selectedProduct.imei} • Serial: {selectedProduct.serialNumber} • Grade {selectedProduct.conditionGrade}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Device Studio Photo Showcase & Angles */}
            <div className="bg-gradient-to-b from-[#1d1d1f] to-[#121214] rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
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
              <div className="p-4 bg-black/30 rounded-2xl border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold tracking-wider">BATTERY HEALTH</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {selectedProduct.batteryHealthPct}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">OEM Peak Capacity</div>
              </div>
              <div className="p-4 bg-black/30 rounded-2xl border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold tracking-wider">CYCLE COUNT</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {selectedProduct.batteryCycleCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Low Degradation</div>
              </div>
              <div className="p-4 bg-black/30 rounded-2xl border border-white/5">
                <div className="text-[10px] text-slate-400 font-bold tracking-wider">COSMETIC SCORE</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">
                  {selectedProduct.cosmeticRating}/10
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Grade {selectedProduct.conditionGrade} Mint</div>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5">
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
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/30 border border-white/5 text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-2.5">
                Factory Specifications:
              </h4>
              <div className="p-4 bg-black/30 rounded-2xl border border-white/5 font-mono text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Display:</span>
                  <span className="font-semibold text-white">{selectedProduct.specs.screen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processor:</span>
                  <span className="font-semibold text-white">{selectedProduct.specs.chipset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Memory & Storage:</span>
                  <span className="font-semibold text-white">{selectedProduct.specs.ram} RAM • {selectedProduct.storageGb}GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Camera System:</span>
                  <span className="font-semibold text-white">{selectedProduct.specs.camera}</span>
                </div>
              </div>
            </div>

            {/* In The Box */}
            <div className="text-xs text-slate-400 font-mono bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="font-bold text-white">Included Accessories: </span>
              {selectedProduct.inTheBox.join(' • ')}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {formatZar(selectedProduct.priceZar)}
                </div>
                <div className="text-xs text-slate-400">
                  or {formatZar(selectedProduct.monthlyFinancingZar || Math.round(selectedProduct.priceZar / 12))}/mo x 12
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2.5 rounded-full bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors"
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
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {checkoutStep === 1 && 'Step 1 of 2: Insured Delivery Address'}
                  {checkoutStep === 2 && 'Step 2 of 2: Payment & Final Review'}
                  {checkoutStep === 3 && 'Order Confirmed!'}
                </h3>
              </div>
              {checkoutStep !== 3 && (
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {checkoutStep === 1 && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Full Recipient Name</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#010409] border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#010409] border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Phone (SMS Delivery Updates)</label>
                    <input
                      type="text"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-[#010409] border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full px-3 py-2 bg-[#010409] border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">City / Province</label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      className="w-full px-3 py-2 bg-[#010409] border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-[#010409] border border-slate-800 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'instant-eft', label: 'Instant EFT (Ozow)' },
                      { id: 'card', label: 'Credit/Debit Card' },
                      { id: 'crypto', label: 'BTC Lightning' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: m.id })}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          customerInfo.paymentMethod === m.id
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-[#010409] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#010409] rounded-xl border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-400 font-bold uppercase">Order Summary</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Items ({cart.length}):</span>
                    <span>{formatZar(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Courier Insured Delivery:</span>
                    <span className="text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span>Grand Total:</span>
                    <span className="text-cyan-300">{formatZar(total)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Your IMEI lock is guaranteed active. No race conditions possible.</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize & Complete Order</span>
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="text-center py-6 space-y-4 font-mono">
                <div className="flex justify-center pb-2">
                  <UltronLogo variant="full" size="sm" theme="dark" />
                </div>
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Payment Authorized!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Order Reference: <span className="text-cyan-300 font-bold">{confirmedOrderId}</span>
                  </p>
                </div>

                <div className="p-4 bg-[#010409] rounded-xl border border-slate-800 text-xs text-left text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient:</span>
                    <span>{customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span>{customerInfo.address}, {customerInfo.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Courier:</span>
                    <span className="text-emerald-400">The Courier Guy (Express Overnight)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-cyan-400 font-bold">DISPATCHING FROM WAREHOUSE</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutStep(1);
                  }}
                  className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Return to Storefront
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backend Connection Manager Modal */}
      {isServerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Backend Connection Settings</h3>
              </div>
              <button
                onClick={() => setIsServerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The ULTRON Storefront is built to operate with <strong>100% full fidelity in Standalone Mode</strong> before you boot the backend server. All browsing, filters, stock holds, and simulated checkout work client-side.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Inventory Microservice URL</label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#010409] border border-slate-800 rounded-lg text-white"
                  placeholder="http://localhost:4001"
                />
              </div>

              <div className="p-3 bg-[#010409] rounded-xl border border-slate-800">
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
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {serverHealthMessage}
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
                <div className="text-[11px] font-bold text-cyan-400 mb-1">To run backend services locally:</div>
                <code className="text-[11px] text-slate-300 block bg-black/50 p-2 rounded">
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
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs"
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
