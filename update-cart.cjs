const fs = require('fs');
const file = 'services/frontend-store/src/components/StorefrontView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add sessionId state
content = content.replace(
  "  const [serverHealthMessage, setServerHealthMessage] = useState<string>('Connecting to API Gateway...');",
  "  const [serverHealthMessage, setServerHealthMessage] = useState<string>('Connecting to API Gateway...');\n  const [sessionId] = useState<string>('session_' + Math.random().toString(36).substr(2, 9));"
);

// Replace handleAddToCart
const oldAdd = `  const handleAddToCart = (product: StoreProduct) => {
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
  };`;

const newAdd = `  const handleAddToCart = async (product: StoreProduct) => {
    if (product.status !== 'AVAILABLE') return;

    try {
      const res = await fetch(\`\${backendUrl}/api/v1/inventory/lock\`, {
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
  };`;

content = content.replace(oldAdd, newAdd);

// Replace handleRemoveFromCart
const oldRemove = `  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.phone.id !== productId));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: 'AVAILABLE' as const } : p
      )
    );
  };`;

const newRemove = `  const handleRemoveFromCart = async (productId: string) => {
    const itemToRemove = cart.find(i => i.phone.id === productId);
    if (itemToRemove) {
      try {
        await fetch(\`\${backendUrl}/api/v1/inventory/release\`, {
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
  };`;

content = content.replace(oldRemove, newRemove);

fs.writeFileSync(file, content);
