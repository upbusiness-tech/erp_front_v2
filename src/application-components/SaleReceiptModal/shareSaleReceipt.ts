import { SaleReceiptModel } from "@/model/sale.model";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { createReceiptHtml } from "./printSaleReceipt";

const PX_PER_MM = 96 / 25.4;

/**
 * Renderiza o comprovante dentro de um iframe oculto contendo APENAS o recibo.
 *
 * O html2canvas clona o documento do elemento alvo; quando o recibo é montado
 * no document principal, ele clonava a aplicação inteira (milhares de nós do
 * React/Antd + todos os stylesheets do Tailwind v4) a cada abertura do modal —
 * travando a tela. Isolando o recibo no próprio documento do iframe, o clone
 * fica restrito a dezenas de nós e a geração é rápida e sem jank.
 */
const loadReceiptFrame = async (receipt: SaleReceiptModel) => {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText =
    "position:fixed;left:-10000px;top:0;width:80mm;height:1px;border:0;visibility:hidden;";

  await new Promise<void>((resolve, reject) => {
    frame.onload = () => resolve();
    frame.onerror = () => reject(new Error("Não foi possível carregar o comprovante"));
    frame.srcdoc = createReceiptHtml(receipt);
    document.body.appendChild(frame);
  });

  const doc = frame.contentDocument;
  const target = doc?.body;
  if (!doc || !target) {
    frame.remove();
    throw new Error("Comprovante indisponível");
  }

  // Garante que a altura do iframe acompanhe o conteúdo antes da captura.
  frame.style.height = `${Math.max(doc.documentElement.scrollHeight, target.scrollHeight)}px`;
  return { frame, doc, target };
};

const generateReceiptPdf = async (receipt: SaleReceiptModel) => {
  const { frame, doc, target } = await loadReceiptFrame(receipt);

  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      // Limita a renderização ao documento do comprovante (iframe), em vez de
      // clonar a aplicação inteira — mantém a tela fluida.
      windowWidth: doc.documentElement.scrollWidth,
      windowHeight: doc.documentElement.scrollHeight,
    });

    const heightMm = Math.ceil(target.scrollHeight / PX_PER_MM) + 1;
    const pdf = new jsPDF({ unit: "mm", format: [80, heightMm], orientation: "portrait" });
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 80, heightMm);

    return pdf.output("blob");
  } finally {
    frame.remove();
  }
};

const receiptFileName = (code: string) => `comprovante-${code}.pdf`;

const downloadPdf = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Gera o comprovante em PDF (HTML -> canvas -> PDF) já como File.
 *
 * Separada da ação de compartilhar para que o PDF possa ser pré-gerado assim
 * que o comprovante aparece na tela: a Web Share API exige "transient user
 * activation", que em navegadores móveis expira em ~5 segundos. Se o
 * `navigator.share()` for chamado só depois de um html2canvas + jsPDF lentos,
 * a ativação do gesto já morreu e o share rejeita com NotAllowedError
 * (o "sempre dá erro" relatado em dispositivos móveis).
 */
export const generateSaleReceiptFile = async (receipt: SaleReceiptModel): Promise<File> => {
  const blob = await generateReceiptPdf(receipt);
  return new File([blob], receiptFileName(receipt.code), { type: "application/pdf" });
};

/**
 * Gera o comprovante em PDF e compartilha via Web Share API
 * (WhatsApp, Instagram, e-mail etc. em dispositivos móveis).
 *
 * Aceita um `file` já gerado (`generateSaleReceiptFile`) para que o
 * `navigator.share()` rode imediatamente no gesto do clique. Se o PDF não for
 * passado, gera na hora.
 *
 * Se o compartilhamento nativo não estiver disponível ou falhar (ativação
 * expirada, permissão, plataforma sem suporte etc.), **baixa o PDF** em vez de
 * exibir erro — o usuário nunca fica sem o comprovante.
 *
 * @returns "shared" | "downloaded"
 */
export const shareSaleReceipt = async (
  receipt: SaleReceiptModel,
  file?: File,
): Promise<"shared" | "downloaded"> => {
  const pdfFile = file ?? (await generateSaleReceiptFile(receipt));

  const canShare =
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [pdfFile] });

  if (canShare) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Comprovante ${receipt.code}`,
      });
      return "shared" as const;
    } catch (error) {
      // Usuário cancelou o sheet nativo: propaga para o caller ignorar.
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      // Qualquer outra falha (ativação expirada, política da plataforma etc.):
      // baixa o PDF em vez de bloquear o usuário com erro.
    }
  }

  downloadPdf(pdfFile, receiptFileName(receipt.code));
  return "downloaded" as const;
};
