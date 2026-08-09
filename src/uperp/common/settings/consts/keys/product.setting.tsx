import { ScanLine, StickyNote } from "lucide-react";

export const ProductSetting = {
  NoteOnProduct: {
    module: "Product",
    key: "note_on_product",
    description: "Anexar anotações em produtos",
    icon: <StickyNote size={18} color="#F26B1F" />,
  },
  ScanProductByCode: {
    module: "Product",
    key: "scan_product_by_code",
    description: "Escanear produtos via código de barras",
    icon: <ScanLine size={18} color="#F26B1F" />,
  },
};
