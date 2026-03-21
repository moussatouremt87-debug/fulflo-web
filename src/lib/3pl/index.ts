// ─────────────────────────────────────────────────────────────────────────────
// Fulflo 3PL Abstraction Layer
// ─────────────────────────────────────────────────────────────────────────────

export interface FulfloOrder {
  orderId: string;
  customer: {
    name: string;
    address: string;
    city: string;
    country: string; // ISO 3166-1 alpha-2 (FR, CH, DE, BE, NL…)
    zip: string;
    phone: string;
    email: string;
  };
  supplier: {
    id: string;
    address: string;
    city: string;
    country: string;
  };
  items: {
    sku: string;
    name: string;
    quantity: number;
    weight_kg: number;
  }[];
  preferredDelivery: "standard" | "express";
}

export interface ShipmentResult {
  shipmentId: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  estimatedDelivery: Date;
  labelUrl: string;
  cost_eur: number;
}

export interface TrackingEvent {
  timestamp: Date;
  status: "pending" | "picked" | "in_transit" | "out_for_delivery" | "delivered" | "failed";
  location?: string;
  description: string;
}

export interface TrackingResult {
  shipmentId: string;
  trackingNumber: string;
  carrier: string;
  currentStatus: TrackingEvent["status"];
  estimatedDelivery: Date;
  events: TrackingEvent[];
}

export interface PickupSlot {
  date: Date;
  timeWindow: string; // e.g. "09:00–12:00"
  available: boolean;
}

export interface ThreePLProvider {
  name: string;
  supportedCountries: string[];
  createShipment(order: FulfloOrder): Promise<ShipmentResult>;
  getTracking(shipmentId: string): Promise<TrackingResult>;
  cancelShipment(shipmentId: string): Promise<void>;
  getPickupSlots(supplierId: string): Promise<PickupSlot[]>;
}

// ─── Fulfillment mode ─────────────────────────────────────────────────────────

export const FULFILLMENT_MODE =
  (process.env.FULFILLMENT_MODE ?? "mock") as "mock" | "live";

// ─── Shared mock helpers ──────────────────────────────────────────────────────

export function mockShipmentId(): string {
  return "SHP-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function mockTrackingNumber(prefix: string): string {
  return prefix + Math.random().toString(10).slice(2, 14);
}

export function mockDeliveryDate(days = 3): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export function mockTrackingEvents(status: TrackingEvent["status"]): TrackingEvent[] {
  const now = new Date();
  const events: TrackingEvent[] = [
    {
      timestamp: new Date(now.getTime() - 2 * 86400000),
      status: "pending",
      location: "Entrepôt fournisseur",
      description: "Commande créée — en attente de collecte",
    },
    {
      timestamp: new Date(now.getTime() - 1 * 86400000),
      status: "picked",
      location: "Centre de tri",
      description: "Colis collecté par le transporteur",
    },
  ];

  if (status === "in_transit" || status === "out_for_delivery" || status === "delivered") {
    events.push({
      timestamp: new Date(now.getTime() - 12 * 3600000),
      status: "in_transit",
      location: "Hub régional",
      description: "Colis en transit vers la destination",
    });
  }
  if (status === "out_for_delivery" || status === "delivered") {
    events.push({
      timestamp: new Date(now.getTime() - 3 * 3600000),
      status: "out_for_delivery",
      location: "Agence locale",
      description: "En cours de livraison",
    });
  }
  if (status === "delivered") {
    events.push({
      timestamp: new Date(),
      status: "delivered",
      description: "Livré — signé par le destinataire",
    });
  }

  return events;
}
