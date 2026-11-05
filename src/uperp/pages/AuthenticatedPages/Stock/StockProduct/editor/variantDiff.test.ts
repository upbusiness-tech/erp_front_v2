import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ProductDraft, VariantDraft, VariantSnapshot } from "./types.ts";
import {
  computeVariantDiff,
  isEditorDirty,
  isProductDraftDirty,
  toVariantDraft,
  toVariantSnapshot,
  variantToPayload,
} from "./variantDiff.ts";
import { validateDraft, validateVariant } from "./variantValidation.ts";

const snapshot = (overrides: Partial<VariantSnapshot> = {}): VariantSnapshot => ({
  id: 1,
  code: "001",
  barcode: null,
  salePrice: 10,
  costPrice: 5,
  isStockControlled: true,
  stockQuantity: 2,
  size: "P",
  color: "Preto",
  brand: null,
  productSupplierId: null,
  ...overrides,
});

const draft = (overrides: Partial<VariantDraft> = {}): VariantDraft => ({
  ...snapshot(),
  key: "id:1",
  isNew: false,
  ...overrides,
});

describe("variant normalization", () => {
  it("normalizes null, empty text and numeric strings", () => {
    const normalized = toVariantSnapshot({
      id: 1,
      code: "  001 ",
      barcode: "  ",
      salePrice: "10.5" as unknown as number,
      costPrice: "5" as unknown as number,
      isStockControlled: true,
      stockQuantity: "3" as unknown as number,
      size: " P ",
      color: "",
      brand: null,
      productSupplierId: null,
    });

    assert.equal(normalized.code, "001");
    assert.equal(normalized.barcode, null);
    assert.equal(normalized.salePrice, 10.5);
    assert.equal(normalized.stockQuantity, 3);
    assert.equal(normalized.size, "P");
    assert.equal(normalized.color, null);
  });

  it("keeps the id when building the payload for an update", () => {
    const payload = variantToPayload(draft({ id: 7 }));
    assert.equal(payload.id, 7);
  });

  it("omits the id when building the payload for a new variant", () => {
    const payload = variantToPayload(draft({ id: undefined, isNew: true, key: "new:1" }));
    assert.equal("id" in payload, false);
  });
});

describe("computeVariantDiff", () => {
  it("omits unchanged variants", () => {
    const result = computeVariantDiff([snapshot()], [draft()]);

    assert.equal(result.isEmpty, true);
    assert.deepEqual(result.idsToDelete, []);
    assert.equal(result.variants.length, 0);
  });

  it("sends only changed variants as updates", () => {
    const result = computeVariantDiff(
      [snapshot({ id: 1 }), snapshot({ id: 2 })],
      [draft({ id: 1, salePrice: 20 }), draft({ id: 2, key: "id:2" })],
    );

    assert.equal(result.updatedCount, 1);
    assert.equal(result.variants.length, 1);
    assert.equal(result.variants[0].id, 1);
    assert.equal(result.variants[0].salePrice, 20);
  });

  it("sends new variants without id", () => {
    const result = computeVariantDiff(
      [],
      [draft({ id: undefined, isNew: true, key: "new:1", code: "NOVO" })],
    );

    assert.equal(result.createdCount, 1);
    assert.equal("id" in result.variants[0], false);
  });

  it("derives idsToDelete from baseline ids missing in the draft", () => {
    const result = computeVariantDiff(
      [snapshot({ id: 1 }), snapshot({ id: 2 })],
      [draft({ id: 1 })],
    );

    assert.deepEqual(result.idsToDelete, [2]);
    assert.equal(result.deletedCount, 1);
    assert.equal(result.isEmpty, false);
  });

  it("does not treat a removed new variant as a delete", () => {
    const result = computeVariantDiff([], []);

    assert.deepEqual(result.idsToDelete, []);
    assert.equal(result.isEmpty, true);
  });
});

describe("dirty state", () => {
  const product = (overrides: Partial<ProductDraft> = {}): ProductDraft => ({
    name: "Produto",
    productCategoryId: 1,
    unitOfMeasure: "Unidade",
    productPicture: null,
    ...overrides,
  });

  it("detects product field changes", () => {
    assert.equal(isProductDraftDirty(product(), product()), false);
    assert.equal(isProductDraftDirty(product(), product({ name: "Outro" })), true);
  });

  it("combines product dirty and variant diff", () => {
    const emptyDiff = computeVariantDiff([], []);
    const variantDiff = computeVariantDiff([], [draft({ id: undefined, key: "new:1" })]);

    assert.equal(isEditorDirty(false, emptyDiff), false);
    assert.equal(isEditorDirty(false, variantDiff), true);
    assert.equal(isEditorDirty(true, emptyDiff), true);
  });
});

describe("draft validation", () => {
  it("requires a positive sale price", () => {
    assert.ok(validateVariant(draft({ salePrice: 0 })).salePrice);
    assert.ok(validateVariant(draft({ salePrice: -1 })).salePrice);
    assert.equal(validateVariant(draft({ salePrice: 1 })).salePrice, undefined);
  });

  it("rejects negative stock", () => {
    assert.ok(validateVariant(draft({ stockQuantity: -1 })).stockQuantity);
    assert.equal(validateVariant(draft({ stockQuantity: 0 })).stockQuantity, undefined);
  });

  it("returns errors by key and counts invalid variants", () => {
    const result = validateDraft([
      draft({ id: 1, key: "id:1", salePrice: 10 }),
      draft({ id: 2, key: "id:2", salePrice: 0 }),
      draft({ id: 3, key: "id:3", stockQuantity: -1 }),
    ]);

    assert.equal(result.invalidCount, 2);
    assert.equal(result.isValid, false);
    assert.ok(result.byKey.has("id:2"));
    assert.ok(result.byKey.has("id:3"));
    assert.equal(result.byKey.has("id:1"), false);
  });
});
