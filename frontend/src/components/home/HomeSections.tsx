import React, { useState } from 'react';
import { ShieldCheck, BatteryCharging, BadgeCheck, RotateCcw, ArrowRight, Fingerprint } from 'lucide-react';
import { StoreProduct } from '../../data/storeProducts';
import { formatZar, GRADES } from '../../lib/format';
import { ProductImage } from '../ProductImage';

/* ---------- Hero ---------- */

export const Hero: React.FC<{ featured?: StoreProduct; onView: (p: StoreProduct) => void }> = ({ featured, onView }) => (
  <section className="container-page pt-10 sm:pt-16 pb-12 sm:pb-14">
    <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-14">
      <div className="lg:flex-[1.1] min-w-0">
        <h1 className="font-display font-black text-[48px] sm:text-[68px] lg:text-[64px] xl:text-[76px] leading-[0.95] tracking-[-0.02em]">
          Better phones.
          <br />
          <span className="highlight">Second time</span>
          <br />
          <span className="text-volt">around.</span>
        </h1>
        <p className="mt-6 sm:mt-7 text-[18px] sm:text-[20px] leading-relaxed text-ink-2 max-w-[520px]">
          Certified pre-owned flagships, each one graded by hand, battery-tested and IMEI-checked. One unit per listing.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#Shop" className="btn btn-primary">Shop phones</a>
          <a href="#Grading" className="btn btn-outline">Compare grades</a>
        </div>
      </div>

      {featured && (
        <button
          type="button"
          onClick={() => onView(featured)}
          className="flex-1 min-w-0 relative rounded-[var(--radius-panel)] overflow-hidden text-left cursor-pointer group"
          aria-label={`View featured ${featured.model}`}
        >
          <ProductImage
            product={featured}
            className="aspect-square rounded-[var(--radius-panel)]"
            imgClassName="w-full h-full object-cover object-[50%_35%]"
            placeholderSize="w-[26%] max-w-[150px]"
          />
          <div className="absolute left-4 right-4 bottom-4 sm:left-auto sm:bottom-auto sm:right-6 sm:top-6 bg-white border-2 border-ink rounded-[18px] px-5 py-4 flex flex-col gap-1 shadow-[6px_6px_0_#0a0a0a] transition-transform group-hover:-translate-y-0.5">
            <span className="eyebrow !text-[11px]">Featured</span>
            <span className="font-display font-extrabold text-[18px] sm:text-[20px]">{featured.model}</span>
            <span className="text-[14px]">
              {featured.storageGb}GB · {GRADES[featured.conditionGrade].label} · Battery {featured.batteryHealthPct}%
            </span>
            <span className="font-display font-extrabold text-[22px] mt-1">{formatZar(featured.priceZar)}</span>
          </div>
        </button>
      )}
    </div>
  </section>
);

/* ---------- Brand tiles ---------- */

const BRANDS = [
  { name: 'Apple', sub: 'iPhone, Watch, AirPods', cls: 'bg-ink text-white' },
  { name: 'Samsung', sub: 'Galaxy S, Z Fold, Z Flip', cls: 'bg-volt text-white' },
  { name: 'Google', sub: 'Pixel and Pixel Fold', cls: 'bg-sun text-ink' },
  { name: 'Accessories', sub: 'Watches and audio', cls: 'bg-paper text-ink' },
];

export const BrandTiles: React.FC = () => (
  <section className="container-page pb-16 sm:pb-20">
    <h2 className="sr-only">Shop by brand</h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {BRANDS.map((b) => (
        <a
          key={b.name}
          href={`#${b.name}`}
          className={`${b.cls} rounded-[var(--radius-card)] min-h-[130px] sm:min-h-[160px] p-5 sm:p-6 flex flex-col justify-between transition-transform hover:-translate-y-1`}
        >
          <span className="font-display font-black text-[24px] sm:text-[30px] leading-none">{b.name}</span>
          <span className="text-[14px] sm:text-[15px] flex items-center gap-1.5">
            {b.sub} <ArrowRight aria-hidden="true" className="w-4 h-4 shrink-0" />
          </span>
        </a>
      ))}
    </div>
  </section>
);

/* ---------- Grade guide ---------- */

export const GradeGuide: React.FC<{ onPick: (grade: StoreProduct['conditionGrade']) => void }> = ({ onPick }) => (
  <section id="Grading" className="scroll-mt-20 bg-sun py-16 sm:py-20">
    <div className="container-page flex flex-col lg:flex-row gap-10 lg:gap-12 lg:items-start">
      <div className="lg:flex-1 min-w-0">
        <h2 className="font-display font-black text-[38px] sm:text-[48px] leading-none">Every grade passes the same test.</h2>
        <p className="mt-4 text-[18px] leading-relaxed max-w-md">
          Only the cosmetics change. Pick the look you want and the price that suits you.
        </p>
      </div>
      <div className="lg:flex-[2] min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(GRADES) as StoreProduct['conditionGrade'][]).map((g) => (
          <div key={g} className="bg-white border-2 border-ink rounded-[var(--radius-card)] p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-3.5 h-3.5 rounded-full ${GRADES[g].dot}`} aria-hidden="true" />
              <h3 className="font-display font-black text-[28px]">{GRADES[g].label}</h3>
            </div>
            <p className="text-[16px] leading-relaxed text-ink-2 flex-1">{GRADES[g].blurb}</p>
            <button type="button" onClick={() => onPick(g)} className="self-start text-[15px] underline underline-offset-4 decoration-2 cursor-pointer">
              Shop {GRADES[g].label}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Trust row ---------- */

const REASONS = [
  { icon: BadgeCheck, title: 'IMEI checked', text: 'Every serial is checked against loss, theft and finance-lock registries before it is listed.' },
  { icon: Fingerprint, title: 'One unit, one listing', text: 'Each device is tracked by serial and IMEI, so the grade and battery report are for that exact unit.' },
  { icon: BatteryCharging, title: 'Battery health shown', text: 'Real battery health and cycle count on every listing.' },
  { icon: ShieldCheck, title: 'Up to 12-month warranty', text: 'Cover on every certified device.' },
  { icon: RotateCcw, title: '7-day returns', text: 'Not right? Send it back within 7 days.' },
];

export const TrustRow: React.FC = () => (
  <section className="container-page py-16 sm:py-20">
    <h2 className="sr-only">Why buy from ULTRON</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
      {REASONS.map((r) => (
        <div key={r.title} className="border-t-[3px] border-ink pt-5">
          <r.icon aria-hidden="true" className="w-6 h-6 text-volt" strokeWidth={2} />
          <h3 className="mt-3 font-display font-extrabold text-[19px]">{r.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{r.text}</p>
        </div>
      ))}
    </div>
  </section>
);

/* ---------- Why pre-owned ---------- */

export const WhyPreOwned: React.FC = () => (
  <section className="container-page pb-16 sm:pb-20">
    <div className="rounded-[var(--radius-panel)] bg-paper px-6 py-12 sm:px-16 sm:py-16 text-center">
      <p className="eyebrow">Why certified pre-owned</p>
      <h2 className="mt-4 font-display font-black text-[30px] sm:text-[42px] leading-[1.05] max-w-3xl mx-auto">
        A great phone, without the cost of a new one <span className="highlight">or the waste.</span>
      </h2>
      <p className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-ink-2 max-w-2xl mx-auto">
        Every ULTRON device is a phone that already existed, restored to a standard worth trusting. Choosing certified pre-owned means fewer raw materials mined, less e-waste in landfill, and a fully inspected device backed by a warranty.
      </p>
    </div>
  </section>
);

/* ---------- Newsletter ---------- */

export const NewsletterCta: React.FC = () => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section className="container-page pb-16 sm:pb-20">
      <div className="bg-ink text-white rounded-[var(--radius-panel)] p-8 sm:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="font-display font-extrabold text-[28px] sm:text-[34px] leading-tight">Get first dibs on new stock</h2>
          <p className="mt-2 text-[16px] sm:text-[17px] text-[#cfcfcf]">One-of-a-kind units sell fast. We&apos;ll email you when new phones land.</p>
        </div>
        {done ? (
          <p className="font-display font-bold text-sun text-[18px]">Thanks, you&apos;re on the list.</p>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
            className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="min-h-[50px] w-full sm:w-[300px] px-5 rounded-full bg-white text-ink text-[16px] outline-none"
            />
            <button type="submit" className="btn btn-sun">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
};
