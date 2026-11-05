import { Banknote, FileText } from "lucide-react";
import { BRAND } from "@/theme/colors";

export const SaleSetting = {
  SaleByCashFlow: {
    module: "Sale",
    key: "sale_by_cash_flow",
    description: "Vendas baseadas em caixas",
    icon: <Banknote size={18} color={BRAND} />,
  },
  GenerateSaleProofDocument: {
    module: "Sale",
    key: "generate_sale_proof_document",
    description: "Gerar comprovantes ao realizar venda",
    icon: <FileText size={18} color={BRAND} />,
  },
};
