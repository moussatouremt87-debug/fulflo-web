// ─────────────────────────────────────────────────────────────────────────────
// Bigblue 3PL Adapter — https://bigblue.co (FR, BE, DE, ES coverage)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ThreePLProvider, FulfloOrder, ShipmentResult, TrackingResult, PickupSlot,
} from "./index";
import {
  FULFILLMENT_MODE, mockShipmentId, mockTrackingNumber,
  mockDeliveryDate, mockTrackingEvents,
} from "./index";

const BIGBLUE_BASE_URL = "https://api.bigblue.co/v1";
const API_KEY = process.env.BIGBLUE_API_KEY ?? "";

// ─── Format converters ────────────────────────────────────────────────────────

function toBigblueOrder(order: FulfloOrder) {
  return {
    external_id: order.orderId,
    shipping_method: order.preferredDelivery === "express" ? "express" : "relay",
    shipping_address: {
      full_name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      line1: order.customer.address,
      city: order.customer.city,
      country: order.customer.country,
      zip: order.customer.zip,
    },
    line_items: order.items.map((item) => ({
      sku: item.sku,
      title: item.name,
      quantity: item.quantity,
      grams: Math.round(item.weight_kg * 1000),
    })),
    tags: ["fulflo", "surplus"],
  };
}

// ─── Mock responses ───────────────────────────────────────────────────────────

function mockCreateShipment(order: FulfloOrder): ShipmentResult {
  const shipmentId = mockShipmentId();
  const tracking   = mockTrackingNumber("BB");
  return {
    shipmentId,
    trackingNumber: tracking,
    trackingUrl: `https://track.bigblue.co/${tracking}`,
    carrier: "Colissimo",
    estimatedDelivery: mockDeliveryDate(order.preferredDelivery === "express" ? 1 : 2),
    labelUrl: `https://api.bigblue.co/labels/${shipmentId}.pdf`,
    cost_eur: order.preferredDelivery === "express" ? 9.90 : 4.95,
  };
}

function mockGetTracking(shipmentId: string): TrackingResult {
  const tracking = mockTrackingNumber("BB");
  return {
    shipmentId,
    trackingNumber: tracking,
    carrier: "Colissimo",
    currentStatus: "picked",
    estimatedDelivery: mockDeliveryDate(2),
    events: mockTrackingEvents("picked"),
  };
}

// ─── Live API calls ────────────────────────────────────────────────────────────

async function liveCreateShipment(order: FulfloOrder): Promise<ShipmentResult> {
  const res = await fetch(`${BIGBLUE_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify(toBigblueOrder(order)),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Bigblue API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    shipmentId: String(data.id),
    trackingNumber: data.tracking_number,
    trackingUrl: data.tracking_url,
    carrier: data.carrier ?? "Colissimo",
    estimatedDelivery: new Date(data.estimated_delivery_at),
    labelUrl: data.label_url ?? "",
    cost_eur: parseFloat(data.shipping_cost ?? "0"),
  };
}

async function liveGetTracking(shipmentId: string): Promise<TrackingResult> {
  const res = await fetch(`${BIGBLUE_BASE_URL}/orders/${shipmentId}/tracking`, {
    headers: { "X-Api-Key": API_KEY },
  });

  if (!res.ok) throw new Error(`Bigblue tracking error ${res.status}`);

  const data = await res.json();
  return {
    shipmentId,
    trackingNumber: data.tracking_number,
    carrier: data.carrier ?? "Colissimo",
    currentStatus: data.status,
    estimatedDelivery: new Date(data.estimated_delivery_at),
    events: (data.events ?? []).map((e: Record<string, unknown>) => ({
      timestamp: new Date(e.occurred_at as string),
      status: e.status,
      location: e.location,
      description: e.message,
    })),
  };
}

// ─── Provider export ──────────────────────────────────────────────────────────

export const BigblueProvider: ThreePLProvider = {
  name: "Bigblue",
  supportedCountries: ["FR", "BE", "DE", "ES", "IT", "NL", "PT", "LU"],

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
    await fetch(`${BIGBLUE_BASE_URL}/orders/${shipmentId}/cancel`, {
      method: "POST",
      headers: { "X-Api-Key": API_KEY },
    });
  },

  async getPickupSlots(_supplierId: string): Promise<PickupSlot[]> {
    if (FULFILLMENT_MODE === "mock" || !API_KEY) {
      return Array.from({ length: 4 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return { date: d, timeWindow: "08:00–18:00", available: i !== 2 };
      });
    }
    const res = await fetch(`${BIGBLUE_BASE_URL}/pickup-slots`, {
      headers: { "X-Api-Key": API_KEY },
    });
    const data = await res.json();
    return data ?? [];
  },
};
