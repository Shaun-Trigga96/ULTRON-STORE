const fs = require('fs');

const files = [
  'src/components/StorefrontView.tsx',
  'services/frontend-store/src/components/StorefrontView.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Header Guaranteed Badge
  content = content.replace(/bg-emerald-100 dark:bg-emerald-500\/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500\/30/g, 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10');
  content = content.replace(/bg-emerald-500 dark:bg-emerald-400/g, 'bg-slate-800 dark:bg-slate-200');

  // 2. Hero Pill
  content = content.replace(/bg-blue-100 dark:bg-blue-500\/10 border border-blue-200 dark:border-blue-500\/30 text-blue-600 dark:text-blue-400/g, 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200');

  // 3. Feature Icons (Hero)
  content = content.replace(/ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400"/g, 'ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300"');
  content = content.replace(/Truck className="w-4 h-4 text-blue-600 dark:text-blue-400"/g, 'Truck className="w-4 h-4 text-slate-700 dark:text-slate-300"');
  content = content.replace(/RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400"/g, 'RotateCcw className="w-4 h-4 text-slate-700 dark:text-slate-300"');
  content = content.replace(/Eye className="w-3\.5 h-3\.5 text-blue-600 dark:text-blue-300"/g, 'Eye className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300"');
  
  // 4. Spotlight glows
  content = content.replace(/bg-blue-400\/5 dark:bg-blue-500\/10/g, 'bg-slate-200/50 dark:bg-white/5');

  // 5. Card Status Badges
  content = content.replace(/isAvailable\s*\?\s*'bg-emerald-500\/20 text-emerald-300 border border-emerald-500\/30'\s*:\s*isHeldInCart\s*\?\s*'bg-amber-500\/20 text-amber-300 border border-amber-500\/30'\s*:\s*'bg-slate-800 text-slate-400 border border-slate-700'/g, 
    `isAvailable
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        : isHeldInCart
                        ? 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        : 'bg-slate-50 dark:bg-[#1c1c1e] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/5'`);

  // 6. Grade Badges
  content = content.replace(/className={`px-2\.5 py-1 rounded-full text-\[10px\] font-semibold tracking-wide \${[\s\S]*?}`}/g, 
    `className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"`);

  // 7. Ambient Glow removal
  content = content.replace(/{\/\* Ambient Device Backdrop Glow \*\/}[\s\S]*?<\/div>\n\s*<img/g, '<img');

  // 8. Card text colors
  content = content.replace(/text-blue-600 dark:text-blue-400 font-bold/g, 'text-slate-500 dark:text-slate-400 font-semibold');
  content = content.replace(/group-hover:text-blue-600 dark:group-hover:text-blue-300 /g, 'group-hover:text-slate-600 dark:group-hover:text-slate-300 ');

  // 9. Card Warranty pill
  content = content.replace(/text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-500\/10 border border-emerald-200 dark:border-emerald-500\/20/g, 'text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10');

  // 11. Redlock Cart Banner
  content = content.replace(/bg-amber-100 dark:bg-amber-500\/10 border-b border-amber-200 dark:border-amber-500\/20 px-6 py-3 flex items-center justify-between text-xs font-mono text-amber-700 dark:text-amber-300/g, 'bg-slate-50 dark:bg-[#121212] border-b border-slate-200 dark:border-white/10 px-6 py-3 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400');
  content = content.replace(/Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin"/g, 'Clock className="w-4 h-4 text-slate-500 dark:text-slate-400"');
  content = content.replace(/Redis Redlock Stock Hold:/g, 'Stock Reserved:');
  content = content.replace(/text-slate-900 dark:text-white bg-amber-200 dark:bg-amber-500\/20 px-2\.5 py-0\.5 rounded-full border border-amber-300 dark:border-amber-500\/40/g, 'text-slate-900 dark:text-white bg-slate-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-white/10');

  // 12. Cart check icon
  content = content.replace(/CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400"/g, 'CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300"');

  // 13. Replace server connection dots
  content = content.replace(/text-emerald-600 dark:text-emerald-400/g, 'text-slate-700 dark:text-slate-300'); // the Radio icon
  
  // Fix cart item imei
  content = content.replace(/text-\[10px\] text-blue-600 dark:text-blue-400 font-mono mt-1/g, 'text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1');

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Colors stripped successfully.");
