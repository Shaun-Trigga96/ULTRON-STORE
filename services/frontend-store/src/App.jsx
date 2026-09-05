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
  Server,
  Radio,
  Eye,
  MapPin,
  ArrowRight
} from 'lucide-react';

const INITIAL_CATALOG = [
  {
    id: 'ph_01',
    imei: '354892019482910',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storageGb: 256,
    color: 'Natural Titanium',
    conditionGrade: 'MINT',
    batteryHealthPct: 98,
    priceZar: 22499,
    warehouseLocation: 'CPT-WH-01',
    status: 'AVAILABLE',
    tagline: 'Grade A+ Pristine condition with zero micro-scratches. 100% genuine Apple components.',
    imageColorHex: '#9ca3af'
  },
  {
    id: 'ph_02',
    imei: '358291029482109',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storageGb: 512,
    color: 'Titanium Black',
    conditionGrade: 'GOOD',
    batteryHealthPct: 94,
    priceZar: 19999,
    warehouseLocation: 'JHB-WH-02',
    status: 'AVAILABLE',
    tagline: 'Near-mint condition with integrated S-Pen stylus and Galaxy AI suite enabled.',
    imageColorHex: '#1e293b'
  },
  {
    id: 'ph_03',
    imei: '867123901827461',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    storageGb: 128,
    color: 'Bay Blue',
    conditionGrade: 'FAIR',
    batteryHealthPct: 89,
    priceZar: 14499,
    warehouseLocation: 'CPT-WH-01',
    status: 'AVAILABLE',
    tagline: 'Light signs of wear along bezel; screen flawless with matte protector. Exceptional camera value.',
    imageColorHex: '#38bdf8'
  },
  {
    id: 'ph_04',
    imei: '359102948291039',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storageGb: 256,
    color: 'Deep Purple',
    conditionGrade: 'MINT',
    batteryHealthPct: 96,
    priceZar: 16999,
    warehouseLocation: 'JHB-WH-02',
    status: 'AVAILABLE',
    tagline: 'Iconic Deep Purple edition. Dynamic Island display, tested and certified 100% clean ESN.',
    imageColorHex: '#581c87'
  },
  {
    id: 'ph_05',
    imei: '861029481920491',
    brand: 'OnePlus',
    model: 'OnePlus 12',
    storageGb: 512,
    color: 'Silky Black',
    conditionGrade: 'MINT',
    batteryHealthPct: 99,
    priceZar: 15999,
    warehouseLocation: 'CPT-WH-01',
    status: 'AVAILABLE',
    tagline: 'Open-box unit with 100W SuperVOOC rapid charging and 4th Gen Hasselblad camera system.',
    imageColorHex: '#18181b'
  }
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(900);
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
    const matchSearch = p.model.toLowerCase().includes(searchQuery.toLowerCase()) || p.imei.includes(searchQuery);
    const matchBrand = selectedBrand === 'ALL' || p.brand.toUpperCase() === selectedBrand.toUpperCase();
    return matchSearch && matchBrand;
  });

  const subtotal = cart.reduce((sum, item) => sum + item.priceZar, 0);

  const formatZar = (val) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans pb-16">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-[#0d1117] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center font-black text-slate-950 text-sm">
              U
            </div>
            <div>
              <span className="font-extrabold text-white tracking-wider">ULTRON</span>
              <span className="text-cyan-400 font-bold ml-1">STORE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              STANDALONE MODE (NO SERVER NEEDED)
            </span>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart ({cart.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/60 border border-slate-800 p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frontend Decoupled Preview Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Pre-Owned Flagships with Certified ESN & Zero-Conflict Stock Hold.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Test the entire shopping experience client-side before spinning up local backend servers or Docker clusters.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by model or IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#010409] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'Apple', 'Samsung', 'Google', 'OnePlus'].map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  selectedBrand === brand ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="h-44 bg-[#010409] flex items-center justify-center relative p-4">
                <div
                  className="w-24 h-36 rounded-xl border border-slate-700 flex flex-col items-center justify-between p-2 shadow-lg"
                  style={{ backgroundColor: p.imageColorHex }}
                >
                  <div className="w-8 h-2 rounded-full bg-black/80"></div>
                  <div className="text-[9px] font-bold text-white text-center">{p.model}</div>
                  <div className="w-6 h-1 rounded-full bg-white/20"></div>
                </div>

                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    GRADE {p.conditionGrade}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 bg-[#0d1117]/90 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-emerald-400">
                  {p.batteryHealthPct}% Battery
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">{p.brand} • {p.storageGb}GB</div>
                  <h3 className="text-base font-bold text-white mt-0.5">{p.model}</h3>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">IMEI: {p.imei}</div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-base font-black text-white font-mono">{formatZar(p.priceZar)}</div>
                  <button
                    onClick={() => handleAddToCart(p)}
                    disabled={p.status !== 'AVAILABLE'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                      p.status === 'AVAILABLE'
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {p.status === 'AVAILABLE' ? 'Hold Stock' : 'Reserved'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
          <div className="w-full max-w-md bg-[#0d1117] border-l border-slate-800 h-full flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-cyan-400" /> Cart ({cart.length})
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg text-xs font-mono text-amber-300 my-4 flex items-center justify-between">
                  <span>Stock Lock Timer:</span>
                  <span className="font-bold">{Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}</span>
                </div>
              )}

              <div className="space-y-3 mt-4">
                {cart.map((item) => (
                  <div key={item.id} className="p-3 bg-[#010409] rounded-lg border border-slate-800 flex justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{item.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">IMEI: {item.imei}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">{formatZar(item.priceZar)}</div>
                      <button onClick={() => handleRemoveFromCart(item.id)} className="text-[10px] text-rose-400 underline mt-1">
                        Release
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-bold text-white">{formatZar(subtotal)}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono"
                >
                  Simulate Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#0d1117] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4">
            {!confirmedOrderId ? (
              <>
                <h3 className="text-lg font-bold text-white">Simulate Order Checkout</h3>
                <p className="text-xs text-slate-400 font-mono">
                  This tests the complete order fulfillment loop without calling the external payment gateway.
                </p>
                <div className="text-left bg-[#010409] p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between"><span>Items:</span><span>{cart.length}</span></div>
                  <div className="flex justify-between"><span>Total:</span><span className="text-cyan-300 font-bold">{formatZar(subtotal)}</span></div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setIsCheckoutOpen(false)} className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs">Cancel</button>
                  <button
                    onClick={() => {
                      setConfirmedOrderId(`ULT-${Math.floor(100000 + Math.random() * 900000)}`);
                      setCart([]);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    Confirm & Complete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Order Confirmed!</h3>
                <p className="text-xs text-slate-400 font-mono">Reference: <span className="text-cyan-300">{confirmedOrderId}</span></p>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setConfirmedOrderId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs font-mono"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
