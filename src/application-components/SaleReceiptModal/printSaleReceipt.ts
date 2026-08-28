import { SaleReceiptModel } from "@/model/sale.model";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { SALE_PAYMENT_LABEL, formatUnitSoldAmount } from "@/uperp/common/formulas/saleReceipt";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
};

export const createReceiptHtml = (receipt: SaleReceiptModel) => {
  const items = receipt.items
    .map(
      (item) => `
        <article class="item">
          <div class="line strong"><span>${escapeHtml(item.name)}</span><span>${formatPrice(item.lineTotal)}</span></div>
          <div class="muted">${formatUnitSoldAmount(item.unitOfMeasure, item.unitSold) ?? item.quantity} x ${formatPrice(item.unitPrice)}${item.size ? ` · Tam. ${escapeHtml(item.size)}` : ""}${item.color ? ` · ${escapeHtml(item.color)}` : ""}</div>
          ${item.hasSpecialPrice ? `<div class="special">PREÇO ESPECIAL · De ${formatPrice(item.originalUnitPrice)} por ${formatPrice(item.unitPrice)}</div>` : ""}
          ${item.discountValue != null && item.discountValue > 0 ? `<div class="discount">DESCONTO: -${formatPrice(item.discountValue)}</div>` : ""}
          ${item.note ? `<div class="muted">Obs.: ${escapeHtml(item.note)}</div>` : ""}
        </article>`,
    )
    .join("");
  const payments = receipt.payments
    .map(
      (payment) =>
        `<div class="line"><span>${SALE_PAYMENT_LABEL[payment.type] || escapeHtml(payment.type)}</span><span>${formatPrice(payment.amount)}</span></div>`,
    )
    .join("");

  return `<!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Comprovante ${escapeHtml(receipt.code)}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; width: 80mm; background: #fff; }
          body { padding: 4mm; color: #111; font: 12px/1.35 Arial, sans-serif; }
          .center { text-align: center; }
          h1 { font-size: 16px; margin: 0 0 2px; }
          h2 { font-size: 12px; margin: 12px 0 5px; border-bottom: 1px dashed #555; padding-bottom: 3px; text-transform: uppercase; }
          .muted { color: #555; font-size: 11px; margin-top: 2px; }
          .line { display: flex; justify-content: space-between; gap: 8px; margin: 4px 0; }
          .strong { font-weight: 700; }
          .item { break-inside: avoid; margin: 0 0 8px; }
          .special { color: #8a4b00; font-size: 10px; font-weight: 700; margin-top: 2px; }
          .discount { color: #b91c1c; font-size: 10px; font-weight: 700; margin-top: 2px; }
          .total { border-top: 1px solid #111; font-size: 15px; font-weight: 700; margin-top: 8px; padding-top: 6px; }
          .footer { color: #555; margin-top: 16px; text-align: center; }
        </style>
      </head>
      <body>
        <header class="center">
          <h1>COMPROVANTE DE VENDA</h1>
          <div>Venda ${escapeHtml(receipt.code)}</div>
          <div class="muted">${escapeHtml(formatDate(receipt.date))}</div>
        </header>
        <h2>Cliente</h2>
        <div>${escapeHtml(receipt.customerName || "Consumidor final")}</div>
        <h2>Itens</h2>
        ${items}
        <h2>Resumo</h2>
        <div class="line"><span>Subtotal</span><span>${formatPrice(receipt.subtotal)}</span></div>
        ${receipt.specialPriceTotal > 0 ? `<div class="line"><span>Preços especiais</span><span>-${formatPrice(receipt.specialPriceTotal)}</span></div>` : ""}
        ${receipt.itemDiscountTotal > 0 ? `<div class="line"><span>Desconto dos itens</span><span>-${formatPrice(receipt.itemDiscountTotal)}</span></div>` : ""}
        ${receipt.saleDiscountValue > 0 ? `<div class="line"><span>Desconto da venda</span><span>-${formatPrice(receipt.saleDiscountValue)}</span></div>` : ""}
        <div class="line total"><span>Total</span><span>${formatPrice(receipt.total)}</span></div>
        <h2>Pagamentos</h2>
        ${payments}
        <div class="line"><span>Pago</span><span>${formatPrice(receipt.paid)}</span></div>
        ${receipt.change > 0 ? `<div class="line strong"><span>Troco</span><span>${formatPrice(receipt.change)}</span></div>` : ""}
        <div class="footer">Obrigado pela preferência!</div>
      </body>
    </html>`;
};

export const printSaleReceipt = (receipt: SaleReceiptModel) => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "80mm";
  iframe.style.height = "1px";
  iframe.style.border = "0";

  return new Promise<void>((resolve, reject) => {
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      iframe.remove();
    };

    iframe.onerror = () => {
      cleanup();
      reject(new Error("Não foi possível preparar o comprovante"));
    };
    iframe.onload = () => {
      try {
        const printWindow = iframe.contentWindow;
        if (!printWindow) throw new Error("A janela de impressão não está disponível");

        printWindow.addEventListener("afterprint", cleanup, { once: true });
        printWindow.focus();
        printWindow.print();
        resolve();
        window.setTimeout(cleanup, 1500);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    iframe.srcdoc = createReceiptHtml(receipt);
    document.body.appendChild(iframe);
  });
};
