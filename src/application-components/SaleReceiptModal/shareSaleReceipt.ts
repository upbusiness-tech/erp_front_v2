import { SaleReceiptModel } from "@/model/sale.model";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createReceiptHtml } from "./printSaleReceipt";

const PX_PER_MM = 96 / 25.4;

const createReceiptContainer = (receipt: SaleReceiptModel) => {
  const container = document.createElement("div");
  container.innerHTML = createReceiptHtml(receipt);
  container.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:80mm",
    "padding:4mm",
    "background:#fff",
    "color:#111",
    "font:12px/1.35 Arial, sans-serif",
    "box-sizing:border-box",
  ].join(";");
  document.body.appendChild(container);
  return container;
};

const generateReceiptPdf = async (receipt: SaleReceiptModel) => {
  const container = createReceiptContainer(receipt);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const heightMm = Math.ceil(container.scrollHeight / PX_PER_MM) + 1;
    const pdf = new jsPDF({ unit: "mm", format: [80, heightMm], orientation: "portrait" });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 80, heightMm);

    return pdf.output("blob");
  } finally {
    container.remove();
  }
};

const downloadPdf = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Gera o comprovante em PDF e compartilha via Web Share API
 * (WhatsApp, Instagram, e-mail etc. em dispositivos móveis).
 * Quando o compartilhamento nativo não está disponível, baixa o PDF.
 *
 * @returns "shared" | "downloaded"
 */
export const shareSaleReceipt = async (receipt: SaleReceiptModel) => {
  const blob = await generateReceiptPdf(receipt);
  const fileName = `comprovante-${receipt.code}.pdf`;
  const file = new File([blob], fileName, { type: "application/pdf" });

  const canShare =
    typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

  if (canShare) {
    await navigator.share({
      files: [file],
      title: `Comprovante ${receipt.code}`,
    });
    return "shared" as const;
  }

  downloadPdf(blob, fileName);
  return "downloaded" as const;
};