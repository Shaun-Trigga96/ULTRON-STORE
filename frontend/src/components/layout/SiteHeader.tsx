import React, { useState } from 'react';
import { Search, User, ShoppingBag, Menu, X, ListOrdered, LogOut } from 'lucide-react';
import { UltronLogo } from '../UltronLogo';

export const NAV_LINKS = [
  { label: 'Apple', hash: 'Apple' },
  { label: 'Samsung', hash: 'Samsung' },
  { label: 'Google', hash: 'Google' },
  { label: 'Accessories', hash: 'Accessories' },
  { label: 'How grading works', hash: 'Grading' },
  { label: 'Support', hash: 'Support' },
];

interface SiteHeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  isSignedIn: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenOrders: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  cartCount, onOpenCart, searchQuery, onSearch, isSignedIn, onSignIn, onSignOut, onOpenOrders,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.hash = 'Shop';
    setMenuOpen(false);
  };

  const searchField = (id: string) => (
    <form onSubmit={submitSearch} role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">Search phones</label>
      <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
      <input
        id={id}
        type="search"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search phones"
        className="w-full min-h-[44px] pl-11 pr-4 rounded-full border-[1.5px] border-ink bg-white text-[15px] outline-none focus:shadow-[0_0_0_3px_rgb(26_92_255/.18)]"
      />
    </form>
  );

  return (
    <>
      <div className="bg-ink text-white text-center text-[13px] sm:text-[14px] tracking-[0.03em] px-4 py-2.5">
        Free overnight delivery · <span className="text-sun">7-day returns</span><span className="hidden sm:inline"> · Up to 12-month warranty</span>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
        <div className="container-page flex items-center justify-between gap-4 h-[72px]">
          <a href="#" aria-label="ULTRON Store home" className="shrink-0">
            <UltronLogo size="sm" />
          </a>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-7 text-[16px]">
            {NAV_LINKS.map((l) => (
              <a key={l.hash} href={`#${l.hash}`} className="hover:underline underline-offset-[6px] decoration-2">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden md:block w-[220px] mr-2">{searchField('site-search')}</div>

            {isSignedIn ? (
              <>
                <button type="button" onClick={onOpenOrders} aria-label="Your orders" className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-paper cursor-pointer">
                  <ListOrdered className="w-[22px] h-[22px]" strokeWidth={1.8} />
                </button>
                <button type="button" onClick={onSignOut} aria-label="Sign out" className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-paper cursor-pointer">
                  <LogOut className="w-[22px] h-[22px]" strokeWidth={1.8} />
                </button>
              </>
            ) : (
              <button type="button" onClick={onSignIn} aria-label="Sign in" className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-paper cursor-pointer">
                <User className="w-[22px] h-[22px]" strokeWidth={1.8} />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
              className="relative w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-paper cursor-pointer"
            >
              <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-5 h-5 px-1 rounded-full bg-volt text-white text-[11px] font-display font-extrabold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="lg:hidden w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-paper cursor-pointer"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-line bg-white">
            <div className="container-page py-5 flex flex-col gap-4">
              <div className="md:hidden">{searchField('mobile-search')}</div>
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.hash}
                    href={`#${l.hash}`}
                    onClick={() => setMenuOpen(false)}
                    className="font-display font-bold text-[22px] py-2.5 border-b border-line last:border-0"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
