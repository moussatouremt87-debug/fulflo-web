// ─────────────────────────────────────────────────────────────────────────────
// Byrd 3PL Adapter — https://byrd.com (CH, AT, DE coverage)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ThreePLProvider, FulfloOrder, ShipmentResult, TrackingResult, PickupSlot,
} from "./index";
import {
  FULFILLMENT_MODE, mockShipmentId, mockTrackingNumber,
  mockDeliveryDate, mockTrackingEvents,
} from "./index";

const BYRD_BASE_URL = "https://api.byrd.com/v2";
const API_KEY = process.env.BYRD_API_KEY ?? "";

// ─── Format converters ────────────────────────────────────────────────────────

function toByrdOrder(order: FulfloOrder) {
  return {
    external_reference: order.orderId,
    delivery_type: order.preferredDelivery === "express" ? "EXPRESS" : "STANDARD",
    recipient: {
      first_name: order.customer.name.split(" ")[0] ?? order.customer.name,
      last_name: order.customer.name.split(" ").slice(1).join(" ") || "-",
      email: order.customer.email,
      phone: order.customer.phone,
      address: {
        street: order.customer.address,
        city: order.customer.city,
        country_code: order.customer.country,
        postal_code: order.customer.zip,
      },
    },
    items: order.items.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      weight_gram: Math.round(item.weight_kg * 1000),
    })),
    warehouse_id: "byrd-fr-cdg", // Byrd's Paris CDG warehouse
  };
}

// ─── Mock responses ───────────────────────────────────────────────────────────

function mockCreateShipment(order: FulfloOrder): ShipmentResult {
  const shipmentId = mockShipmentId();
  const tracking   = mockTrackingNumber("1Z999AA1");
  return {
    shipmentId,
    trackingNumber: tracking,
    trackingUrl: `https://byrd.com/track/${tracking}`,
    carrier: "DHL",
    estimatedDelivery: mockDeliveryDate(order.preferredDelivery === "express" ? 1 : 3),
    labelUrl: `https://byrd.com/labels/${shipmentId}.pdf`,
    cost_eur: order.preferredDelivery === "express" ? 12.90 : 6.50,
  };
}

function mockGetTracking(shipmentId: string): TrackingResult {
  const tracking = mockTrackingNumber("1Z999AA1");
  return {
    shipmentId,
    trackingNumber: tracking,
    carrier: "DHL",
    currentStatus: "in_transit",
    estimatedDelivery: mockDeliveryDate(2),
    events: mockTrackingEvents("in_transit"),
  };
}

// ─── Live API calls ────────────────────────────────────────────────────────────

async function liveCreateShipment(order: FulfloOrder): Promise<ShipmentResult> {
  const res = await fetch(`${BYRD_BASE_URL}/fulfillment-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(toByrdOrder(order)),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Byrd API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    shipmentId: String(data.id),
    trackingNumber: data.tracking_number,
    trackingUrl: data.tracking_url,
    carrier: data.carrier ?? "DHL",
    estimatedDelivery: new Date(data.estimated_delivery),
    labelUrl: data.label_url,
    cost_eur: parseFloat(data.cost ?? "0"),
  };
}

async function liveGetTracking(shipmentId: string): Promise<TrackingResult> {
  const res = await fetch(`${BYRD_BASE_URL}/fulfillment-orders/${shipmentId}/tracking`, {
    headers: { "Authorization": `Bearer ${API_KEY}` },
  });

  if (!res.ok) throw new Error(`Byrd tracking error ${res.status}`);

  const data = await res.json();
  return {
    shipmentId,
    trackingNumber: data.tracking_number,
    carrier: data.carrier ?? "DHL",
    currentStatus: data.status,
    estimatedDelivery: new Date(data.estimated_delivery),
    events: (data.events ?? []).map((e: Record<string, unknown>) => ({
      timestamp: new Date(e.timestamp as string),
      status: e.status,
      location: e.location,
      description: e.description,
    })),
  };
}

// ─── Provider export ──────────────────────────────────────────────────────────

export const ByrdProvider: ThreePLProvider = {
  name: "Byrd",
  supportedCountries: ["CH", "AT", "DE", "FR", "NL", "BE"],

  async createShipment(order) {
    if (FULFILLMENT_MODE === "mock" || !API_KEY) return mockCreateShipment(order);
    return liveCreateShipment(order);
  },

  async getTracking(shipmentId) {
    if (FULFILLMENT_MODE === "mock" || !API_KEY) return mockGetTracking(shipmentId);
    return liveGetTracking(shipmentId);
  },

  async cancelShipment(shipmentId) {
    if (FULFILLMENT_MODE === "mock" || !API_KEY) return;
    await fetch(`${BYRD_BASE_URL}/fulfillment-orders/${shipmentId}/cancel`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}` },
    });
  },

  async getPickupSlots(_supplierId: string): Promise<PickupSlot[]> {
    if (FULFILLMENT_MODE === "mock" || !API_KEY) {
      return Array.from({ length: 3 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return { date: d, timeWindow: i % 2 === 0 ? "09:00–12:00" : "14:00–17:00", available: true };
      });
    }
    const res = await fetch(`${BYRD_BASE_URL}/pickup-slots`, {
      headers: { "Authorization": `Bearer ${API_KEY}` },
    });
    const data = await res.json();
    return data.slots ?? [];
  },
};
