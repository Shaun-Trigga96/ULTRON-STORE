import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Truck,
  RotateCcw,
  Sparkles,
  X,
  Smartphone,
  Check,
  Radio,
  Eye,
  MapPin,
  ArrowRight
} from 'lucide-react';

const INITIAL_CATALOG = [
  {
    id: 'ph_01',
    imei: '354892019482910',
    serialNumber: 'F2LLM9P0J7',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storageGb: 256,
    color: 'Natural Titanium',
    conditionGrade: 'MINT',
    batteryHealthPct: 98,
    batteryCycleCount: 42,
    cosmeticRating: 9.9,
    priceZar: 22499,
    monthlyFinancingZar: 1875,
    warehouseLocation: 'CPT-WH-01 / Row 04 / Bin A2',
    status: 'AVAILABLE',
    tagline: 'Forged in titanium with industry-leading A17 Pro chip and 5x optical telephoto.',
    imageColorHex: '#9ca3af',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Natural Titanium', hex: '#8a8884' },
      { name: 'White Titanium', hex: '#e3e4e5' },
      { name: 'Black Titanium', hex: '#343332' },
      { name: 'Blue Titanium', hex: '#2f3844' }
    ],
    specs: {
      screen: '6.7" Super Retina XDR OLED ProMotion 120Hz',
      chipset: 'Apple A17 Pro (3nm)',
      ram: '8GB Unified RAM',
      camera: '48MP Main (f/1.78) + 12MP 5x Telephoto + 12MP Ultra-wide'
    },
    inTheBox: ['Certified Grade A+ iPhone', 'Apple Braided USB-C Woven Cable', 'Diagnostic Certificate']
  },
  {
    id: 'ph_02',
    imei: '358291029482109',
    serialNumber: 'R5CW30KP89',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storageGb: 512,
    color: 'Titanium Black',
    conditionGrade: 'GOOD',
    batteryHealthPct: 94,
    batteryCycleCount: 110,
    cosmeticRating: 9.3,
    priceZar: 19999,
    monthlyFinancingZar: 1667,
    warehouseLocation: 'JHB-WH-02 / Row 01 / Bin C4',
    status: 'AVAILABLE',
    tagline: 'Corning Gorilla Armor anti-reflective glass, built-in S-Pen and full Galaxy AI suite.',
    imageColorHex: '#1e293b',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Titanium Black', hex: '#2b2b2b' },
      { name: 'Titanium Gray', hex: '#7a7a7a' },
      { name: 'Titanium Violet', hex: '#483d61' }
    ],
    specs: {
      screen: '6.8" Dynamic AMOLED 2X QHD+ 120Hz (2600 nits)',
      chipset: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12GB LPDDR5X RAM',
      camera: '200MP Main + 50MP 5x Periscope + 10MP 3x + 12MP Ultra-wide'
    },
    inTheBox: ['Certified Galaxy S24 Ultra', 'Official S-Pen', 'Type-C to C 5A Cable']
  },
  {
    id: 'ph_03',
    imei: '867123901827461',
    serialNumber: '349GKL8102',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    storageGb: 128,
    color: 'Bay Blue',
    conditionGrade: 'FAIR',
    batteryHealthPct: 89,
    batteryCycleCount: 185,
    cosmeticRating: 8.6,
    priceZar: 14499,
    monthlyFinancingZar: 1208,
    warehouseLocation: 'CPT-WH-01 / Row 02 / Bin B1',
    status: 'AVAILABLE',
    tagline: 'Google Tensor G3 computational photography, Best Take, and 7 years of OS updates.',
    imageColorHex: '#38bdf8',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Bay Blue', hex: '#6ca8d8' },
      { name: 'Obsidian', hex: '#1c1c1e' },
      { name: 'Porcelain', hex: '#edebe6' }
    ],
    specs: {
      screen: '6.7" Super Actua LTPO OLED 1-120Hz',
      chipset: 'Google Tensor G3 + Titan M2 Security',
      ram: '12GB RAM',
      camera: '50MP Octa-PD Main + 48MP Quad-PD Ultrawide + 48MP Telephoto'
    },
    inTheBox: ['Certified Pixel 8 Pro', 'USB-C Cable', 'Quick Switch Adapter']
  },
  {
    id: 'ph_04',
    imei: '359102948291039',
    serialNumber: 'DN6KL09PQ2',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storageGb: 256,
    color: 'Deep Purple',
    conditionGrade: 'MINT',
    batteryHealthPct: 96,
    batteryCycleCount: 88,
    cosmeticRating: 9.8,
    priceZar: 16999,
    monthlyFinancingZar: 1416,
    warehouseLocation: 'JHB-WH-02 / Row 03 / Bin D2',
    status: 'AVAILABLE',
    tagline: 'Dynamic Island, 48MP Pro camera system, and Always-On Super Retina XDR display.',
    imageColorHex: '#581c87',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Deep Purple', hex: '#48394e' },
      { name: 'Space Black', hex: '#1d1d1f' },
      { name: 'Silver', hex: '#f1f2ed' },
      { name: 'Gold', hex: '#f4e8ce' }
    ],
    specs: {
      screen: '6.1" Super Retina XDR Always-On OLED 120Hz',
      chipset: 'Apple A16 Bionic (4nm)',
      ram: '6GB RAM',
      camera: '48MP Main + 12MP 3x Telephoto + 12MP Ultra-wide'
    },
    inTheBox: ['Certified Grade A+ iPhone 14 Pro', 'USB-C to Lightning Cable', 'Verification Slip']
  },
  {
    id: 'ph_05',
    imei: '861029481920491',
    serialNumber: 'OP12984012',
    brand: 'OnePlus',
    model: 'OnePlus 12',
    storageGb: 512,
    color: 'Silky Black',
    conditionGrade: 'MINT',
    batteryHealthPct: 99,
    batteryCycleCount: 22,
    cosmeticRating: 9.9,
    priceZar: 15999,
    monthlyFinancingZar: 1333,
    warehouseLocation: 'CPT-WH-01 / Row 05 / Bin A1',
    status: 'AVAILABLE',
    tagline: 'Snapdragon 8 Gen 3 with 100W SUPERVOOC hyper-charging and 4th Gen Hasselblad Camera.',
    imageColorHex: '#18181b',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Silky Black', hex: '#171717' },
      { name: 'Flowy Emerald', hex: '#164e3f' }
    ],
    specs: {
      screen: '6.82" 2K ProXDR Display with LTPO (4500 nits)',
      chipset: 'Snapdragon 8 Gen 3',
      ram: '16GB LPDDR5X RAM',
      camera: '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-wide'
    },
    inTheBox: ['Certified OnePlus 12', '100W SUPERVOOC Power Adapter', 'Type-A to Type-C Cable']
  }
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(900);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState(null);

  useEffect(() => {
    if (cart.length === 0) return;
    const interval = setInterval(() => {
      setLockCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cart.length]);

  const handleAddToCart = (product) => {
    if (product.status !== 'AVAILABLE') return;
    setCart((prev) => [...prev, product]);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: 'LOCKED_CHECKOUT_HOLD' } : p))
    );
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'AVAILABLE' } : p))
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.imei.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBrand = selectedBrand === 'ALL' || p.brand.toUpperCase() === selectedBrand.toUpperCase();
    const matchGrade = selectedGrade === 'ALL' || p.conditionGrade === selectedGrade;
    return matchSearch && matchBrand && matchGrade;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.priceZar, 0);

  const formatZar = (val) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] font-sans selection:bg-[#0071e3] selection:text-white pb-20">
      {/* Apple-style Global Navigation */}
      <header className="border-b border-white/10 bg-[#161617]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-black text-xs shadow-sm">
              
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white tracking-tight text-sm">ULTRON</span>
              <span className="text-slate-400 text-sm font-normal">Certified Store</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REDIS REDLOCK ACTIVE
            </span>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag</span>
              {cart.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#0071e3] text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        {/* Apple Keynote Hero Showcase Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1d1d1f] via-[#151516] to-[#000000] border border-white/10 p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Certified Pre-Owned Showcase</span>
              </div>

              <div>
                <div className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">
                  Apple iPhone 15 Pro Max
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Titanium. So strong. So light. So Pro.
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal">
                Acquire certified Grade A+ Mint condition with genuine Apple Super Retina XDR OLED, Action Button, and 98% OEM battery capacity. Backed by our 12-Month zero-deductible replacement warranty.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  40-Point Diagnostic Passed
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <Truck className="w-4 h-4 text-blue-400" />
                  Free Overnight Courier
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  7-Day Return Guarantee
                </span>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">R22,499</span>
                  <span className="text-xs text-slate-400 ml-2">or R1,875/mo x 12</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const hero = products.find((p) => p.id === 'ph_01') || products[0];
                      handleAddToCart(hero);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/25 active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Hold Stock (10-Min Reserve)</span>
                  </button>
                  <button
                    onClick={() => {
                      const hero = products.find((p) => p.id === 'ph_01') || products[0];
                      setSelectedProduct(hero);
                      setActiveModalImage(hero.imageUrl);
                    }}
                    className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-300" />
                    <span>Quick Look</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transform scale-90 pointer-events-none"></div>
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85"
                  alt="Apple iPhone 15 Pro Max Natural Titanium"
                  referrerPolicy="no-referrer"
                  className="relative z-10 w-full max-h-80 sm:max-h-96 object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85';
                  }}
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-mono text-slate-300 whitespace-nowrap shadow-xl z-20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Natural Titanium • 256GB • Grade A+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#161617] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by device model, brand (Apple, Samsung, Google), or IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-400 shrink-0 font-medium">Condition:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full md:w-auto"
              >
                <option value="ALL">All Certified Grades</option>
                <option value="MINT">Mint (100% Flawless)</option>
                <option value="GOOD">Good (Light Wear)</option>
                <option value="FAIR">Fair (Best Value)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-white/5 pt-3 text-xs">
            {['ALL', 'Apple', 'Samsung', 'Google', 'OnePlus'].map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap text-xs cursor-pointer ${
                  selectedBrand.toUpperCase() === brand.toUpperCase()
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {brand === 'ALL' ? 'All Flagships' : brand}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400 font-mono">
              {filteredProducts.length} verified devices available
            </span>
          </div>
        </div>

        {/* Product Grid with High-Resolution Studio Photography */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isAvailable = p.status === 'AVAILABLE';
            const isHeldInCart = p.status === 'LOCKED_CHECKOUT_HOLD';

            return (
              <div
                key={p.id}
                className="bg-[#161617] border border-[#2d2d2f] hover:border-[#424245] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="relative h-64 bg-gradient-to-b from-[#1d1d1f] to-[#121214] p-6 flex items-center justify-center border-b border-white/5 overflow-hidden">
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase ${
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isHeldInCart
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isAvailable ? '● IN STOCK' : isHeldInCart ? '🔒 RESERVED' : '✕ SOLD OUT'}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ${
                        p.conditionGrade === 'MINT'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : p.conditionGrade === 'GOOD'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      GRADE {p.conditionGrade}
                    </span>
                  </div>

                  <div
                    className="absolute inset-0 opacity-25 blur-3xl pointer-events-none rounded-full transform scale-75"
                    style={{ backgroundColor: p.imageColorHex }}
                  />

                  <img
                    src={p.imageUrl}
                    alt={`${p.brand} ${p.model}`}
                    referrerPolicy="no-referrer"
                    className="relative z-10 h-48 w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  <div className="absolute bottom-3.5 left-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-md">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{p.batteryHealthPct}% Health</span>
                  </div>

                  <div className="absolute bottom-3.5 right-4 z-20 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 shadow-md">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{p.warehouseLocation ? p.warehouseLocation.split('/')[0].trim() : 'Warehouse'}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      {p.colorSwatches && p.colorSwatches.length > 0 ? (
                        p.colorSwatches.map((swatch, idx) => (
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
                          style={{ backgroundColor: p.imageColorHex }}
                        />
                      )}
                      <span className="text-[11px] text-slate-400 font-medium ml-1">
                        {p.color}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                      {p.brand} • {p.storageGb}GB
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors mt-0.5">
                      {p.model}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                      {p.tagline}
                    </p>

                    <div className="mt-3.5 py-1.5 px-3 bg-black/30 rounded-xl border border-white/5 font-mono text-[11px] text-slate-400 flex items-center justify-between">
                      <span>IMEI:</span>
                      <span className="text-slate-200 font-bold tracking-wider">{p.imei}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-baseline justify-between mb-1">
                      <div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                          {formatZar(p.priceZar)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono ml-1.5">incl. VAT</span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        12M Warranty
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mb-4 font-sans">
                      or from <span className="text-white font-semibold">{formatZar(p.monthlyFinancingZar || Math.round(p.priceZar / 12))}/mo</span> with 0% interest
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setActiveModalImage(p.imageUrl);
                        }}
                        className="px-3 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Quick Look</span>
                      </button>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={!isAvailable}
                        className={`px-3 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                          isAvailable
                            ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20 cursor-pointer active:scale-95'
                            : 'bg-white/10 text-slate-500 border border-white/5 cursor-not-allowed'
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
      </main>

      {/* Cart Drawer / Apple Shopping Bag */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#161617] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white tracking-tight">Review Your Bag ({cart.length})</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length > 0 && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center justify-between text-xs font-mono text-amber-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Redis Redlock Stock Hold:</span>
                </div>
                <span className="font-bold text-white bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-base text-white font-medium">Your Bag is empty</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Select a certified pre-owned device from the catalog to test real-time stock holds.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.imageUrl}
                        alt={item.model}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 object-contain rounded-xl bg-[#1d1d1f] p-1 border border-white/5 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div>
                        <div className="text-sm font-bold text-white">{item.model}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {item.storageGb}GB • {item.color}
                        </div>
                        <div className="text-[10px] text-blue-400 font-mono mt-1">
                          IMEI: {item.imei}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-white font-mono">
                        {formatZar(item.priceZar)}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-mono mt-1.5 underline cursor-pointer"
                      >
                        Release Hold
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#121214] space-y-4">
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-slate-200 font-mono font-medium">{formatZar(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Overnight Shipping:</span>
                    <span className="text-emerald-400 font-medium">FREE (Courier Guy)</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2.5 border-t border-white/10">
                    <span>Total:</span>
                    <span className="text-white font-mono">{formatZar(subtotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
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

      {/* 40-Point Diagnostic Inspection Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#161617] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
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
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-b from-[#1d1d1f] to-[#121214] rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20 blur-3xl pointer-events-none rounded-full"
                style={{ backgroundColor: selectedProduct.imageColorHex }}
              />

              <img
                src={activeModalImage || selectedProduct.imageUrl}
                alt={selectedProduct.model}
                referrerPolicy="no-referrer"
                className="relative z-10 h-60 w-full object-contain filter drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)] transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {selectedProduct.galleryImages && selectedProduct.galleryImages.length > 1 && (
                <div className="flex items-center gap-2.5 mt-4 z-10">
                  {selectedProduct.galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveModalImage(imgUrl)}
                      className={`w-12 h-12 rounded-xl bg-black/60 p-1 border transition-all cursor-pointer ${
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
                  className="px-5 py-2.5 rounded-full bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.status !== 'AVAILABLE'}
                  className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Add to Bag & Hold Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#161617] border border-white/10 rounded-3xl max-w-md w-full p-7 text-center space-y-5 shadow-2xl">
            {!confirmedOrderId ? (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Instant Insured Checkout</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Completing your order locks in your 12-Month hardware replacement guarantee and generates an instant delivery dispatch ticket.
                </p>
                <div className="text-left bg-black/40 p-4 rounded-2xl border border-white/5 font-mono text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Reserved Items:</span>
                    <span className="text-white font-bold">{cart.length} device(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Courier:</span>
                    <span className="text-emerald-400 font-bold">The Courier Guy (Free Overnight)</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-bold pt-2 border-t border-white/5 text-sm">
                    <span>Total Amount:</span>
                    <span className="text-white">{formatZar(subtotal)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-1/2 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                  >
                    Back to Bag
                  </button>
                  <button
                    onClick={() => {
                      setConfirmedOrderId(`ULT-${Math.floor(100000 + Math.random() * 900000)}`);
                      setCart([]);
                    }}
                    className="w-1/2 py-3 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Order Confirmed!</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Your device has been allocated from warehouse stock. Tracking info sent via SMS.
                </p>
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-xs text-slate-300">
                  Dispatch Reference: <span className="text-emerald-400 font-bold">{confirmedOrderId}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setConfirmedOrderId(null);
                  }}
                  className="w-full py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer shadow-md"
                >
                  Return to Store
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
