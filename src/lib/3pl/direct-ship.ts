// ─────────────────────────────────────────────────────────────────────────────
// Direct Ship Adapter — Phase 1 fallback (no external 3PL)
// Sends instructions to supplier via email/Telegram, returns manual tracking
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ThreePLProvider, FulfloOrder, ShipmentResult, TrackingResult, PickupSlot,
} from "./index";
import { mockShipmentId, mockDeliveryDate, mockTrackingEvents } from "./index";

async function notifySupplierEmail(order: FulfloOrder, shipmentId: string): Promise<void> {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nWebhookUrl) return;

  try {
    await fetch(`${n8nWebhookUrl}/fulfillment-direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "direct_ship",
        shipmentId,
        orderId: order.orderId,
        supplierId: order.supplier.id,
        customerName: order.customer.name,
        customerAddress: `${order.customer.address}, ${order.customer.zip} ${order.customer.city}, ${order.customer.country}`,
        customerPhone: order.customer.phone,
        items: order.items,
        preferredDelivery: order.preferredDelivery,
        message: `FULFLO ORDER ${order.orderId}: Please ship directly to customer. Use your preferred carrier and reply with tracking number.`,
      }),
    });
  } catch {
    // non-fatal — order still created
  }
}

async function alertTelegram(message: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_MOUSSA_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
  } catch { /* non-fatal */ }
}

// ─── Provider export ──────────────────────────────────────────────────────────

export const DirectShipProvider: ThreePLProvider = {
  name: "DirectShip",
  supportedCountries: ["*"], // global fallback

  async createShipment(order: FulfloOrder): Promise<ShipmentResult> {
    const shipmentId = mockShipmentId();
    const trackingNumber = `DS-${order.orderId}`;

    // Notify supplier + Moussa
    await Promise.all([
      notifySupplierEmail(order, shipmentId),
      alertTelegram(
        `📦 <b>Direct Ship Order</b>\n` +
        `Order: ${order.orderId}\n` +
        `Customer: ${order.customer.name} (${order.customer.country})\n` +
        `Items: ${order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}\n` +
        `⚠️ No 3PL available — supplier must ship directly.`
      ),
    ]);

    return {
      shipmentId,
      trackingNumber,
      trackingUrl: `https://www.fulflo.app/track/${order.orderId}`,
      carrier: "Transporteur fournisseur",
      estimatedDelivery: mockDeliveryDate(order.preferredDelivery === "express" ? 3 : 7),
      labelUrl: "",
      cost_eur: 0, // cost absorbed by supplier in Phase 1
    };
  },

  async getTracking(shipmentId: string): Promise<TrackingResult> {
    return {
      shipmentId,
      trackingNumber: shipmentId,
      carrier: "Transporteur fournisseur",
      currentStatus: "pending",
      estimatedDelivery: mockDeliveryDate(5),
      events: mockTrackingEvents("pending"),
    };
  },

  async cancelShipment(shipmentId: string): Promise<void> {
    await alertTelegram(
      `❌ <b>Direct Ship Cancellation</b>\nShipment: ${shipmentId}\nPlease contact supplier to stop shipment.`
    );
  },

  async getPickupSlots(_supplierId: string): Promise<PickupSlot[]> {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return { date: d, timeWindow: "Journée complète", available: true };
    });
  },
};
