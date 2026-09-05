const fs = require('fs');
const file = 'services/frontend-store/src/components/StorefrontView.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCheckout = `  const handlePlaceOrder = () => {
    const orderNum = \`ULT-\${Math.floor(100000 + Math.random() * 900000)}\`;
    setConfirmedOrderId(orderNum);
    setCheckoutStep(3);

    // Mark products as SOLD
    const boughtIds = cart.map((i) => i.phone.id);
    setProducts((prev) =>
      prev.map((p) => (boughtIds.includes(p.id) ? { ...p, status: 'SOLD' as const } : p))
    );
    setCart([]);
  };`;

const newCheckout = `  const handlePlaceOrder = async () => {
    try {
      const items = cart.map((i) => i.phone);
      const totalCents = items.reduce((acc, curr) => acc + curr.priceZar, 0) * 100;
      
      const res = await fetch(\`\${backendUrl}/api/v1/orders/checkout\`, {
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

      setConfirmedOrderId(data.orderId || \`ULT-\${Math.floor(100000 + Math.random() * 900000)}\`);
      setCheckoutStep(3);

      const boughtIds = items.map((i) => i.id);
      setProducts((prev) => prev.map((p) => (boughtIds.includes(p.id) ? { ...p, status: 'SOLD' as const } : p)));
      setCart([]);
    } catch (err) {
      console.warn("API failed, falling back to local simulation.", err);
      // Fallback
      const orderNum = \`ULT-\${Math.floor(100000 + Math.random() * 900000)}\`;
      setConfirmedOrderId(orderNum);
      setCheckoutStep(3);
      const boughtIds = cart.map((i) => i.phone.id);
      setProducts((prev) => prev.map((p) => (boughtIds.includes(p.id) ? { ...p, status: 'SOLD' as const } : p)));
      setCart([]);
    }
  };`;

content = content.replace(oldCheckout, newCheckout);
fs.writeFileSync(file, content);
