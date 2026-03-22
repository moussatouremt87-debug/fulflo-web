import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_PASSWORD,
    },
  });
}

export type OrderEmailData = {
  customerEmail: string;
  customerName?: string;
  orderId: string;
  items: { brand: string; name: string; quantity: number; price: number }[];
  subtotal: number;
  serviceFee: number;
  total: number;
  savings: number;
};

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
    console.log("[email] ZOHO credentials not set — skipping order confirmation");
    return;
  }

  const itemsHtml = data.items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0">${i.brand} — ${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right">€${i.price.toFixed(2)}</td>
    </tr>`
    )
    .join("");

  await getTransporter().sendMail({
    from: '"FulFlo" <orders@fulflo.app>',
    to: data.customerEmail,
    subject: `✅ Commande confirmée — FulFlo #${data.orderId.substring(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#111827">
        <div style="background:#1B4332;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">fulflo.</h1>
          <p style="color:#A7F3D0;margin:8px 0 0">Votre commande est confirmée ✅</p>
        </div>
        <div style="background:#F9FAFB;padding:24px;border:1px solid #E5E7EB">
          <p style="margin:0 0 16px">Bonjour${data.customerName ? " " + data.customerName : ""},</p>
          <p>Merci pour votre commande ! Votre surplus de marque est en cours de préparation.</p>
          <div style="background:white;border-radius:8px;border:1px solid #E5E7EB;overflow:hidden;margin:20px 0">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#F3F4F6">
                  <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6B7280">PRODUIT</th>
                  <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6B7280">QTÉ</th>
                  <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6B7280">PRIX</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="padding:12px 8px;border-top:2px solid #E5E7EB">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:#6B7280">Sous-total</span>
                <span>€${data.subtotal.toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:#6B7280">Frais de service (5%)</span>
                <span>€${data.serviceFee.toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;margin-top:8px">
                <span>Total</span>
                <span>€${data.total.toFixed(2)}</span>
              </div>
              <div style="background:#D1FAE5;border-radius:4px;padding:8px;margin-top:8px;text-align:center">
                <span style="color:#065F46;font-weight:bold">Vous économisez €${data.savings.toFixed(2)} vs grande distribution 🎉</span>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-top:24px">
            <a href="https://fulflo.app/track/${data.orderId}"
               style="background:#1B4332;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
              Suivre ma commande →
            </a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;color:#9CA3AF;font-size:12px">
          <p>FulFlo SAS · France · <a href="https://fulflo.app" style="color:#10B981">fulflo.app</a></p>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendLowStockAlert(
  supplierEmail: string,
  productName: string,
  stock: number
) {
  if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) return;

  await getTransporter().sendMail({
    from: '"FulFlo Alerts" <alerts@fulflo.app>',
    to: supplierEmail,
    subject: `⚠️ Stock bas — ${productName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#1B4332">Alerte stock bas</h2>
        <p>Votre produit <strong>${productName}</strong> n'a plus que <strong style="color:#DC2626">${stock} unités</strong> en stock.</p>
        <p>Pensez à réapprovisionner ou activer une vente flash pour écouler le reste.</p>
        <a href="https://fulflo.app/supplier/products"
           style="background:#1B4332;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
          Gérer mes produits →
        </a>
      </div>
    `,
  });
}

export async function sendNewOrderToSupplier(
  supplierEmail: string,
  data: OrderEmailData & { packingSlipUrl: string }
) {
  if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
    console.log("[email] ZOHO credentials not set — skipping supplier notification");
    return;
  }

  await getTransporter().sendMail({
    from: '"FulFlo Orders" <orders@fulflo.app>',
    to: supplierEmail,
    subject: `📦 Nouvelle commande à préparer — #${data.orderId.substring(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#1B4332">Nouvelle commande reçue</h2>
        <p>Une nouvelle commande vient d'être passée sur FulFlo.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          ${data.items
            .map(
              (i) => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0">${i.brand} ${i.name}</td>
              <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right">×${i.quantity}</td>
            </tr>`
            )
            .join("")}
        </table>
        <p><strong>Total : €${data.total.toFixed(2)}</strong></p>
        <p>Veuillez préparer et expédier cette commande dans les 24h.</p>
        <a href="${data.packingSlipUrl}"
           style="background:#1B4332;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">
          📄 Télécharger le bon de préparation →
        </a>
      </div>
    `,
  });
}
