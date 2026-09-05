const http = require('http');

const PORT = process.env.PORT || 4002;

const DEVICES = [
  {
    id: 'ph_01',
    imei: '354892019482910',
    serialNumber: 'F2LL89V0PZ',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storageGb: 256,
    color: 'Natural Titanium',
    conditionGrade: 'MINT',
    batteryHealthPct: 98,
    batteryCycleCount: 42,
    cosmeticRating: 9.8,
    priceZar: 22499,
    originalMSRPZar: 28999,
    savingsZar: 6500,
    warehouseLocation: 'CPT-WH-01 / Shelf B-14',
    tagline: 'Grade A+ Pristine condition with zero micro-scratches. 100% genuine Apple components.',
    imageColorHex: '#9ca3af',
    specs: {
      screen: '6.7-inch Super Retina XDR OLED (120Hz ProMotion)',
      chipset: 'Apple A17 Pro (3nm)',
      ram: '8GB Unified Memory',
      camera: '48MP Main (f/1.8, Sensor-shift OIS) + 12MP 5x Periscope + 12MP Ultra-Wide'
    },
    inTheBox: ['Certified Pre-Owned Device', 'Braided USB-C to USB-C Fast Cable', 'Official 12-Month Guarantee Passport']
  },
  {
    id: 'ph_02',
    imei: '358291029482109',
    serialNumber: 'R5CW301X9AA',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storageGb: 512,
    color: 'Titanium Black',
    conditionGrade: 'GOOD',
    batteryHealthPct: 94,
    batteryCycleCount: 112,
    cosmeticRating: 9.2,
    priceZar: 19999,
    originalMSRPZar: 26999,
    savingsZar: 7000,
    warehouseLocation: 'JHB-WH-02 / Shelf A-08',
    tagline: 'Near-mint condition with integrated S-Pen stylus and Galaxy AI suite enabled.',
    imageColorHex: '#1e293b',
    specs: {
      screen: '6.8-inch Dynamic AMOLED 2X (1-120Hz, 2600 nits)',
      chipset: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12GB LPDDR5X',
      camera: '200MP Main + 50MP 5x Periscope + 10MP 3x Telephoto + 12MP Ultra-Wide'
    },
    inTheBox: ['Certified Device with S-Pen', 'USB-C to C High-Speed Data Cable', 'ULTRON Inspection Passport']
  },
  {
    id: 'ph_03',
    imei: '867123901827461',
    serialNumber: '38191FDH29',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    storageGb: 128,
    color: 'Bay Blue',
    conditionGrade: 'FAIR',
    batteryHealthPct: 89,
    batteryCycleCount: 198,
    cosmeticRating: 8.5,
    priceZar: 14499,
    originalMSRPZar: 20999,
    savingsZar: 6500,
    warehouseLocation: 'CPT-WH-01 / Shelf C-02',
    tagline: 'Light signs of wear along bezel; screen flawless with matte protector. Exceptional camera value.',
    imageColorHex: '#38bdf8',
    specs: {
      screen: '6.7-inch Super Actua LTPO OLED (1-120Hz, 2400 nits)',
      chipset: 'Google Tensor G3 (Titan M2 Security)',
      ram: '12GB LPDDR5X',
      camera: '50MP Octa PD Main + 48MP Quad PD 5x Telephoto + 48MP Ultra-Wide'
    },
    inTheBox: ['Pixel 8 Pro Handset', 'USB-C Cable', 'Quick Switch Adapter', 'Diagnostic Certificate']
  },
  {
    id: 'ph_04',
    imei: '359102948291039',
    serialNumber: 'H90K2801LP',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storageGb: 256,
    color: 'Deep Purple',
    conditionGrade: 'MINT',
    batteryHealthPct: 96,
    batteryCycleCount: 88,
    cosmeticRating: 9.7,
    priceZar: 16999,
    originalMSRPZar: 23999,
    savingsZar: 7000,
    warehouseLocation: 'JHB-WH-02 / Shelf B-05',
    tagline: 'Iconic Deep Purple edition. Dynamic Island display, tested and certified 100% clean ESN.',
    imageColorHex: '#581c87',
    specs: {
      screen: '6.1-inch Super Retina XDR OLED with Always-On',
      chipset: 'Apple A16 Bionic (4nm)',
      ram: '6GB Unified Memory',
      camera: '48MP Main + 12MP 3x Telephoto + 12MP Ultra-Wide'
    },
    inTheBox: ['iPhone 14 Pro Handset', 'Lightning to USB-C Cable', 'ULTRON Inspection Passport']
  },
  {
    id: 'ph_05',
    imei: '861029481920491',
    serialNumber: 'OP12998412',
    brand: 'OnePlus',
    model: 'OnePlus 12',
    storageGb: 512,
    color: 'Silky Black',
    conditionGrade: 'MINT',
    batteryHealthPct: 99,
    batteryCycleCount: 18,
    cosmeticRating: 9.9,
    priceZar: 15999,
    originalMSRPZar: 21999,
    savingsZar: 6000,
    warehouseLocation: 'CPT-WH-01 / Shelf D-11',
    tagline: 'Open-box unit with 100W SuperVOOC rapid charging and 4th Gen Hasselblad camera system.',
    imageColorHex: '#18181b',
    specs: {
      screen: '6.82-inch 2K ProXDR Display (1-120Hz LTPO 4.0)',
      chipset: 'Snapdragon 8 Gen 3',
      ram: '16GB LPDDR5X',
      camera: '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-Wide'
    },
    inTheBox: ['OnePlus 12 Device', '100W SuperVOOC Power Adapter', 'Type-C Red Cable', 'Warranty Card']
  }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. Health
  if (pathname === '/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'UP',
      service: 'catalog-service',
      port: PORT,
      version: '1.0.0',
      totalDevices: DEVICES.length,
      timestamp: new Date().toISOString()
    });
  }

  // 2. All Devices
  if (pathname === '/api/v1/catalog/devices' && req.method === 'GET') {
    const brand = url.searchParams.get('brand');
    const grade = url.searchParams.get('grade');
    const minBattery = url.searchParams.get('minBattery');

    let results = [...DEVICES];
    if (brand && brand !== 'ALL') {
      results = results.filter(d => d.brand.toUpperCase() === brand.toUpperCase());
    }
    if (grade && grade !== 'ALL') {
      results = results.filter(d => d.conditionGrade === grade);
    }
    if (minBattery) {
      results = results.filter(d => d.batteryHealthPct >= parseInt(minBattery, 10));
    }

    return sendJson(res, 200, {
      success: true,
      count: results.length,
      data: results
    });
  }

  // 3. Single Device by ID or IMEI
  const deviceMatch = pathname.match(/^\/api\/v1\/catalog\/devices\/([0-9a-zA-Z_]+)$/);
  if (deviceMatch && req.method === 'GET') {
    const query = deviceMatch[1];
    const device = DEVICES.find(d => d.id === query || d.imei === query);
    if (!device) {
      return sendJson(res, 404, { success: false, error: `Device not found: ${query}` });
    }
    return sendJson(res, 200, { success: true, data: device });
  }

  // 4. 40-Point Hardware Diagnostics Passport for IMEI
  const diagMatch = pathname.match(/^\/api\/v1\/catalog\/diagnostics\/([0-9a-zA-Z_]+)$/);
  if (diagMatch && req.method === 'GET') {
    const query = diagMatch[1];
    const device = DEVICES.find(d => d.id === query || d.imei === query);
    if (!device) {
      return sendJson(res, 404, { success: false, error: `Device not found for diagnostic query: ${query}` });
    }

    return sendJson(res, 200, {
      success: true,
      imei: device.imei,
      serialNumber: device.serialNumber,
      model: `${device.brand} ${device.model}`,
      certifiedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      inspectorBadgeId: 'ULTRON-TECH-8491',
      overallResult: 'PASSED_100_PERCENT',
      conditionGrade: device.conditionGrade,
      battery: {
        healthPercentage: device.batteryHealthPct,
        cycleCount: device.batteryCycleCount,
        originalOEMPart: true,
        degradationStatus: device.batteryHealthPct >= 95 ? 'OPTIMAL' : 'GOOD'
      },
      hardwareChecks: [
        { test: 'ESN / Blacklist / Stolen Database Check', status: 'CLEAN_VERIFIED', database: 'CheckMEND Global' },
        { test: 'Biometric Face ID / Under-Display Fingerprint', status: 'PASSED', latencyMs: 140 },
        { test: 'OEM OLED Display Colorimeter Calibration', status: 'PASSED', trueToneActive: true },
        { test: '5G Sub-6GHz & mmWave RF Radio Transceivers', status: 'PASSED', signalDb: -78 },
        { test: 'Dual-Noise-Cancelling Array & Loudspeakers', status: 'PASSED', thdPercent: 0.12 },
        { test: 'Qi2 / MagSafe Wireless & SuperVOOC Wired Charging', status: 'PASSED', maxWattsTested: 45 },
        { test: 'Hermetic Seal Barometric Pressure Differential (IP68)', status: 'PASSED', deltaKpa: 0.04 },
        { test: 'Camera OIS Gyroscope & Periscope Telephoto Alignment', status: 'PASSED', focusTimeMs: 85 }
      ]
    });
  }

  // 5. Brands List
  if (pathname === '/api/v1/catalog/brands' && req.method === 'GET') {
    const brands = [...new Set(DEVICES.map(d => d.brand))];
    return sendJson(res, 200, { success: true, brands });
  }

  // 6. Catalog Stats
  if (pathname === '/api/v1/catalog/stats' && req.method === 'GET') {
    const avgBattery = Math.round(DEVICES.reduce((acc, d) => acc + d.batteryHealthPct, 0) / DEVICES.length);
    const avgPrice = Math.round(DEVICES.reduce((acc, d) => acc + d.priceZar, 0) / DEVICES.length);
    return sendJson(res, 200, {
      success: true,
      totalUnits: DEVICES.length,
      averageBatteryHealthPct: avgBattery,
      averagePriceZar: avgPrice,
      grades: {
        mint: DEVICES.filter(d => d.conditionGrade === 'MINT').length,
        good: DEVICES.filter(d => d.conditionGrade === 'GOOD').length,
        fair: DEVICES.filter(d => d.conditionGrade === 'FAIR').length
      }
    });
  }

  return sendJson(res, 404, { success: false, error: 'Route not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ULTRON Catalog Service] Listening on http://0.0.0.0:${PORT}`);
});
