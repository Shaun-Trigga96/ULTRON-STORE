import { InventoryPhone } from '../types';

export interface StoreProduct extends InventoryPhone {
  tagline: string;
  imageUrl: string;
  galleryImages: string[];
  colorSwatches: { name: string; hex: string }[];
  monthlyFinancingZar: number;
  specs: {
    screen: string;
    chipset: string;
    ram: string;
    camera: string;
    network: string;
    os: string;
  };
  features: string[];
  inTheBox: string[];
  batteryCycleCount: number;
  originalPartVerified: boolean;
  warrantyMonths: number;
  imageColorHex: string;
  category: 'smartphones' | 'tablets' | 'accessories';
}

export const CATALOG_PRODUCTS: StoreProduct[] = [
  {
    id: 'ph_01',
    imei: '354892019482910',
    serialNumber: 'SN-APL-15PM-0981',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storageGb: 256,
    color: 'Natural Titanium',
    conditionGrade: 'MINT',
    batteryHealthPct: 98,
    cosmeticRating: 10,
    priceZar: 22499,
    monthlyFinancingZar: 1875,
    warehouseLocation: 'CPT-WH-01 / BIN-A-12',
    status: 'AVAILABLE',
    tagline: 'Grade A+ Pristine condition. Aerospace-grade titanium chassis with zero scratches. 100% genuine Apple components.',
    category: 'smartphones',
    imageColorHex: '#9ca3af',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1695048065057-2ff2284931a7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Natural Titanium', hex: '#9ca3af' },
      { name: 'Blue Titanium', hex: '#334155' },
      { name: 'White Titanium', hex: '#e2e8f0' },
      { name: 'Black Titanium', hex: '#18181b' }
    ],
    batteryCycleCount: 42,
    originalPartVerified: true,
    warrantyMonths: 12,
    specs: {
      screen: '6.7" Super Retina XDR OLED (120Hz ProMotion)',
      chipset: 'Apple A17 Pro (3nm)',
      ram: '8GB Unified',
      camera: '48MP Main + 12MP 5x Periscope Telephoto + 12MP Ultra-Wide',
      network: '5G Sub-6 & mmWave, Dual eSIM',
      os: 'iOS 17.5 Upgradable'
    },
    features: [
      'Titanium frame with textured matte glass back',
      'Action Button configured for custom workflows',
      'USB-C 3.0 with 10Gbps data transfer rate',
      'Face ID sensor 100% functional, TrueTone calibrated'
    ],
    inTheBox: ['Certified Pre-Owned iPhone', 'Braided USB-C to C 1m Cable', 'Ultron 40-Point Diagnostic Deed']
  },
  {
    id: 'ph_02',
    imei: '358291029482109',
    serialNumber: 'SN-SMG-S24U-4820',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    storageGb: 512,
    color: 'Titanium Black',
    conditionGrade: 'GOOD',
    batteryHealthPct: 94,
    cosmeticRating: 9,
    priceZar: 19999,
    monthlyFinancingZar: 1666,
    warehouseLocation: 'JHB-WH-02 / BIN-C-05',
    status: 'AVAILABLE',
    tagline: 'Near-mint condition with integrated S-Pen stylus and Galaxy AI suite enabled.',
    category: 'smartphones',
    imageColorHex: '#1e293b',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Titanium Black', hex: '#1e293b' },
      { name: 'Titanium Gray', hex: '#71717a' },
      { name: 'Titanium Violet', hex: '#581c87' }
    ],
    batteryCycleCount: 110,
    originalPartVerified: true,
    warrantyMonths: 12,
    specs: {
      screen: '6.8" Dynamic LTPO AMOLED 2X (2600 nits peak)',
      chipset: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12GB LPDDR5X',
      camera: '200MP Main + 50MP 5x Telephoto + 10MP 3x + 12MP Ultra-Wide',
      network: '5G Dual SIM (Nano-SIM + eSIM)',
      os: 'One UI 6.1 (Android 14)'
    },
    features: [
      'Corning Gorilla Armor anti-reflective display glass',
      'Integrated Bluetooth low-energy S-Pen',
      'Live Translate and Circle to Search AI tools',
      'Ultrasonic under-display fingerprint reader tested'
    ],
    inTheBox: ['Samsung Galaxy S24 Ultra', 'Original S-Pen', 'USB-C Cable', 'SIM Eject Tool']
  },
  {
    id: 'ph_03',
    imei: '867123901827461',
    serialNumber: 'SN-GGL-P8P-3319',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    storageGb: 128,
    color: 'Bay Blue',
    conditionGrade: 'FAIR',
    batteryHealthPct: 89,
    cosmeticRating: 8,
    priceZar: 14499,
    monthlyFinancingZar: 1208,
    warehouseLocation: 'CPT-WH-01 / BIN-B-29',
    status: 'AVAILABLE',
    tagline: 'Light signs of wear along bezel; screen flawless with matte protector. Exceptional camera value.',
    category: 'smartphones',
    imageColorHex: '#38bdf8',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Bay Blue', hex: '#38bdf8' },
      { name: 'Obsidian', hex: '#0f172a' },
      { name: 'Porcelain', hex: '#f8fafc' }
    ],
    batteryCycleCount: 215,
    originalPartVerified: true,
    warrantyMonths: 6,
    specs: {
      screen: '6.7" Super Actua OLED (1-120Hz LTPO)',
      chipset: 'Google Tensor G3 (Titan M2 Security)',
      ram: '12GB LPDDR5X',
      camera: '50MP Octa PD + 48MP Quad PD Telephoto + 48MP Ultra-Wide',
      network: '5G Sub-6, Wi-Fi 7',
      os: 'Stock Android 14 (7 Years OS Updates)'
    },
    features: [
      'Best Take and Magic Editor computational photography',
      'Built-in temperature sensor on camera visor',
      'Full day 5050mAh battery endurance verified',
      'IP68 dust/water integrity seals pressure-tested'
    ],
    inTheBox: ['Google Pixel 8 Pro', 'Quick Switch Adapter', 'USB-C 3.0 Charging Cable']
  },
  {
    id: 'ph_04',
    imei: '359102948291039',
    serialNumber: 'SN-APL-14P-1928',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storageGb: 256,
    color: 'Deep Purple',
    conditionGrade: 'MINT',
    batteryHealthPct: 96,
    cosmeticRating: 10,
    priceZar: 16999,
    monthlyFinancingZar: 1416,
    warehouseLocation: 'JHB-WH-02 / BIN-A-04',
    status: 'AVAILABLE',
    tagline: 'Iconic Deep Purple edition. Dynamic Island display, tested and certified 100% clean ESN.',
    category: 'smartphones',
    imageColorHex: '#581c87',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Deep Purple', hex: '#581c87' },
      { name: 'Space Black', hex: '#18181b' },
      { name: 'Silver', hex: '#f1f5f9' },
      { name: 'Gold', hex: '#fef08a' }
    ],
    batteryCycleCount: 88,
    originalPartVerified: true,
    warrantyMonths: 12,
    specs: {
      screen: '6.1" Super Retina XDR OLED (Dynamic Island)',
      chipset: 'Apple A16 Bionic (4nm)',
      ram: '6GB LPDDR5',
      camera: '48MP Main + 12MP 3x Telephoto + 12MP Ultra-Wide',
      network: '5G, Wi-Fi 6',
      os: 'iOS 17'
    },
    features: [
      'Always-On display with ProMotion 120Hz',
      'Emergency SOS via satellite & Crash Detection',
      'Original Apple battery with 96% health verified',
      'All original internal components verified with Apple AST2 tooling'
    ],
    inTheBox: ['Certified Pre-Owned iPhone 14 Pro', 'Lightning to USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_05',
    imei: '861029481920491',
    serialNumber: 'SN-1P-12-7712',
    brand: 'OnePlus',
    model: 'OnePlus 12',
    storageGb: 512,
    color: 'Silky Black',
    conditionGrade: 'MINT',
    batteryHealthPct: 99,
    cosmeticRating: 10,
    priceZar: 15999,
    monthlyFinancingZar: 1333,
    warehouseLocation: 'CPT-WH-01 / BIN-C-19',
    status: 'AVAILABLE',
    tagline: 'Open-box unit with 100W SuperVOOC rapid charging and 4th Gen Hasselblad camera system.',
    category: 'smartphones',
    imageColorHex: '#18181b',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Silky Black', hex: '#18181b' },
      { name: 'Flowy Emerald', hex: '#065f46' }
    ],
    batteryCycleCount: 14,
    originalPartVerified: true,
    warrantyMonths: 12,
    specs: {
      screen: '6.82" ProXDR 2K 120Hz Oriental Screen (4500 nits)',
      chipset: 'Snapdragon 8 Gen 3',
      ram: '16GB LPDDR5X',
      camera: '50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-Wide',
      network: '5G Dual SIM, Wi-Fi 7',
      os: 'OxygenOS 14 (Android 14)'
    },
    features: [
      'Dual Cryo-velocity VC cooling system for sustained gaming',
      '5400mAh dual-cell battery with 100W wired & 50W wireless charging',
      'Hasselblad portrait mode color grading engine',
      'Aqua Touch technology for seamless touch accuracy in rain'
    ],
    inTheBox: ['OnePlus 12', '100W SuperVOOC Power Adapter', 'Type-C Red Cable', 'Factory Case']
  },
  {
    id: 'ph_06',
    imei: '357182940192847',
    serialNumber: 'SN-APL-M3M-0182',
    brand: 'Apple',
    model: 'MacBook Pro 14" M3 Pro',
    storageGb: 512,
    color: 'Space Black',
    conditionGrade: 'MINT',
    batteryHealthPct: 100,
    cosmeticRating: 10,
    priceZar: 34999,
    monthlyFinancingZar: 2916,
    warehouseLocation: 'JHB-WH-01 / VAULT-02',
    status: 'AVAILABLE',
    tagline: 'Spotless Space Black anodized chassis. 18GB Unified RAM, 100% battery capacity.',
    category: 'tablets',
    imageColorHex: '#27272a',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Space Black', hex: '#27272a' },
      { name: 'Silver', hex: '#e2e8f0' }
    ],
    batteryCycleCount: 19,
    originalPartVerified: true,
    warrantyMonths: 12,
    specs: {
      screen: '14.2" Liquid Retina XDR (1600 nits peak HDR)',
      chipset: 'Apple M3 Pro (11-core CPU, 14-core GPU)',
      ram: '18GB Unified Memory',
      camera: '1080p FaceTime HD Camera',
      network: 'Wi-Fi 6E, Bluetooth 5.3',
      os: 'macOS Sonoma'
    },
    features: [
      'Hardware-accelerated ray tracing & mesh shading',
      'Up to 18 hours wireless web battery life',
      'Six-speaker sound system with force-cancelling woofers',
      'MagSafe 3, three Thunderbolt 4 ports, HDMI, SDXC slot'
    ],
    inTheBox: ['MacBook Pro 14"', '70W USB-C Power Adapter', 'USB-C to MagSafe 3 Cable (Space Black)']
  },
  {
    id: 'ph_07',
    imei: '829103948572102',
    serialNumber: 'SN-APL-13P-4829',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    storageGb: 256,
    color: 'Sierra Blue',
    conditionGrade: 'GOOD',
    batteryHealthPct: 88,
    cosmeticRating: 8,
    priceZar: 11499,
    monthlyFinancingZar: 958,
    warehouseLocation: 'CPT-WH-02 / BIN-A-11',
    status: 'AVAILABLE',
    tagline: 'The iconic Sierra Blue. ProMotion display and incredible battery life at an unbeatable value.',
    category: 'smartphones',
    imageColorHex: '#bfdbfe',
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Sierra Blue', hex: '#bfdbfe' },
      { name: 'Graphite', hex: '#374151' }
    ],
    batteryCycleCount: 310,
    originalPartVerified: true,
    warrantyMonths: 6,
    specs: {
      screen: '6.1" Super Retina XDR OLED (120Hz)',
      chipset: 'Apple A15 Bionic (5nm)',
      ram: '6GB LPDDR4X',
      camera: '12MP Main + 12MP 3x Telephoto + 12MP Ultra-Wide',
      network: '5G, Wi-Fi 6',
      os: 'iOS 17'
    },
    features: [
      'Macro photography mode',
      'Cinematic mode in 1080p at 30 fps',
      'Surgical-grade stainless steel edges'
    ],
    inTheBox: ['Certified Pre-Owned iPhone 13 Pro', 'Lightning to USB-C Cable']
  },
  {
    id: 'acc_01',
    imei: 'N/A',
    serialNumber: 'SN-APL-AW9-4411',
    brand: 'Apple',
    model: 'Watch Series 9',
    storageGb: 64,
    color: 'Midnight',
    conditionGrade: 'MINT',
    batteryHealthPct: 100,
    cosmeticRating: 10,
    priceZar: 7999,
    monthlyFinancingZar: 666,
    warehouseLocation: 'JHB-WH-01 / ACC-B-02',
    status: 'AVAILABLE',
    tagline: 'Smarter. Brighter. Mightier. Open-box unit, never worn.',
    category: 'accessories',
    imageColorHex: '#1e293b',
    imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'Midnight', hex: '#1e293b' },
      { name: 'Starlight', hex: '#f8fafc' }
    ],
    batteryCycleCount: 0,
    originalPartVerified: true,
    warrantyMonths: 12,
    specs: {
      screen: '1.9" Retina LTPO OLED (2000 nits)',
      chipset: 'Apple S9 SiP',
      ram: '1GB',
      camera: 'N/A',
      network: 'GPS + Cellular, Wi-Fi 4',
      os: 'watchOS 10'
    },
    features: [
      'Double tap gesture control',
      'Blood oxygen sensor and ECG app',
      'Precision Finding for iPhone'
    ],
    inTheBox: ['Apple Watch Series 9', 'Midnight Sport Band', 'Magnetic Fast Charger to USB-C Cable']
  },
  {
    id: 'acc_02',
    imei: 'N/A',
    serialNumber: 'SN-APL-APP2-9901',
    brand: 'Apple',
    model: 'AirPods Pro (2nd Gen)',
    storageGb: 0,
    color: 'White',
    conditionGrade: 'MINT',
    batteryHealthPct: 100,
    cosmeticRating: 10,
    priceZar: 4499,
    monthlyFinancingZar: 375,
    warehouseLocation: 'JHB-WH-01 / ACC-A-01',
    status: 'AVAILABLE',
    tagline: 'Rebuilt from the sound up. Sealed open-box unit.',
    category: 'accessories',
    imageColorHex: '#ffffff',
    imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=85'
    ],
    colorSwatches: [
      { name: 'White', hex: '#ffffff' }
    ],
    batteryCycleCount: 0,
    originalPartVerified: true,
    warrantyMonths: 12,
    specs: {
      screen: 'N/A',
      chipset: 'Apple H2 Headphone Chip',
      ram: 'N/A',
      camera: 'N/A',
      network: 'Bluetooth 5.3',
      os: 'Firmware 6B34'
    },
    features: [
      'Up to 2x more Active Noise Cancellation',
      'Adaptive Audio & Personalized Spatial Audio',
      'MagSafe Charging Case with speaker and lanyard loop'
    ],
    inTheBox: ['AirPods Pro (2nd Gen)', 'MagSafe Charging Case (USB-C)', 'Silicone ear tips (4 sizes)', 'USB-C Charge Cable']
  }
];
