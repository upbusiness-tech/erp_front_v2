import type { ProductEspecificationModel } from "@/model/productEspecification.model";
import type { IProductVariantField } from "../types";
import type {
  ProductDraft,
  VariantDiff,
  VariantDraft,
  VariantPayload,
  VariantSnapshot,
} from "./types";

let tempKeyCounter = 0;

export const createVariantKey = (id?: number) => {
  if (id) return `id:${id}`;
  tempKeyCounter += 1;
  return `new:${Date.now()}:${tempKeyCounter}`;
};

const toNullableText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toVariantSnapshot = (
  variant: ProductEspecificationModel | IProductVariantField | VariantSnapshot,
): VariantSnapshot => ({
  id: variant.id,
  code: variant.code?.trim() ?? "",
  barcode: toNullableText(variant.barcode),
  salePrice: toNumber(variant.salePrice),
  costPrice: toNumber(variant.costPrice),
  isStockControlled: Boolean(variant.isStockControlled),
  stockQuantity: toNumber(variant.stockQuantity),
  size: toNullableText(variant.size),
  color: toNullableText(variant.color),
  brand: toNullableText(variant.brand),
  productSupplierId: variant.productSupplierId ?? null,
});

export const toVariantDraft = (
  variant: ProductEspecificationModel | IProductVariantField | VariantSnapshot,
): VariantDraft => {
  const snapshot = toVariantSnapshot(variant);
  return {
    ...snapshot,
    key: createVariantKey(snapshot.id),
    isNew: !snapshot.id,
  };
};

export const variantToPayload = (variant: VariantDraft): VariantPayload => {
  const {
    code,
    barcode,
    salePrice,
    costPrice,
    isStockControlled,
    stockQuantity,
    size,
    color,
    brand,
    productSupplierId,
  } = variant;

  return {
    ...(variant.id ? { id: variant.id } : {}),
    code: code.trim(),
    barcode,
    salePrice: toNumber(salePrice),
    costPrice: toNumber(costPrice),
    isStockControlled: Boolean(isStockControlled),
    stockQuantity: toNumber(stockQuantity),
    size,
    color,
    brand,
    productSupplierId,
  };
};

export const normalizeVariant = (variant: VariantSnapshot | VariantDraft): VariantPayload =>
  variantToPayload(variant as VariantDraft);

export const areVariantsEqual = (
  a: VariantSnapshot | VariantDraft,
  b: VariantSnapshot | VariantDraft,
) => JSON.stringify(normalizeVariant(a)) === JSON.stringify(normalizeVariant(b));

export const computeVariantDiff = (
  baseline: VariantSnapshot[],
  draft: VariantDraft[],
): VariantDiff => {
  const baselineById = new Map(
    baseline.filter((variant) => variant.id !== undefined).map((variant) => [variant.id!, variant]),
  );

  const draftIds = new Set(
    draft.filter((variant) => variant.id !== undefined).map((variant) => variant.id!),
  );

  const idsToDelete = [...baselineById.keys()].filter((id) => !draftIds.has(id));

  const updates = draft.filter((variant) => {
    if (variant.id === undefined) return false;
    const original = baselineById.get(variant.id);
    return !!original && !areVariantsEqual(original, variant);
  });

  const creates = draft.filter((variant) => variant.id === undefined);

  const variants = [...updates, ...creates].map(variantToPayload);

  return {
    idsToDelete,
    variants,
    createdCount: creates.length,
    updatedCount: updates.length,
    deletedCount: idsToDelete.length,
    isEmpty: variants.length === 0 && idsToDelete.length === 0,
  };
};

const normalizeProductDraft = (draft: ProductDraft) => ({
  name: draft.name?.trim() ?? "",
  productCategoryId: draft.productCategoryId ?? null,
  unitOfMeasure: draft.unitOfMeasure ?? "",
  productPicture: draft.productPicture ?? null,
  productFiscalClassification: draft.productFiscalClassification
    ? Object.fromEntries(
        Object.entries(draft.productFiscalClassification).sort(([a], [b]) => a.localeCompare(b)),
      )
    : null,
});

export const isProductDraftDirty = (baseline: ProductDraft, draft: ProductDraft) =>
  JSON.stringify(normalizeProductDraft(baseline)) !== JSON.stringify(normalizeProductDraft(draft));

export const isEditorDirty = (productDirty: boolean, diff: VariantDiff) =>
  productDirty || !diff.isEmpty;
