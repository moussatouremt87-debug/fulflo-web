// ─────────────────────────────────────────────────────────────────────────────
// Fulflo 3PL Router — selects the right provider per order
// ─────────────────────────────────────────────────────────────────────────────

import type { ThreePLProvider, FulfloOrder, ShipmentResult } from "./index";
import { ByrdProvider }       from "./byrd";
import { BigblueProvider }    from "./bigblue";
import { DirectShipProvider } from "./direct-ship";

const PROVIDERS: ThreePLProvider[] = [ByrdProvider, BigblueProvider, DirectShipProvider];

// ── Country → preferred provider ─────────────────────────────────────────────
const COUNTRY_ROUTING: Record<string, string> = {
  CH: "Byrd",
  AT: "Byrd",
  FR: "Bigblue",
  BE: "Bigblue",
  ES: "Bigblue",
  IT: "Bigblue",
  PT: "Bigblue",
  LU: "Bigblue",
  DE: "Byrd",
  NL: "Byrd",
};

function getProvider(name: string): ThreePLProvider {
  return PROVIDERS.find((p) => p.name === name) ?? DirectShipProvider;
}

// ── Primary selection ─────────────────────────────────────────────────────────
export function selectProvider(order: FulfloOrder): ThreePLProvider {
  const country    = order.customer.country.toUpperCase();
  const preferred  = COUNTRY_ROUTING[country];
  if (preferred) return getProvider(preferred);
  return DirectShipProvider;
}

// ── Create shipment with auto-fallback ────────────────────────────────────────
export async function createShipmentWithFallback(
  order: FulfloOrder
): Promise<ShipmentResult & { provider: string }> {
  const primary = selectProvider(order);

  try {
    const result = await primary.createShipment(order);
    return { ...result, provider: primary.name };
  } catch (primaryErr) {
    console.error(`[3PL] ${primary.name} failed:`, primaryErr);

    // Alert Moussa
    await alertFallback(order, primary.name, String(primaryErr));

    // Try DirectShip as last resort
    try {
      const result = await DirectShipProvider.createShipment(order);
      return { ...result, provider: DirectShipProvider.name };
    } catch (fallbackErr) {
      throw new Error(
        `All 3PL providers failed. Primary (${primary.name}): ${primaryErr}. Fallback: ${fallbackErr}`
      );
    }
  }
}

async function alertFallback(order: FulfloOrder, failedProvider: string, error: string) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_MOUSSA_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        parse_mode: "HTML",
        text:
          `⚠️ <b>3PL Fallback activé</b>\n` +
          `Order: <code>${order.orderId}</code>\n` +
          `Fournisseur échoué: <b>${failedProvider}</b>\n` +
          `Pays client: ${order.customer.country}\n` +
          `Erreur: ${error.slice(0, 200)}\n` +
          `→ Basculement vers Direct Ship automatique.`,
      }),
    });
  } catch { /* non-fatal */ }
}

// ── Get tracking (provider-agnostic, uses stored provider name) ───────────────
export async function getTracking(shipmentId: string, providerName: string) {
  const provider = getProvider(providerName);
  return provider.getTracking(shipmentId);
}

// ── Cancel shipment ───────────────────────────────────────────────────────────
export async function cancelShipment(shipmentId: string, providerName: string) {
  const provider = getProvider(providerName);
  return provider.cancelShipment(shipmentId);
}
