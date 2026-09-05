import React, { useState, useEffect } from 'react';
import { StoreProduct, CATALOG_PRODUCTS } from '../data/storeProducts';
import { CartItem } from '../types';
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

  // Server Connection & Standalone Mode state
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:4001');
  const [serverStatus, setServerStatus] = useState<'STANDALONE' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('STANDALONE');
  const [serverHealthMessage, setServerHealthMessage] = useState<string>(
    'Frontend is currently operating in Standalone Client Mode. All catalog browsing, filtering, Redlock stock reservations, and checkout simulations run locally with zero server dependency.'
  );

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
  const handleAddToCart = (product: StoreProduct) => {
    if (product.status !== 'AVAILABLE') return;

    const newItem: CartItem = {
      phone: product,
      reservedAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000
    };

    setCart((prev) => [...prev, newItem]);

    // Update product status to locked in local catalog state
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, status: 'LOCKED_CHECKOUT_HOLD' as const } : p
      )
    );

    setIsCartOpen(true);
  };

  // Handle removing product from cart (Releasing Redlock Stock Hold)
  const handleRemoveFromCart = (productId: string) => {
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
  const handlePlaceOrder = () => {
    const orderNum = `ULT-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrderId(orderNum);
    setCheckoutStep(3);

    // Mark products as SOLD
    const boughtIds = cart.map((i) => i.phone.id);
    setProducts((prev) =>
      prev.map((p) => (boughtIds.includes(p.id) ? { ...p, status: 'SOLD' as const } : p))
    );
    setCart([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Standalone UI & Server Status Bar */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-tight">
                ULTRON Storefront UI (Customer Experience)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                FRONTEND READY (STANDALONE ACTIVE)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse pre-owned devices, inspect 40-point diagnostics, test Redlock real-time stock holds, and execute the full checkout flow completely decoupled from backend servers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsServerModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 transition-colors"
          >
            <Radio className={`w-3.5 h-3.5 ${serverStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span>Server: {serverStatus}</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-cyan-300 text-[11px] font-mono flex items-center justify-center font-bold ml-1">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hero Announcement Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1624] to-cyan-950/50 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-Downtime Certified Pre-Owned Flagships</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            Grade A+ Devices, Verified IMEI & 12-Month Guarantee.
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Every device undergoes a 40-point hardware verification with certified battery health testing. Real-time stock locks ensure no item is double-sold.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Genuine Parts
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-cyan-400" />
              Free Insured Delivery &gt; R1,500
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              7-Day Return Policy
            </span>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block"></div>
      </div>

      {/* Catalog Search & Filtering Bar */}
      <div className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by model, brand, or IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#010409] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Condition Grade Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-mono shrink-0">Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-full md:w-auto"
            >
              <option value="ALL">All Grades</option>
              <option value="MINT">Mint (100% Pristine)</option>
              <option value="GOOD">Good (Light Wear)</option>
              <option value="FAIR">Fair (Great Value)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-mono shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-full md:w-auto"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="battery">Battery Health %</option>
            </select>
          </div>
        </div>

        {/* Brand Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-800/80 pt-3 text-xs">
          {['ALL', 'Apple', 'Samsung', 'Google', 'OnePlus'].map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors whitespace-nowrap ${
                selectedBrand.toUpperCase() === brand.toUpperCase()
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {brand === 'ALL' ? 'All Brands' : brand}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-500 font-mono">
            Showing {filteredProducts.length} items
          </span>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const isAvailable = product.status === 'AVAILABLE';
          const isHeldInCart = product.status === 'LOCKED_CHECKOUT_HOLD';
          const isSold = product.status === 'SOLD';

          return (
            <div
              key={product.id}
              className="bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-700 transition-all group"
            >
              {/* Product Visual Container */}
              <div className="relative h-48 bg-[#010409] p-5 flex items-center justify-center border-b border-slate-800/80">
                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isHeldInCart
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isAvailable ? '● IN STOCK' : isHeldInCart ? '🔒 RESERVED IN CART' : '✕ SOLD'}
                  </span>
                </div>

                {/* Grade Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      product.conditionGrade === 'MINT'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : product.conditionGrade === 'GOOD'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    GRADE {product.conditionGrade}
                  </span>
                </div>

                {/* Simulated Phone Visual Render */}
                <div className="relative w-28 h-40 rounded-2xl border-2 border-slate-700 shadow-xl flex flex-col items-center justify-between p-2 transition-transform group-hover:scale-105 duration-200"
                  style={{ backgroundColor: product.imageColorHex }}>
                  <div className="w-10 h-2.5 rounded-full bg-black/80 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-white/90 drop-shadow">{product.brand}</div>
                    <div className="text-[9px] text-slate-200/80 font-mono">{product.storageGb}GB</div>
                  </div>
                  <div className="w-8 h-1 rounded-full bg-white/30"></div>
                </div>

                {/* Battery Pill */}
                <div className="absolute bottom-3 left-3 bg-[#0d1117]/90 backdrop-blur border border-slate-800 rounded-md px-2 py-0.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3 text-emerald-400" />
                  <span>{product.batteryHealthPct}% Health</span>
                </div>

                {/* Warehouse Location Pill */}
                <div className="absolute bottom-3 right-3 bg-[#0d1117]/90 backdrop-blur border border-slate-800 rounded-md px-2 py-0.5 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{product.warehouseLocation.split('/')[0]}</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    {product.brand} • {product.storageGb}GB • {product.color}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5 tracking-tight group-hover:text-cyan-300 transition-colors">
                    {product.model}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {product.tagline}
                  </p>

                  <div className="mt-3 py-1.5 px-2.5 bg-[#010409] rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                    <span>IMEI:</span>
                    <span className="text-slate-200 font-bold">{product.imei}</span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-lg font-black text-white">
                        {formatZar(product.priceZar)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono ml-1.5">incl. VAT</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      12M Warranty
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!isAvailable}
                      className={`px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isAvailable
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/20 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'Hold Stock' : isHeldInCart ? 'In Cart' : 'Sold'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0d1117] border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
            {/* Cart Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Your Cart ({cart.length})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Redlock Countdown Timer Banner */}
            {cart.length > 0 && (
              <div className="bg-amber-950/40 border-b border-amber-500/30 px-5 py-3 flex items-center justify-between text-xs font-mono text-amber-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Redis Redlock Stock Hold:</span>
                </div>
                <span className="font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                  {formatTime(lockTimeRemaining)}
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">Your cart is currently empty</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Select a certified device from the catalog to test stock holds.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.phone.id}
                    className="p-3 bg-[#010409] border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{item.phone.model}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.phone.storageGb}GB • {item.phone.color} • Grade {item.phone.conditionGrade}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-1">
                        IMEI: {item.phone.imei}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-white font-mono">
                        {formatZar(item.phone.priceZar)}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.phone.id)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-mono mt-1 underline"
                      >
                        Release Lock
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-[#0a0c10] space-y-4">
                <div className="space-y-1.5 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-slate-200">{formatZar(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Courier Shipping:</span>
                    <span className="text-emerald-400">
                      {shippingCost === 0 ? 'FREE (Nationwide)' : formatZar(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total:</span>
                    <span className="text-cyan-300">{formatZar(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setCheckoutStep(1);
                  }}
                  className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Insured Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 40-Point Diagnostic Inspection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    40-POINT HARDWARE DIAGNOSTIC PASSPORT
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    PASSED 100%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1.5">
                  {selectedProduct.brand} {selectedProduct.model}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  IMEI: {selectedProduct.imei} | SN: {selectedProduct.serialNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Battery & Health Stats */}
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
              <div className="p-3 bg-[#010409] rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">BATTERY HEALTH</div>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {selectedProduct.batteryHealthPct}%
                </div>
                <div className="text-[10px] text-slate-400">Peak Capacity</div>
              </div>
              <div className="p-3 bg-[#010409] rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">CYCLE COUNT</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">
                  {selectedProduct.batteryCycleCount}
                </div>
                <div className="text-[10px] text-slate-400">Low Degradation</div>
              </div>
              <div className="p-3 bg-[#010409] rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">COSMETIC SCORE</div>
                <div className="text-lg font-bold text-amber-400 mt-1">
                  {selectedProduct.cosmeticRating}/10
                </div>
                <div className="text-[10px] text-slate-400">Grade {selectedProduct.conditionGrade}</div>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Certified Hardware Verification Points:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {[
                  'Clean ESN & Unlocked (CheckMEND Database)',
                  'Face ID / Biometric Sensor Fully Responsive',
                  'Original Display Assembly & TrueTone Calibrated',
                  '5G Sub-6 & mmWave Modem Radio Bands Tested',
                  'Dual Mic Noise-Cancellation & Loudspeakers',
                  'Wireless Qi & High-Wattage Wired Fast Charge',
                  'IP68 Submersion Chamber Pressure Test Passed',
                  'Cameras Auto-Focus, OIS & Telephoto Alignment'
                ].map((check, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#010409] border border-slate-800/80 text-slate-300"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Factory Specifications:
              </h4>
              <div className="p-3 bg-[#010409] rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Display:</span>
                  <span>{selectedProduct.specs.screen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Processor:</span>
                  <span>{selectedProduct.specs.chipset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Memory:</span>
                  <span>{selectedProduct.specs.ram}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Camera System:</span>
                  <span>{selectedProduct.specs.camera}</span>
                </div>
              </div>
            </div>

            {/* In The Box */}
            <div className="text-xs font-mono text-slate-400">
              <span className="font-bold text-slate-300">In the box: </span>
              {selectedProduct.inTheBox.join(' • ')}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-lg font-black text-white font-mono">
                {formatZar(selectedProduct.priceZar)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs font-mono hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.status !== 'AVAILABLE'}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
                >
                  Add to Cart & Lock Stock
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
