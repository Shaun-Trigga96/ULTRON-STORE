import React, { useState, useEffect } from 'react';
import { AuthModal } from '../modules/auth/AuthModal';
import { OrderHistoryModal } from '../modules/orders/OrderHistoryModal';
import { CheckoutModal } from '../modules/checkout/CheckoutModal';
import { StoreProduct, CATALOG_PRODUCTS } from '../data/storeProducts';
import { CartItem } from '../types';
import { ProductGrid } from './ProductGrid';
import { ProductPDP } from './ProductPDP';
import { SiteHeader } from './layout/SiteHeader';
import { SiteFooter } from './layout/SiteFooter';
import { Hero, BrandTiles, GradeGuide, TrustRow, WhyPreOwned, NewsletterCta } from './home/HomeSections';
import { CartDrawer } from './cart/CartDrawer';
import { ConnectionModal } from './ConnectionModal';

const BRAND_FILTERS = ['ALL', 'Apple', 'Samsung', 'Google', 'Accessories'];
const GRADE_FILTERS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Any grade' },
  { id: 'MINT', label: 'Mint' },
  { id: 'GOOD', label: 'Good' },
  { id: 'FAIR', label: 'Fair' },
];

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
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['Apple', 'Samsung', 'Google', 'Accessories', 'ALL'].includes(hash)) {
        setSelectedBrand(hash);
        setTimeout(() => {
          document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === 'Shop') {
        setTimeout(() => {
          document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (hash === 'Support' || hash === 'Grading') {
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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

    const matchesBrand = selectedBrand === 'ALL' || 
                         (selectedBrand.toUpperCase() === 'ACCESSORIES' ? product.category === 'accessories' : product.brand.toUpperCase() === selectedBrand.toUpperCase());
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

  const featured = products.find((p) => p.id === 'ph_a1') || products[0];

  const signOut = () => {
    setAuthToken(null);
    localStorage.removeItem('token');
    setUserProfile(null);
  };

  const pickGrade = (grade: string) => {
    setSelectedGrade(grade);
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        isSignedIn={!!authToken}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={signOut}
        onOpenOrders={() => setShowOrderHistory(true)}
      />

      <main className="flex-1">
        <Hero featured={featured} onView={setSelectedProduct} />
        <BrandTiles />

        <section id="product-grid" className="scroll-mt-20 border-t border-line py-14 sm:py-16">
          <div className="container-page">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
              <div>
                <h2 className="font-display font-extrabold text-[34px] sm:text-[42px] leading-none">
                  {selectedBrand === 'ALL' ? 'Shop all devices' : selectedBrand}
                </h2>
                <p className="mt-2 text-[16px] text-muted">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'device' : 'devices'} · One unit each. When it&apos;s gone, it&apos;s gone.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-[14px] text-muted">Sort</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="min-h-[44px] rounded-full border-[1.5px] border-ink bg-white px-4 pr-8 text-[14px] cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="battery">Battery health</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-10">
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by brand">
                {BRAND_FILTERS.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    aria-pressed={selectedBrand.toUpperCase() === brand.toUpperCase()}
                    onClick={() => { setSelectedBrand(brand); window.history.replaceState(null, '', `#${brand}`); }}
                    className="chip"
                  >
                    {brand === 'ALL' ? 'All devices' : brand}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by grade">
                {GRADE_FILTERS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={selectedGrade === g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className="chip !border-line aria-pressed:!border-ink"
                  >
                    {g.label}
                  </button>
                ))}
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="chip !border-volt text-volt">
                    &ldquo;{searchQuery}&rdquo; ✕
                  </button>
                )}
              </div>
            </div>

            <ProductGrid
              products={filteredProducts}
              onSelectProduct={(p) => { setSelectedProduct(p); setActiveModalImage(p.imageUrl); }}
              onAddToCart={handleAddToCart}
            />
          </div>
        </section>

        <GradeGuide onPick={pickGrade} />
        <TrustRow />
        <WhyPreOwned />
        <NewsletterCta />
      </main>

      <SiteFooter isLive={serverStatus === 'CONNECTED'} onOpenConnection={() => setIsServerModalOpen(true)} />

      <CartDrawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        lockTimeRemaining={lockTimeRemaining}
        subtotal={subtotal}
        shippingCost={shippingCost}
        total={total}
        onRemove={handleRemoveFromCart}
        onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); setCheckoutStep(1); }}
      />

      <ProductPDP
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod) => { handleAddToCart(prod); setSelectedProduct(null); }}
        isAddingToCart={false}
      />

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

      <ConnectionModal
        open={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
        status={serverStatus}
        message={serverHealthMessage}
        onUseStandalone={() => {
          setServerStatus('STANDALONE');
          setServerHealthMessage('Using demo data in the browser. No backend needed.');
        }}
        onTest={testBackendConnection}
      />
    </div>
  );
};
