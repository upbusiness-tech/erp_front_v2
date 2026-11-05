import type { DraftValidation, VariantDraft, VariantErrors } from "./types";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const validateVariant = (variant: VariantDraft): VariantErrors => {
  const errors: VariantErrors = {};
  const salePrice = toNumber(variant.salePrice);
  const stockQuantity = toNumber(variant.stockQuantity);

  if (!Number.isFinite(salePrice) || salePrice <= 0) {
    errors.salePrice = "Informe um preço de venda maior que zero.";
  }

  if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
    errors.stockQuantity = "Informe um estoque válido.";
  }

  return errors;
};

export const validateDraft = (draft: VariantDraft[]): DraftValidation => {
  const byKey = new Map<string, VariantErrors>();

  for (const variant of draft) {
    const errors = validateVariant(variant);
    if (Object.keys(errors).length > 0) byKey.set(variant.key, errors);
  }

  return {
    byKey,
    invalidCount: byKey.size,
    isValid: byKey.size === 0,
  };
};
