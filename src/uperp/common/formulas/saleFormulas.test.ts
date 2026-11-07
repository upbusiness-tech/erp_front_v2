import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SaleItemModel } from "@/model/sale.model";
import type { CartSaleItem } from "../../pages/AuthenticatedPages/CommonSale/types.ts";
import {
  calculateChangeSaleOnOrderContent,
  calculateItemNet,
  calculateItemsTotal,
  calculateRemainingSaleOnOrderContent,
  calculateServiceItemsTotal,
  calculateTotalCartItems,
  calculateTotalPayments,
  round2,
} from "./saleFormulas.ts";

const cartItem = (overrides: Record<string, unknown> = {}): CartSaleItem =>
  ({
    id: 1,
    isEspecialPrice: false,
    productId: 1,
    productEspecificationId: 1,
    quantitySold: 1,
    unitSold: 1,
    unitOfMeasure: "Unidade",
    product: { name: "Produto" },
    productEspecification: { salePrice: 10 },
    ...overrides,
  }) as unknown as CartSaleItem;

const persistedItem = (overrides: Record<string, unknown> = {}): SaleItemModel =>
  ({
    id: 1,
    quantitySold: 1,
    unitSold: 1,
    isEspecialPrice: false,
    salePriceSnapshot: 10,
    specialPriceSnapshot: null,
    discountInfo: null,
    ...overrides,
  }) as unknown as SaleItemModel;

describe("calculateItemNet", () => {
  it("rounds weighted lines to cents before summing", () => {
    const items = [
      cartItem({ productEspecification: { salePrice: 27 }, unitSold: 0.608 }),
      cartItem({ productEspecification: { salePrice: 26 }, unitSold: 0.428 }),
      cartItem({ productEspecification: { salePrice: 38 }, unitSold: 0.827 }),
    ];

    // 16.416 + 11.128 + 31.426 -> 16.42 + 11.13 + 31.43
    assert.equal(calculateItemsTotal(items), 58.98);
  });

  it("uses the negotiated price per unit", () => {
    const item = cartItem({
      productEspecification: { salePrice: 38 },
      specialPrice: 37,
      unitSold: 8.055,
    });

    assert.equal(calculateItemNet(item), 298.03);
  });

  it("subtracts the item discount from the rounded line gross", () => {
    const item = cartItem({
      productEspecification: { salePrice: 27 },
      unitSold: 0.608,
      discountInfo: { value: 0.01 },
    });

    assert.equal(calculateItemNet(item), 16.41);
  });

  it("mirrors the persisted snapshot policy for sale history", () => {
    const item = persistedItem({
      isEspecialPrice: true,
      salePriceSnapshot: 38,
      specialPriceSnapshot: 37,
      unitSold: 8.055,
    });

    assert.equal(calculateItemNet(item), 298.03);
  });
});

describe("calculateTotalCartItems", () => {
  it("matches the backend total for the weighted sale that broke in production", () => {
    const items = [
      cartItem({
        productEspecification: { salePrice: 38 },
        specialPrice: 37,
        unitSold: 8.055,
      }),
      cartItem({
        productEspecification: { salePrice: 28 },
        specialPrice: 23.5,
        unitSold: 2.5,
      }),
    ];

    assert.equal(calculateTotalCartItems(items, []), 356.78);
  });

  it("adds services and subtracts the sale discount in cents", () => {
    const items = [
      cartItem({ productEspecification: { salePrice: 27 }, unitSold: 0.608 }),
      cartItem({ productEspecification: { salePrice: 26 }, unitSold: 0.428 }),
      cartItem({ productEspecification: { salePrice: 38 }, unitSold: 0.827 }),
    ];

    assert.equal(
      calculateTotalCartItems(items, [{ description: "Entrega", onwerEmployee: "x", amount: 10 }], {
        value: 8.98,
      }),
      60,
    );
  });

  it("never returns a negative total", () => {
    const items = [cartItem({ productEspecification: { salePrice: 10 } })];

    assert.equal(calculateTotalCartItems(items, [], { value: 50 }), 0);
  });
});

describe("calculateServiceItemsTotal", () => {
  it("rounds service amounts to cents", () => {
    assert.equal(
      calculateServiceItemsTotal([
        { description: "A", onwerEmployee: "x", amount: 10.005 },
        { description: "B", onwerEmployee: "x", amount: 0.1 },
      ]),
      10.11,
    );
  });
});

describe("payments", () => {
  it("sums payments without floating point noise", () => {
    const payments = [
      { id: 1, type: "CASH" as never, amount: 0.1 },
      { id: 2, type: "PIX" as never, amount: 0.2 },
    ];

    assert.equal(calculateTotalPayments(payments), 0.3);
  });

  it("compares paid and total in cents for remaining and change", () => {
    const payments = [{ id: 1, type: "CASH" as never, amount: 58.98 }];

    assert.equal(calculateRemainingSaleOnOrderContent(58.98, payments), 0);
    assert.equal(calculateChangeSaleOnOrderContent(58.98, payments), 0);
    assert.equal(calculateRemainingSaleOnOrderContent(58.99, payments), 0.01);
    assert.equal(calculateChangeSaleOnOrderContent(58.97, payments), 0.01);
  });

  it("exposes the same rounding helper used by the cart", () => {
    assert.equal(round2(58.97999999999999), 58.98);
  });
});
