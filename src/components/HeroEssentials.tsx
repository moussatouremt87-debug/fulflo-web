"use client";

import Image from "next/image";

const IMGS = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1WqcYeuYq97DUxakBFtP6OExe6suxFahIFaVsJK6D7P4IxAaomZSzv92GNzpRfRtIpdOWjxBqrvsRVvi6hLJihDTjoFuMvm4x9mYe5I8gSRMo1UIJhlPs1xMlkGyPUescRg5VVVBLVoLCx4kUgHttkuH4lopf0WfyXxQKHu2I-1NOhHVm5BiQL3tOyh5NwP6pJXC0zJWci5bOMGv_7xWzfxEnZj5pcLvyHUwlncmFtw6QFssUXEfJMyB9MDrD_C_K89hCrIfGReKV",
    alt: "Ariel",
    height: 140,
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEkZtoHBRieF2HglisIFeHBsZwyEvQNhjT_aK29jJUaUiLapXqDHJi_Q1npuKEeerWDiukTzOnHD5QEM_WLHuEQb4NweUJKcHKGHNnE9Xm2QcH58PDemOwS1cKivywIoPruN0s-nQjFa4oo2Q90Hein7rqvF-LDtcEChEwCdVklou2aB1QYb4rTdI7jlY9INFlcigCYMvXBtgtLWrlHXOlJiqD4uzn5ZFtBoAgZIvFzYVs9PqpXgHoPJgt0i6kj3kdSkpITPwlVJ69",
    alt: "Nescafé",
    height: 170,
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfPw2tDQ_5HNLOQBNCTmpZ2sgw9iS4URycepczvo0L4T2iof2FlM7iqD_Jwie9imW0juSmaeoXH8wdf9rqJ7s9u3cB5VOroS70SJB_YTaGaB19sUN5uenI29Djg1nt-oEa3th-455zFD8Jta8ucRZl5ZYy1Lb2Zm-AqwalYB4TbelXJT7vw1vYfviNZl8hkyb7Hf5bT7TetYR5S1WfSoi_FoZt53h64aEIh-VFtZwsEynud4G3W3GpZAz8TMLjjWa--CPnvmXhQyvu",
    alt: "Colgate",
    height: 150,
  },
];

export default function HeroEssentials() {
  return (
    <div style={{ position: "relative", margin: "0 0 48px 0", paddingBottom: 48, overflow: "visible" }}>
      {/* Banner card */}
      <div
        style={{
          backgroundColor: "#1B4332",
          borderRadius: 16,
          padding: "1.5rem 2rem",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            background: "#10B981",
            opacity: 0.10,
            borderRadius: "50%",
            bottom: -60,
            right: 80,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Text */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              color: "#ffffff",
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
              textAlign: "left",
            }}
          >
            Everyday Essentials
          </h2>
          <p
            style={{
              color: "#A7F3D0",
              fontSize: "0.9rem",
              marginTop: 4,
              marginBottom: 0,
            }}
          >
            Les grandes marques à prix d&apos;usine
          </p>
        </div>

        {/* Floating product images */}
        <div
          style={{
            position: "absolute",
            bottom: -38,
            right: 24,
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          {IMGS.map((img) => (
            <div
              key={img.alt}
              style={{
                height: img.height,
                width: img.height * 0.82,
                position: "relative",
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))",
                transition: "transform 0.2s ease",
                pointerEvents: "auto",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
