import { Banknote, FileText } from "lucide-react";

export const SaleSetting = {
  SaleByCashFlow: {
    module: "Sale",
    key: "sale_by_cash_flow",
    description: "Vendas baseadas em caixas",
    icon: <Banknote size={18} color="#F26B1F" />,
  },
  GenerateSaleProofDocument: {
    module: "Sale",
    key: "generate_sale_proof_document",
    description: "Gerar comprovantes ao realizar venda",
    icon: <FileText size={18} color="#F26B1F" />,
  },
};
