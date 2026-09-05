const fs = require('fs');
const file = 'services/frontend-store/src/components/StorefrontView.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  // Server Connection & Standalone Mode state
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:4001');
  const [serverStatus, setServerStatus] = useState<'STANDALONE' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('STANDALONE');
  const [serverHealthMessage, setServerHealthMessage] = useState<string>(
    'Frontend is currently operating in Standalone Client Mode. All catalog browsing, filtering, Redlock stock reservations, and checkout simulations run locally with zero server dependency.'
  );

  // Checkout flow state`;

const replacementStr = `  // Server Connection & Standalone Mode state
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8080');
  const [serverStatus, setServerStatus] = useState<'STANDALONE' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('CONNECTING');
  const [serverHealthMessage, setServerHealthMessage] = useState<string>('Connecting to API Gateway...');

  useEffect(() => {
    const fetchLiveInventory = async () => {
      try {
        const res = await fetch(\`\${backendUrl}/api/v1/inventory\`);
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
              warehouseLocation: \`\${row.warehouse_facility_code} / \${row.warehouse_bin_location}\`,
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

  // Checkout flow state`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content);
