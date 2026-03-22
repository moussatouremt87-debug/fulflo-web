export function generatePackingSlipHtml(data: {
  orderId: string;
  createdAt: string;
  items: { brand: string; name: string; quantity: number; ean?: string }[];
  shippingAddress?: string;
  customerEmail: string;
}): string {
  const dateStr = new Date(data.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td><strong>${item.brand}</strong><br><span style="color:#6B7280;font-size:13px">${item.name}</span></td>
        <td style="font-family:monospace;color:#6B7280">${item.ean || "—"}</td>
        <td style="text-align:center;font-size:18px;font-weight:bold">${item.quantity}</td>
        <td style="text-align:center">
          <div style="width:24px;height:24px;border:2px solid #1B4332;border-radius:4px;display:inline-block"></div>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bon de préparation — #${data.orderId.substring(0, 8).toUpperCase()}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; border-bottom: 2px solid #1B4332; padding-bottom: 16px; }
    .logo { font-size: 28px; font-weight: bold; color: #1B4332; }
    .title { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
    .meta { color: #6B7280; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th { background: #F3F4F6; padding: 10px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase; }
    td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 12px; }
    .barcode-area { margin-top: 32px; padding: 16px; border: 2px dashed #E5E7EB; text-align: center; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">fulflo.</div>
      <div class="meta">fulflo.app · orders@fulflo.app</div>
    </div>
    <div style="text-align:right">
      <div class="title">Bon de préparation</div>
      <div class="meta">Commande #${data.orderId.substring(0, 8).toUpperCase()}</div>
      <div class="meta">${dateStr}</div>
    </div>
  </div>

  <div>
    <strong>Livrer à :</strong><br>
    <span style="color:#6B7280">${data.customerEmail}</span>
    ${data.shippingAddress ? `<br>${data.shippingAddress}` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>Produit</th>
        <th>EAN</th>
        <th style="text-align:center">Quantité</th>
        <th style="text-align:center">✓ Préparé</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="barcode-area">
    <div style="font-size:32px;font-family:monospace;letter-spacing:8px">${data.orderId.substring(0, 8).toUpperCase()}</div>
    <div style="color:#9CA3AF;font-size:12px;margin-top:4px">Référence commande — scanner à l&apos;expédition</div>
  </div>

  <div class="footer">
    <p>FulFlo SAS · Expédier dans les 24h · En cas de problème: ops@fulflo.app</p>
    <p>Ce bon de préparation est confidentiel. Ne pas inclure dans le colis.</p>
  </div>

  <script class="no-print">window.onload = () => window.print();</script>
</body>
</html>`;
}
