import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UnitPriceItem } from "./unitPrice.ts";
import {
  calculateItemSpecialPriceSavings,
  calculateOrderItem,
  getItemSpecialPrice,
  resolveItemUnitPrice,
} from "./unitPrice.ts";
import { calculateSpecialPriceSavings } from "./saleFormulas.ts";

const cartItem = (overrides: Partial<UnitPriceItem> = {}): UnitPriceItem => ({
  productEspecification: { salePrice: 40 },
  quantitySold: 1,
  unitSold: 0.75,
  ...overrides,
});

const persistedItem = (overrides: Partial<UnitPriceItem> = {}): UnitPriceItem => ({
  productSnapshot: { salePrice: 40 },
  quantitySold: 1,
  unitSold: 0.75,
  ...overrides,
});

describe("resolveItemUnitPrice", () => {
  it("prefers the negotiated specialPrice", () => {
    const item = cartItem({
      specialPrice: 28,
      internCustomerPrice: { specialPrice: 30 },
      specialPriceSnapshot: 32,
    });

    assert.equal(getItemSpecialPrice(item), 28);
    assert.equal(resolveItemUnitPrice(item), 28);
  });

  it("falls back to the customer table price", () => {
    const item = cartItem({ internCustomerPrice: { specialPrice: 30 }, specialPriceSnapshot: 32 });

    assert.equal(resolveItemUnitPrice(item), 30);
  });

  it("falls back to the persisted snapshot price", () => {
    const item = persistedItem({ specialPriceSnapshot: 32 });

    assert.equal(resolveItemUnitPrice(item), 32);
  });

  it("falls back to the catalog sale price", () => {
    assert.equal(resolveItemUnitPrice(cartItem()), 40);
    assert.equal(resolveItemUnitPrice(persistedItem({ specialPriceSnapshot: 0 })), 40);
  });
});

describe("calculateOrderItem", () => {
  it("multiplies the negotiated unit price by quantity and sold unit", () => {
    const item = cartItem({ specialPrice: 28 });

    assert.equal(calculateOrderItem(item), 21);
  });

  it("uses the catalog price when there is no special price", () => {
    assert.equal(calculateOrderItem(cartItem()), 30);
  });
});

describe("calculateSpecialPriceSavings", () => {
  it("computes the negotiated price savings", () => {
    const items = [cartItem({ specialPrice: 28 })];

    assert.equal(calculateItemSpecialPriceSavings(items[0]), 9);
    assert.equal(calculateSpecialPriceSavings(items), 9);
  });

  it("computes savings from the customer table price", () => {
    const items = [cartItem({ internCustomerPrice: { specialPrice: 30 } })];

    assert.equal(calculateSpecialPriceSavings(items), 7.5);
  });

  it("computes savings from the persisted snapshot", () => {
    const items = [persistedItem({ specialPriceSnapshot: 28 })];

    assert.equal(calculateSpecialPriceSavings(items), 9);
  });

  it("returns zero when the applied price matches the catalog price", () => {
    assert.equal(calculateSpecialPriceSavings([persistedItem({ specialPriceSnapshot: 40 })]), 0);
  });

  it("supports a negotiated price above the catalog price", () => {
    assert.equal(calculateSpecialPriceSavings([cartItem({ specialPrice: 48 })]), -6);
  });
});
