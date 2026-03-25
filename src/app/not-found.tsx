import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-7xl">🔍</div>
      <h1 className="text-4xl font-black text-[#1B4332] mb-2">Page introuvable</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Cette page n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil pour découvrir nos offres surplus.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="bg-[#1B4332] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#2d6a4f] transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/deals"
          className="bg-[#10B981] text-[#1B4332] font-bold px-8 py-3 rounded-xl hover:bg-[#D1FAE5] transition-colors"
        >
          Voir les offres →
        </Link>
      </div>
    </div>
  );
}
