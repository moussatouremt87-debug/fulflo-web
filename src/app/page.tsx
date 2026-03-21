"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Countdown hook ────────────────────────────────────────────────────────────

const FLASH_END = new Date(Date.now() + 2 * 60 * 60 * 1000 + 45 * 60 * 1000 + 12 * 1000);

function useCountdown(endTime: Date) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime.getTime() - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return timeLeft;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

// ─── Data ──────────────────────────────────────────────────────────────────────

const HERO_CARDS = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1WqcYeuYq97DUxakBFtP6OExe6suxFahIFaVsJK6D7P4IxAaomZSzv92GNzpRfRtIpdOWjxBqrvsRVvi6hLJihDTjoFuMvm4x9mYe5I8gSRMo1UIJhlPs1xMlkGyPUescRg5VVVBLVoLCx4kUgHttkuH4lopf0WfyXxQKHu2I-1NOhHVm5BiQL3tOyh5NwP6pJXC0zJWci5bOMGv_7xWzfxEnZj5pcLvyHUwlncmFtw6QFssUXEfJMyB9MDrD_C_K89hCrIfGReKV",
    label: "Household", name: "Ariel Matic 2L", discount: "-55%", rotate: "-4deg",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEkZtoHBRieF2HglisIFeHBsZwyEvQNhjT_aK29jJUaUiLapXqDHJi_Q1npuKEeerWDiukTzOnHD5QEM_WLHuEQb4NweUJKcHKGHNnE9Xm2QcH58PDemOwS1cKivywIoPruN0s-nQjFa4oo2Q90Hein7rqvF-LDtcEChEwCdVklou2aB1QYb4rTdI7jlY9INFlcigCYMvXBtgtLWrlHXOlJiqD4uzn5ZFtBoAgZIvFzYVs9PqpXgHoPJgt0i6kj3kdSkpITPwlVJ69",
    label: "Pantry", name: "Kellogg's Oats", discount: "-40%", rotate: "2deg",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfPw2tDQ_5HNLOQBNCTmpZ2sgw9iS4URycepczvo0L4T2iof2FlM7iqD_Jwie9imW0juSmaeoXH8wdf9rqJ7s9u3cB5VOroS70SJB_YTaGaB19sUN5uenI29Djg1nt-oEa3th-455zFD8Jta8ucRZl5ZYy1Lb2Zm-AqwalYB4TbelXJT7vw1vYfviNZl8hkyb7Hf5bT7TetYR5S1WfSoi_FoZt53h64aEIh-VFtZwsEynud4G3W3GpZAz8TMLjjWa--CPnvmXhQyvu",
    label: "Oral Care", name: "Colgate Max White", discount: "-62%", rotate: "6deg",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoSn2CX3YgHLC2JqfuQBhrvaWRSpJMw76cGgXKHmd2OG-Gx9Ia7CxBgCnT4jFYqMkAZQOFd2l6WJ0D-_9Dd88OLw4F95iewyWNo-Jwc5zA75ktckh-wdlwiu31RO-aojWKTjYaUAIMRM9Qf4iAEO9-ySejtIg6l8lKx1pFRGv2iUExx8kUJT1i5y1gHDwwN2q3ONNgWl0k39dgHQw7cj7nWcIhhj4rld8tsh94mEPbXPHOICeQfof9eZrOszL-VVvRnPhHTIhZzH1u",
    label: "Drinks", name: "Nestlé Gold 200g", discount: "-35%", rotate: "-3deg",
  },
];

const BEST_SELLERS = [
  {
    brand: "Ariel", name: "Matic Liquid Detergent 2L",
    price: "€8.99", original: "€24.50", save: "SAVE 65%",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx0_QXl6S5d8-Xo_oAdSwcsEuMB54SanRcp6BNno7og2bFdCNTqwe97JwRMt-rJZ-DBJTxD-45lc5wr7M0D6wQNsHyJkUOnqkN5-TC8cp50r79yAbNhhggCdUhlhrR3b-jtSgSVh95P16gTEF-eDUu_FsHP2NKNRcrVtgwP7CZDgka1NVSmVgun0CQ2L7b6CHjdHFq9Bl4OSGSqPPy1FAUwWX62fSxcb1hfAZzy_Qn7csufiFtlGCvbKiglwW_6eRTEQISzlhnU68V",
  },
  {
    brand: "Kellogg's", name: "Corn Flakes Family Pack 1kg",
    price: "€4.50", original: "€7.50", save: "SAVE 40%",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzaqA1LOz-UMET5Tf0K7rdhQD72yh1LxaScreQQE3dJxn0xKFWVKf-QszvwFAqICf7B2pqikOKFk-xhDhL0bzHDaBvpQskMhMJcV46qJsjkhAeqTYyMIfebcVD-qKxlZFF-7-zx6OHnzbpRdXTxzc5pHQK9lK7WkTThs_3JdnGjld0XgFBVNJ39iHWZzfzrhMdQ3XTR5QpPQbqtpg773rFZ7scZDZyn2StBvPsXJnw_VPbZ9mC4slxofTSX2bJDYGZoJLQPkFds",
  },
  {
    brand: "Colgate", name: "Advanced White 150ml x3",
    price: "€5.99", original: "€19.99", save: "SAVE 70%",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCwLforUgcT8qXGGOFmgsY4B5a30-HxzYGM0xUmdlrUgdkLlEC7xbTw7BT4DWmQ8n41YfXTaWQJs6LNjxJFJ78giY8XUgJqDMzml4X4oypl7lOguTCTtoeORXA3QsgKKUidk3vUehFuDlSxYUuL0PSp5yqe_vMaE66_EifXXgJOzxjD18-z2XynhHZFYXIgLalvH3NYDJsAScY_Pc_9RkmZp3IS7V559fAipQFHbmkmduyUHcw5J_8CvYIu890oQ59YddHhgAAQ2dIl",
  },
  {
    brand: "Nestlé", name: "Fitness Cereal Bars x12",
    price: "€3.99", original: "€7.99", save: "SAVE 50%",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNLNTLM6R0H_azoATBQ0QFB-cJTD_-zYcG7Aopmf2KacQnUCtciOIgOysyXcOxf8VC0HsN6HPeIu-ydppSKTEaIFInlyqS7tlJM2qyzFdcSIYi7Zw0ObLUHDM_8KUNM6vE7zEPPKOnqHG0XBIHSPGEWl9SzLI8xhzVA5_PT6e_o-gN3gMOwRB1bG1p8nAhsLjRLeJeNpTIz_h8Fxz2JCWtOeyntGyWotQkTK5R9qu8rJN7W1QaOtKD3hGIO_VLabSX8F7y7xU4QPm0",
  },
];

const FLASH_PRODUCTS = [
  {
    name: "Monster Energy x24", price: "€19.99", original: "€48.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCATSsuntPUnkUGKMYgm8Bw847Kjavk6QGa1vdadbYqhMKO_1JG0N_bjeQLZFGAb8lKoHxcWm1ebiWca18_lGFi3xaPybFEH2RU7FUzCZJYlAIX2Z6SbbtTcxA81Q2ZFXB8dpsKTkhbp6SCUofUAVNQCHvw30nSMBco8pHw6roGGYBcVU5rPGt1C1ptogx9gvRMsvar_aPnhFKbg7BsNPurfLubIz1ZDDO0ZDmT0GaHpI6pH57I2fA0RDG9N6Y7CvZEdTbFbR7qors9",
  },
  {
    name: "Dove Beauty Kit", price: "€12.50", original: "€29.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSxoVv-d8Mk9N-ODjPtg8L0eEZZNBs-TqtRR716pa-WuYNEK9tSjMTlQcdVMxl2yFh96CTNkOQjDFSZVbn6vcZbycOCD8-yutni9XtWVeDEk0GcGorvo_eNYFjfwCXCFUYAn0olyRVSzioIPZ1gpPSZfU9Zs12S8ze1wAvnvZQEkInGWfqdr9ZfQG8dUz9CyFEJ6Yp1eo_Y_94rzdmHx0jDqPeAmPbUqti7UT6lz3E2UUkgR1xQmn0bPiDiC4bFFvqhCteHMFta6qw",
  },
];

const PAYMENT_LOGOS = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkl4aEcM3hRAp9bkaVjO2_c3QidotoYnzzIbqTpuq7gK9G5qQWsEV-MQJ6mo1Z_U66zZweOa0adB2PSkdS2x4O5AMqksge0c5XuFdPf6YA4cY_cdcysB3aOzkP8UOiRDs5zvgaHN44NYn7jbJ4yjo4WdSUGyKNWzTwVZcUSyU3TgTgeNdrxliyMY25ldpR556CLPY6NYpMNkzRgNgory0NabQ4VZUZtIk7lgfnIXI_1cn3m7gDAk4LOEwF9TNaOF1Nn2beiK3zDSj6",
    alt: "Visa",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBf-FQxGjabvyjnQqQKDN262Kd5mPtLOp2pFOpTUUEN5GrG92BRORt5JE5zqxAR5FDVsMUyGsJCMFyHRQ8afrU9WKW9NJnSyXwW6cuZa71ZBIHyNETYmuXevQDMNujgU4Z4rVQVEirR7X0_bEAW8114Fbs3HhF-TIvXbPHJY_wCiYNtiyNkCR0E6CSsdMozlPkTuPFjDjOqUxsxRGPgBwpq92TyZZS6e8thSfBH4GpvcbKv-NZWR14OXWkeVpJ-PatwAsu6UH7GfpfM",
    alt: "Mastercard",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCscYVCPTYCx99ZElWTO-RC6_7nTNqR9whWWu0kUG0u3DmraE-sLg4oF9GFgQ49wj05wmFqU-GVGMIgB8wTGXghOk90IYCERhbp9lSZ1Z2hgPYftwm-9KHOHPfQDDZXQhAZUpxP9fDzB87EnvGymbE7E21EXE8WIDL0fcJCZjSOKy2dhgrFGSso636DqcU4vsWCP7UTUdtYbbVl3PIx_TROFSSFu4KP74l4x4Xyn10EGh2CXoOu2-kmc3v2xDIxMEyVeSPn2UzgTnYh",
    alt: "Apple Pay",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const timer = useCountdown(FLASH_END);

  return (
    <div className="min-h-screen bg-[#f6f6ff] text-[#272e42] antialiased">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter text-[#006a2d]">
              fulflo<span className="text-[#6bff8f]">.</span>
            </span>
            <div className="hidden md:flex gap-6">
              <Link href="/deals" className="text-[#006a2d] font-bold border-b-2 border-[#006a2d] text-sm">
                Catalog
              </Link>
              <Link href="/supplier/login" className="text-slate-600 hover:text-[#006a2d] transition-colors text-sm font-medium">
                Brands
              </Link>
              <a href="#why" className="text-slate-600 hover:text-[#006a2d] transition-colors text-sm font-medium">
                Surplus Economy
              </a>
              <a href="#footer" className="text-slate-600 hover:text-[#006a2d] transition-colors text-sm font-medium">
                About
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-[#eef0ff] rounded-full px-4 py-2 w-64">
              <span className="material-symbols-outlined text-[#6f768e] text-sm mr-2">search</span>
              <input
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#6f768e]"
                placeholder="Search brands..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-[#272e42] hover:bg-slate-50 rounded-full transition-all duration-200">
                <span className="material-symbols-outlined">shopping_cart</span>
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1" />
              <Link
                href="/supplier/login"
                className="hidden sm:block text-sm font-semibold text-slate-600 px-4 py-2 hover:bg-slate-50 rounded-lg transition-all"
              >
                Login
              </Link>
              <Link
                href="/invite"
                className="bg-[#006a2d] text-[#ceffd0] px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:scale-95 transition-transform"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-slate-100/50 h-px" />
      </nav>

      <main className="pt-20">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16 pb-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

            {/* Left copy */}
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-[#6bff8f]/20 text-[#005d26] px-4 py-1.5 rounded-full mb-6 border border-[#006a2d]/10">
                <span className="flex h-2 w-2 rounded-full bg-[#006a2d]" />
                <span className="text-xs font-bold uppercase tracking-wider">New Surplus Drops Daily</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#272e42] leading-[0.95] tracking-tight mb-6">
                Massive Savings <br />
                on the{" "}
                <span className="text-[#006a2d]">Brands You Trust.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#535b71] mb-10 max-w-xl leading-relaxed">
                40–70% Off Daily Essentials from Nestlé, Colgate, Ariel, and more.
                Direct from manufacturers, straight to your door.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/deals"
                  className="hero-gradient text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#006a2d]/20 hover:scale-105 transition-transform flex items-center gap-2"
                >
                  Shop the Surplus
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a
                  href="#why"
                  className="bg-white border border-[#a5adc6]/20 px-8 py-4 rounded-xl font-bold text-lg text-[#272e42] hover:bg-white/80 transition-all"
                >
                  How it Works
                </a>
              </div>
            </div>

            {/* Right — tilted product cards */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#6bff8f]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {/* Col 1 */}
                <div className="space-y-6 pt-12">
                  {HERO_CARDS.slice(0, 2).map((card) => (
                    <div
                      key={card.name}
                      className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 hover:rotate-0 transition-transform duration-500 cursor-pointer"
                      style={{ transform: `rotate(${card.rotate})` }}
                    >
                      <Image
                        src={card.src}
                        alt={card.name}
                        width={200}
                        height={160}
                        unoptimized
                        className="w-full h-40 object-contain mb-4"
                      />
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">{card.label}</p>
                          <p className="font-bold text-[#272e42]">{card.name}</p>
                        </div>
                        <span className="bg-[#ff955a] text-[#552100] text-[10px] font-black px-2 py-1 rounded-full">
                          {card.discount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Col 2 */}
                <div className="space-y-6">
                  {HERO_CARDS.slice(2).map((card) => (
                    <div
                      key={card.name}
                      className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 hover:rotate-0 transition-transform duration-500 cursor-pointer"
                      style={{ transform: `rotate(${card.rotate})` }}
                    >
                      <Image
                        src={card.src}
                        alt={card.name}
                        width={200}
                        height={160}
                        unoptimized
                        className="w-full h-40 object-contain mb-4"
                      />
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">{card.label}</p>
                          <p className="font-bold text-[#272e42]">{card.name}</p>
                        </div>
                        <span className="bg-[#ff955a] text-[#552100] text-[10px] font-black px-2 py-1 rounded-full">
                          {card.discount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUE PROPS ───────────────────────────────────────────────── */}
        <section id="why" className="py-24 bg-[#eef0ff]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold mb-4">Why Fulflo?</h2>
              <p className="text-[#535b71] max-w-2xl mx-auto italic">
                High-velocity savings meets uncompromising quality. We rethink the supply chain so you save more.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: "inventory_2",
                  title: "Surplus Economy",
                  desc: "We source direct from manufacturer overstock and seasonal clearances. Same product, smarter price.",
                },
                {
                  icon: "verified",
                  title: "Guaranteed Quality",
                  desc: "Same brands, same shelf-life, same quality you find in retail stores. Zero compromise on standards.",
                },
                {
                  icon: "percent",
                  title: "Up to 70% Off",
                  desc: "By cutting out traditional retail middlemen and logistics waste, we pass 100% of the savings to you.",
                },
              ].map((v) => (
                <div key={v.title} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-[#006a2d]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span
                      className="material-symbols-outlined text-[#006a2d] text-3xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {v.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                  <p className="text-[#535b71] leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BRAND TRUST BAR ───────────────────────────────────────────── */}
        <section className="py-16 border-y border-[#a5adc6]/10">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-black uppercase tracking-widest text-[#6f768e] mb-10">
              Trusted Partner Ecosystem
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {["Nestlé", "ARIEL", "Colgate", "Kellogg's", "Unilever"].map((b) => (
                <span key={b} className="text-2xl font-black text-slate-800">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FLASH DEALS ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#060e20] rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/3 h-full bg-[#006a2d]/20 blur-[100px] pointer-events-none" />
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">

                {/* Countdown side */}
                <div>
                  <div className="inline-block bg-[#994100] text-[#fff0e9] text-xs font-black px-3 py-1 rounded-md mb-6 animate-pulse">
                    FLASH DEAL
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                    Velocity Drop: Midnight Clearance
                  </h2>
                  <p className="text-slate-300 text-lg mb-8">
                    Grab these limited-stock CPG bundles before they vanish at sunrise.
                  </p>
                  <div className="flex gap-4 mb-10">
                    {[
                      { value: pad(timer.h), label: "Hours" },
                      { value: pad(timer.m), label: "Mins" },
                      { value: pad(timer.s), label: "Secs" },
                    ].map((t) => (
                      <div
                        key={t.label}
                        className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[80px] text-center border border-white/10"
                      >
                        <p className="text-3xl font-black text-[#6bff8f]">{t.value}</p>
                        <p className="text-[10px] text-white/60 font-bold uppercase">{t.label}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/deals"
                    className="inline-block bg-[#006a2d] text-[#004a1d] px-10 py-4 rounded-xl font-black text-lg hover:scale-105 transition-transform"
                  >
                    ENTER THE VAULT
                  </Link>
                </div>

                {/* Flash product cards */}
                <div className="grid grid-cols-2 gap-4">
                  {FLASH_PRODUCTS.map((p) => (
                    <div
                      key={p.name}
                      className="bg-white/5 border border-white/10 p-4 rounded-2xl group cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <Image
                        src={p.img}
                        alt={p.name}
                        width={200}
                        height={128}
                        unoptimized
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      <p className="text-[#6bff8f] font-black">
                        {p.price}{" "}
                        <span className="text-slate-500 text-xs line-through ml-2">{p.original}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BEST SELLERS ──────────────────────────────────────────────── */}
        <section className="pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-extrabold mb-2">Weekly Best Sellers</h2>
                <p className="text-[#535b71]">The deals everyone is grabbing right now.</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#dae2fd] text-[#4a5167] px-4 py-2 rounded-full text-sm font-bold">
                  All Products
                </button>
                <button className="bg-[#d9e2ff] text-[#535b71] px-4 py-2 rounded-full text-sm font-bold">
                  Household
                </button>
                <button className="bg-[#d9e2ff] text-[#535b71] px-4 py-2 rounded-full text-sm font-bold">
                  Snacks
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {BEST_SELLERS.map((p) => (
                <div
                  key={p.name}
                  className="bg-white rounded-2xl p-4 group transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-xl mb-6 bg-slate-50 aspect-square flex items-center justify-center">
                    <Image
                      src={p.img}
                      alt={p.name}
                      width={200}
                      height={200}
                      unoptimized
                      className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute top-3 left-3 bg-[#ff955a] text-[#552100] text-[10px] font-black px-2 py-1 rounded-md">
                      {p.save}
                    </div>
                    <button className="absolute bottom-3 right-3 bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[#006a2d]">add</span>
                    </button>
                  </div>
                  <div className="px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">{p.brand}</p>
                    <h3 className="font-bold text-[#272e42] mb-2">{p.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-[#006a2d]">{p.price}</span>
                      <span className="text-sm text-[#535b71] line-through font-medium opacity-50">{p.original}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/deals"
                className="inline-block bg-[#eef0ff] text-[#272e42] font-bold px-12 py-4 rounded-xl hover:bg-[#e2e7ff] transition-colors"
              >
                View Full Marketplace
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer id="footer" className="bg-slate-50 w-full py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand col */}
            <div className="col-span-2">
              <span className="text-lg font-bold text-slate-900 block mb-6">
                fulflo<span className="text-[#006a2d]">.</span>
              </span>
              <p className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed">
                Curated kinetic savings on everyday CPG essentials. Join the surplus economy revolution.
              </p>
            </div>
            {/* Marketplace */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Marketplace</h4>
              <ul className="space-y-4">
                {[
                  { label: "Catalog", href: "/deals" },
                  { label: "Brands", href: "/supplier/login" },
                  { label: "New Drops", href: "/deals" },
                  { label: "Flash Deals", href: "/deals" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-slate-500 hover:text-slate-900 text-sm transition-all duration-200 hover:translate-x-1 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Support</h4>
              <ul className="space-y-4">
                {["Shipping Info", "Returns", "Contact Us", "FAQ"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-500 hover:text-slate-900 text-sm transition-all duration-200 hover:translate-x-1 inline-block">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Company</h4>
              <ul className="space-y-4">
                {[
                  { label: "About", href: "#" },
                  { label: "Partner with Us", href: "/supplier/login" },
                  { label: "Sustainability", href: "#" },
                  { label: "Careers", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-slate-500 hover:text-slate-900 text-sm transition-all duration-200 hover:translate-x-1 inline-block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Legal</h4>
              <ul className="space-y-4">
                {["Privacy Policy", "Terms of Service"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-slate-500 hover:text-slate-900 text-sm transition-all duration-200 hover:translate-x-1 inline-block">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm">© 2026 Fulflo SAS. Curated Kinetic Savings.</p>
            <div className="flex gap-8">
              {PAYMENT_LOGOS.map((l) => (
                <Image
                  key={l.alt}
                  src={l.src}
                  alt={l.alt}
                  width={60}
                  height={16}
                  unoptimized
                  className="h-4 w-auto grayscale opacity-50"
                />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
