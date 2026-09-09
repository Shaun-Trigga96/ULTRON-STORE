import React, { useState, useEffect } from 'react';
import { StorefrontView } from './components/StorefrontView';
import { ShoppingBag } from 'lucide-react';
import { UltronLogo } from './components/UltronLogo';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false; // Default to light mode for Apple-esque vibe
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col font-sans transition-colors duration-300">
      {/* Sticky, translucent top nav bar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-[#d2d2d7]/50 dark:border-[#424245]/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            <div className="flex items-center gap-6">
              <div className="cursor-pointer flex items-center" title="ULTRON Storefront">
                <UltronLogo
                  variant="icon"
                  size="sm"
                  className="h-5 w-auto"
                />
              </div>
              <nav className="hidden md:flex items-center gap-6 text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] tracking-wide">
                <a href="#" className="hover:opacity-70 transition-opacity">Store</a>
                <a href="#" className="hover:opacity-70 transition-opacity">Mac</a>
                <a href="#" className="hover:opacity-70 transition-opacity">iPad</a>
                <a href="#" className="hover:opacity-70 transition-opacity font-semibold">iPhone</a>
                <a href="#" className="hover:opacity-70 transition-opacity">Watch</a>
                <a href="#" className="hover:opacity-70 transition-opacity">Accessories</a>
              </nav>
            </div>

            <div className="flex items-center gap-5">
              <button
                onClick={toggleTheme}
                className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-70 transition-opacity"
              >
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
              <button className="text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-70 transition-opacity">
                <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-[#f5f5f7] dark:bg-[#000000] transition-colors duration-300">
        <div className="w-full">
          <StorefrontView />
        </div>
      </main>
    </div>
  );
}
