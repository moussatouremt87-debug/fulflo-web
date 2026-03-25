"use client";

// Heights: left 140px, center 170px, right 150px (staggered)
const IMGS = [
  {
    src: "https://images.unsplash.com/photo-1585670080336-57b8a9b7e461?w=300&q=80",
    alt: "Coslys lessive bio",
    height: 140,
  },
  {
    src: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&q=80",
    alt: "Favrichon muesli bio",
    height: 170,
  },
  {
    src: "https://images.unsplash.com/photo-1571782742078-30d6c6c5b3d1?w=300&q=80",
    alt: "Lamazuna dentifrice solide",
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
            Essentiels du Quotidien
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

        {/* Floating product images — <img> for CSS drop-shadow support */}
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
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={img.alt}
              src={img.src}
              alt={img.alt}
              style={{
                height: img.height,
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))",
                transition: "transform 0.2s ease",
                pointerEvents: "auto",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = "translateY(0)";
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
