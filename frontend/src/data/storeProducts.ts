export type StoreProduct = {
  id: string;
  imei: string;
  serialNumber: string;
  brand: string;
  model: string;
  storageGb: number;
  color: string;
  conditionGrade: 'MINT' | 'GOOD' | 'FAIR';
  batteryHealthPct: number;
  cosmeticRating: number;
  priceZar: number;
  monthlyFinancingZar: number;
  warehouseLocation: string;
  status: 'AVAILABLE' | 'LOCKED_CHECKOUT_HOLD' | 'SOLD';
  tagline: string;
  category: 'smartphones' | 'tablets' | 'accessories';
  imageUrl: string;
  imageColorHex: string;
  galleryImages?: string[];
  colorSwatches?: { name: string; hex: string }[];
  batteryCycleCount: number;
  originalPartVerified: boolean;
  warrantyMonths: number;
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
};

export const CATALOG_PRODUCTS: StoreProduct[] = [
  // APPLE
  {
    id: 'ph_a1', imei: '358900112233441', serialNumber: 'SN-APL-15PM-001',
    brand: 'Apple', model: 'iPhone 15 Pro Max', storageGb: 256, color: 'Natural Titanium', conditionGrade: 'MINT', batteryHealthPct: 100, cosmeticRating: 10,
    priceZar: 23999, monthlyFinancingZar: 1999, warehouseLocation: 'JHB-WH-01 / BIN-A-01', status: 'AVAILABLE',
    tagline: 'Titanium. So strong. So light. So Pro.', category: 'smartphones', imageColorHex: '#b2aba1',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 5, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.7" Super Retina XDR OLED', chipset: 'Apple A17 Pro (3nm)', ram: '8GB', camera: '48MP Main + 12MP 5x Telephoto + 12MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'iOS 17' },
    features: ['Grade A+ mint condition', 'Action Button', 'USB-C'], inTheBox: ['Certified Pre-Owned iPhone', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_a2', imei: '358900112233442', serialNumber: 'SN-APL-14P-001',
    brand: 'Apple', model: 'iPhone 14 Pro', storageGb: 128, color: 'Deep Purple', conditionGrade: 'GOOD', batteryHealthPct: 92, cosmeticRating: 8,
    priceZar: 17999, monthlyFinancingZar: 1499, warehouseLocation: 'CPT-WH-02 / BIN-B-12', status: 'AVAILABLE',
    tagline: 'A magical new way to interact with iPhone.', category: 'smartphones', imageColorHex: '#4d4659',
    imageUrl: 'https://images.unsplash.com/photo-1678652733566-3d2331c1f77d?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 215, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.1" Super Retina XDR OLED', chipset: 'Apple A16 Bionic (4nm)', ram: '6GB', camera: '48MP Main + 12MP 3x Telephoto + 12MP Ultra-Wide', network: '5G, Wi-Fi 6', os: 'iOS 17' },
    features: ['Dynamic Island', 'Always-On display', 'Crash Detection'], inTheBox: ['Certified Pre-Owned iPhone', 'Lightning Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_a3', imei: '358900112233443', serialNumber: 'SN-APL-13-001',
    brand: 'Apple', model: 'iPhone 13', storageGb: 128, color: 'Midnight', conditionGrade: 'MINT', batteryHealthPct: 98, cosmeticRating: 9,
    priceZar: 11499, monthlyFinancingZar: 958, warehouseLocation: 'DBN-WH-01 / BIN-C-05', status: 'AVAILABLE',
    tagline: 'Your new superpower.', category: 'smartphones', imageColorHex: '#1d1d1f',
    imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 45, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.1" Super Retina XDR OLED', chipset: 'Apple A15 Bionic (5nm)', ram: '4GB', camera: '12MP Main + 12MP Ultra-Wide', network: '5G, Wi-Fi 6', os: 'iOS 17' },
    features: ['Cinematic mode', 'Super Retina XDR display', 'Ceramic Shield'], inTheBox: ['Certified Pre-Owned iPhone', 'Lightning Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_a4', imei: '358900112233444', serialNumber: 'SN-APL-12-001',
    brand: 'Apple', model: 'iPhone 12', storageGb: 64, color: 'Blue', conditionGrade: 'FAIR', batteryHealthPct: 85, cosmeticRating: 6,
    priceZar: 7999, monthlyFinancingZar: 666, warehouseLocation: 'JHB-WH-01 / BIN-A-04', status: 'AVAILABLE',
    tagline: 'Blast past fast.', category: 'smartphones', imageColorHex: '#0f395c',
    imageUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 400, originalPartVerified: true, warrantyMonths: 6,
    specs: { screen: '6.1" Super Retina XDR OLED', chipset: 'Apple A14 Bionic (5nm)', ram: '4GB', camera: '12MP Main + 12MP Ultra-Wide', network: '5G, Wi-Fi 6', os: 'iOS 17' },
    features: ['MagSafe compatible', '5G Speed', 'OLED Display'], inTheBox: ['Certified Pre-Owned iPhone', 'Lightning Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_a5', imei: '358900112233445', serialNumber: 'SN-APL-SE-001',
    brand: 'Apple', model: 'iPhone SE (3rd Gen)', storageGb: 64, color: 'Starlight', conditionGrade: 'GOOD', batteryHealthPct: 91, cosmeticRating: 8,
    priceZar: 6499, monthlyFinancingZar: 541, warehouseLocation: 'CPT-WH-02 / BIN-B-08', status: 'AVAILABLE',
    tagline: 'Serious power. Serious value.', category: 'smartphones', imageColorHex: '#faf8f5',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 220, originalPartVerified: true, warrantyMonths: 6,
    specs: { screen: '4.7" Retina HD IPS LCD', chipset: 'Apple A15 Bionic (5nm)', ram: '4GB', camera: '12MP Main', network: '5G, Wi-Fi 6', os: 'iOS 17' },
    features: ['Touch ID', 'A15 Bionic Chip', 'Pocket-friendly'], inTheBox: ['Certified Pre-Owned iPhone', 'Lightning Cable', 'Ultron Diagnostic Passport']
  },

  // SAMSUNG
  {
    id: 'ph_s1', imei: '358900112233551', serialNumber: 'SN-SAM-S24U-001',
    brand: 'Samsung', model: 'Galaxy S24 Ultra', storageGb: 512, color: 'Titanium Gray', conditionGrade: 'MINT', batteryHealthPct: 100, cosmeticRating: 10,
    priceZar: 25999, monthlyFinancingZar: 2166, warehouseLocation: 'JHB-WH-01 / BIN-C-01', status: 'AVAILABLE',
    tagline: 'Galaxy AI is here.', category: 'smartphones', imageColorHex: '#5e5d59',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 2, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.8" Dynamic LTPO AMOLED 2X', chipset: 'Snapdragon 8 Gen 3', ram: '12GB', camera: '200MP Main + 50MP Periscope + 10MP Tele + 12MP Ultra-Wide', network: '5G, Wi-Fi 7', os: 'Android 14' },
    features: ['S Pen included', 'Titanium frame', 'Galaxy AI'], inTheBox: ['Certified Pre-Owned Galaxy', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_s2', imei: '358900112233552', serialNumber: 'SN-SAM-S23-001',
    brand: 'Samsung', model: 'Galaxy S23', storageGb: 256, color: 'Phantom Black', conditionGrade: 'GOOD', batteryHealthPct: 93, cosmeticRating: 8,
    priceZar: 12999, monthlyFinancingZar: 1083, warehouseLocation: 'CPT-WH-02 / BIN-C-12', status: 'AVAILABLE',
    tagline: 'Epic nights are coming.', category: 'smartphones', imageColorHex: '#1d1d1f',
    imageUrl: 'https://images.unsplash.com/photo-1674726245673-9b57e7932822?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 180, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.1" Dynamic AMOLED 2X', chipset: 'Snapdragon 8 Gen 2', ram: '8GB', camera: '50MP Main + 10MP Tele + 12MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'Android 14' },
    features: ['Nightography', 'Eco-conscious design', 'Fast Snapdragon processor'], inTheBox: ['Certified Pre-Owned Galaxy', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_s3', imei: '358900112233553', serialNumber: 'SN-SAM-ZF5-001',
    brand: 'Samsung', model: 'Galaxy Z Fold 5', storageGb: 512, color: 'Icy Blue', conditionGrade: 'MINT', batteryHealthPct: 97, cosmeticRating: 9,
    priceZar: 22999, monthlyFinancingZar: 1916, warehouseLocation: 'JHB-WH-01 / BIN-C-05', status: 'AVAILABLE',
    tagline: 'The ultimate foldable experience.', category: 'smartphones', imageColorHex: '#9bb2be',
    imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 60, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '7.6" Foldable Dynamic AMOLED 2X', chipset: 'Snapdragon 8 Gen 2', ram: '12GB', camera: '50MP Main + 10MP Tele + 12MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'Android 14' },
    features: ['Flex Hinge', 'Massive foldable screen', 'Multitasking powerhouse'], inTheBox: ['Certified Pre-Owned Galaxy Fold', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_s4', imei: '358900112233554', serialNumber: 'SN-SAM-ZFL5-001',
    brand: 'Samsung', model: 'Galaxy Z Flip 5', storageGb: 256, color: 'Mint', conditionGrade: 'GOOD', batteryHealthPct: 89, cosmeticRating: 8,
    priceZar: 14999, monthlyFinancingZar: 1249, warehouseLocation: 'DBN-WH-01 / BIN-C-02', status: 'AVAILABLE',
    tagline: 'Flex your best angle.', category: 'smartphones', imageColorHex: '#cbe4d1',
    imageUrl: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 200, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.7" Foldable Dynamic AMOLED 2X', chipset: 'Snapdragon 8 Gen 2', ram: '8GB', camera: '12MP Main + 12MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'Android 14' },
    features: ['Flex Window', 'Compact foldable design', 'Hands-free selfies'], inTheBox: ['Certified Pre-Owned Galaxy Flip', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_s5', imei: '358900112233555', serialNumber: 'SN-SAM-A54-001',
    brand: 'Samsung', model: 'Galaxy A54', storageGb: 128, color: 'Awesome Graphite', conditionGrade: 'FAIR', batteryHealthPct: 84, cosmeticRating: 7,
    priceZar: 5999, monthlyFinancingZar: 499, warehouseLocation: 'CPT-WH-02 / BIN-C-09', status: 'AVAILABLE',
    tagline: 'Awesome is for everyone.', category: 'smartphones', imageColorHex: '#3a3a3a',
    imageUrl: 'https://images.unsplash.com/photo-1609252925148-b0f1b515e111?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 350, originalPartVerified: true, warrantyMonths: 6,
    specs: { screen: '6.4" Super AMOLED (120Hz)', chipset: 'Exynos 1380 (5nm)', ram: '6GB', camera: '50MP Main + 12MP Ultra-Wide + 5MP Macro', network: '5G, Wi-Fi 6', os: 'Android 14' },
    features: ['Affordable value', 'IP67 water resistance', 'Bright 120Hz screen'], inTheBox: ['Certified Pre-Owned Galaxy', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },

  // GOOGLE
  {
    id: 'ph_g1', imei: '358900112233661', serialNumber: 'SN-GGL-P8P-001',
    brand: 'Google', model: 'Pixel 8 Pro', storageGb: 256, color: 'Bay Blue', conditionGrade: 'MINT', batteryHealthPct: 99, cosmeticRating: 10,
    priceZar: 18999, monthlyFinancingZar: 1583, warehouseLocation: 'JHB-WH-01 / BIN-G-01', status: 'AVAILABLE',
    tagline: 'The all-pro Google phone.', category: 'smartphones', imageColorHex: '#b4c9db',
    imageUrl: 'https://images.unsplash.com/photo-1662955519195-2cc08f658055?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 15, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.7" LTPO OLED (120Hz)', chipset: 'Google Tensor G3 (4nm)', ram: '12GB', camera: '50MP Main + 48MP Tele + 48MP Ultra-Wide', network: '5G, Wi-Fi 7', os: 'Android 14' },
    features: ['Advanced Google AI', 'Best-in-class camera', 'Temperature sensor'], inTheBox: ['Certified Pre-Owned Pixel', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_g2', imei: '358900112233662', serialNumber: 'SN-GGL-P7A-001',
    brand: 'Google', model: 'Pixel 7a', storageGb: 128, color: 'Sea', conditionGrade: 'MINT', batteryHealthPct: 98, cosmeticRating: 9,
    priceZar: 8999, monthlyFinancingZar: 749, warehouseLocation: 'CPT-WH-02 / BIN-G-04', status: 'AVAILABLE',
    tagline: 'Built to perform. Priced just right.', category: 'smartphones', imageColorHex: '#dce8e8',
    imageUrl: 'https://images.unsplash.com/photo-1673891780590-b1933baee042?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 40, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.1" OLED (90Hz)', chipset: 'Google Tensor G2 (5nm)', ram: '8GB', camera: '64MP Main + 13MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'Android 14' },
    features: ['Amazing camera for the price', 'Tensor G2 AI', 'Wireless charging'], inTheBox: ['Certified Pre-Owned Pixel', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_g3', imei: '358900112233663', serialNumber: 'SN-GGL-P7-001',
    brand: 'Google', model: 'Pixel 7', storageGb: 128, color: 'Lemongrass', conditionGrade: 'GOOD', batteryHealthPct: 90, cosmeticRating: 8,
    priceZar: 10499, monthlyFinancingZar: 874, warehouseLocation: 'JHB-WH-01 / BIN-G-06', status: 'AVAILABLE',
    tagline: 'Super fast. Super secure.', category: 'smartphones', imageColorHex: '#e1e3cd',
    imageUrl: 'https://images.unsplash.com/photo-1665686377065-08ba896d16fd?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 185, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '6.3" AMOLED (90Hz)', chipset: 'Google Tensor G2 (5nm)', ram: '8GB', camera: '50MP Main + 12MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'Android 14' },
    features: ['Magic Eraser', 'Photo Unblur', 'Sleek design'], inTheBox: ['Certified Pre-Owned Pixel', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_g4', imei: '358900112233664', serialNumber: 'SN-GGL-P6P-001',
    brand: 'Google', model: 'Pixel 6 Pro', storageGb: 128, color: 'Cloudy White', conditionGrade: 'FAIR', batteryHealthPct: 83, cosmeticRating: 7,
    priceZar: 7999, monthlyFinancingZar: 666, warehouseLocation: 'DBN-WH-01 / BIN-G-03', status: 'AVAILABLE',
    tagline: 'The smartest Pixel yet.', category: 'smartphones', imageColorHex: '#f0f0f2',
    imageUrl: 'https://images.unsplash.com/photo-1644342555577-b84cc52cbff6?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 390, originalPartVerified: true, warrantyMonths: 6,
    specs: { screen: '6.7" LTPO AMOLED (120Hz)', chipset: 'Google Tensor (5nm)', ram: '12GB', camera: '50MP Main + 48MP Tele + 12MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'Android 14' },
    features: ['Curved screen', 'Excellent zoom camera', 'Original Tensor chip'], inTheBox: ['Certified Pre-Owned Pixel', 'USB-C Cable', 'Ultron Diagnostic Passport']
  },
  {
    id: 'ph_g5', imei: '358900112233665', serialNumber: 'SN-GGL-PF-001',
    brand: 'Google', model: 'Pixel Fold', storageGb: 256, color: 'Obsidian', conditionGrade: 'MINT', batteryHealthPct: 96, cosmeticRating: 9,
    priceZar: 24999, monthlyFinancingZar: 2083, warehouseLocation: 'JHB-WH-01 / BIN-G-10', status: 'AVAILABLE',
    tagline: 'The first foldable from Google.', category: 'smartphones', imageColorHex: '#1f2022',
    imageUrl: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=1000&q=85',
    batteryCycleCount: 80, originalPartVerified: true, warrantyMonths: 12,
    specs: { screen: '7.6" Foldable OLED (120Hz)', chipset: 'Google Tensor G2 (5nm)', ram: '12GB', camera: '48MP Main + 10.8MP Tele + 10.8MP Ultra-Wide', network: '5G, Wi-Fi 6E', os: 'Android 14' },
    features: ['Thin foldable design', 'Pixel camera system', 'Split-screen multitasking'], inTheBox: ['Certified Pre-Owned Pixel Fold', 'USB-C Cable', 'Ultron Diagnostic Passport']
  }
];
