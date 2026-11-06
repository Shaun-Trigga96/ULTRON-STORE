import React from 'react';
import { UltronLogo } from '../UltronLogo';

interface SiteFooterProps {
  isLive: boolean;
  onOpenConnection: () => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ isLive, onOpenConnection }) => (
  <footer id="Support" className="scroll-mt-24 border-t border-line pt-14 pb-8">
    <div className="container-page">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <UltronLogo size="sm" />
          <p className="mt-4 text-[15px] leading-relaxed text-muted max-w-xs">
            Certified pre-owned phones, graded and tested by hand. Need help? Our technicians handle warranty claims, repairs and diagnostics.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 text-[15px]">
          <h3 className="font-display font-bold text-[15px] mb-1">Shop</h3>
          <a href="#Apple" className="hover:underline">Apple</a>
          <a href="#Samsung" className="hover:underline">Samsung</a>
          <a href="#Google" className="hover:underline">Google</a>
          <a href="#Accessories" className="hover:underline">Accessories</a>
        </div>
        <div className="flex flex-col gap-2.5 text-[15px]">
          <h3 className="font-display font-bold text-[15px] mb-1">Help</h3>
          <a href="#Grading" className="hover:underline">Grading guide</a>
          <a href="#" className="hover:underline">Contact support</a>
          <a href="#" className="hover:underline">Returns and exchanges</a>
          <a href="#" className="hover:underline">Check warranty cover</a>
        </div>
        <div className="flex flex-col gap-2.5 text-[15px]">
          <h3 className="font-display font-bold text-[15px] mb-1">Company</h3>
          <a href="#" className="hover:underline">Privacy policy</a>
          <a href="#" className="hover:underline">Terms of use</a>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row gap-3 justify-between text-[13px] text-muted">
        <p>© 2026 ULTRON Store. All rights reserved.</p>
        <button type="button" onClick={onOpenConnection} className="inline-flex items-center gap-2 hover:text-ink cursor-pointer self-start">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-mint' : 'bg-[#a8a8a8]'}`} />
          {isLive ? 'Live inventory' : 'Demo mode'} · Connection settings
        </button>
      </div>
    </div>
  </footer>
);
