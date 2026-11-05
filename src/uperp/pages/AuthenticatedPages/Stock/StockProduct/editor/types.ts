import type { IProductFiscalClassificationFields } from "../types";

export type EditorMode = "create" | "edit";

export type VariantSnapshot = {
  id?: number;
  code: string;
  barcode: string | null;
  salePrice: number;
  costPrice: number;
  isStockControlled: boolean;
  stockQuantity: number;
  size: string | null;
  color: string | null;
  brand: string | null;
  productSupplierId: number | null;
};

export type VariantDraft = VariantSnapshot & {
  /** Identidade estável na UI: `id:<id>` ou `new:<timestamp>:<n>`. */
  key: string;
  isNew: boolean;
};

export type VariantPayload = Omit<VariantSnapshot, "id"> & { id?: number };

export type ProductDraft = {
  name: string;
  productCategoryId?: number;
  unitOfMeasure: string;
  productPicture?: string | null;
  productFiscalClassification?: IProductFiscalClassificationFields;
};

export type VariantDiff = {
  idsToDelete: number[];
  variants: VariantPayload[];
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  isEmpty: boolean;
};

export type VariantErrors = Partial<Record<keyof VariantSnapshot, string>>;

export type DraftValidation = {
  byKey: Map<string, VariantErrors>;
  invalidCount: number;
  isValid: boolean;
};

export type VariantFilter = "all" | "invalid" | "with_stock" | "without_stock" | "no_price";

export type VariantSortField = "code" | "salePrice" | "costPrice" | "stockQuantity";

export type VariantSort = {
  field: VariantSortField;
  order: "asc" | "desc";
};
