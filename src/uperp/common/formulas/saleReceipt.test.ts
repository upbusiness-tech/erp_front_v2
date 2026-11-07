import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSaleReceipt } from "./saleReceipt.ts";

type SaleInput = Parameters<typeof createSaleReceipt>[0];

const saleItem = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  note: "",
  quantitySold: 1,
  unitSold: 0.75,
  unitOfMeasure: "Unidade",
  isEspecialPrice: false,
  specialPriceSource: "CATALOG",
  productSnapshot: {
    salePrice: 40,
    code: "001",
    size: null,
    color: null,
    brand: null,
    product: { name: "Produto teste", unitOfMeasure: "Unidade" },
  },
  salePriceSnapshot: 40,
  specialPriceSnapshot: 0,
  costPriceSnapshot: 20,
  discountInfo: {},
  internCustomerPriceId: null,
  internCustomerPrice: null,
  ...overrides,
});

const sale = (overrides: Record<string, unknown> = {}): SaleInput =>
  ({
    id: 1,
    code: "A1",
    type: "BALCAO",
    status: "Concluída",
    cashFlowId: 1,
    companyUid: "company",
    canceledByUserUid: "",
    createdAt: "2026-11-06T10:00:00.000Z",
    items: [saleItem()],
    payments: [{ id: 1, type: "DINHEIRO", amount: 21 }],
    services: [],
    discount: {},
    ...overrides,
  }) as unknown as SaleInput;

describe("createSaleReceipt", () => {
  it("uses specialPriceSnapshot as the applied unit price and savings", () => {
    const receipt = createSaleReceipt(
      sale({
        items: [
          saleItem({
            isEspecialPrice: true,
            specialPriceSnapshot: 28,
            specialPriceSource: "NEGOTIATED",
          }),
        ],
        payments: [{ id: 1, type: "DINHEIRO", amount: 21 }],
      }),
    );

    assert.equal(receipt.items[0].unitPrice, 28);
    assert.equal(receipt.items[0].hasSpecialPrice, true);
    assert.equal(receipt.items[0].specialPriceSource, "NEGOTIATED");
    assert.equal(receipt.items[0].lineTotal, 21);
    assert.equal(receipt.specialPriceTotal, 9);
    assert.equal(receipt.total, 21);
  });

  it("keeps the customer table source on the receipt item", () => {
    const receipt = createSaleReceipt(
      sale({
        items: [
          saleItem({
            isEspecialPrice: true,
            specialPriceSnapshot: 30,
            specialPriceSource: "CUSTOMER_TABLE",
          }),
        ],
        payments: [{ id: 1, type: "DINHEIRO", amount: 22.5 }],
      }),
    );

    assert.equal(receipt.items[0].unitPrice, 30);
    assert.equal(receipt.items[0].hasSpecialPrice, true);
    assert.equal(receipt.items[0].specialPriceSource, "CUSTOMER_TABLE");
  });

  it("marks an identified isolated customer", () => {
    const receipt = createSaleReceipt(sale({ isolatedCustomer: { name: "Maria Souza" } }));

    assert.equal(receipt.customerName, "Maria Souza (Avulso)");
  });

  it("marks an isolated customer without a name", () => {
    const receipt = createSaleReceipt(sale({ isolatedCustomer: { name: "" } }));

    assert.equal(receipt.customerName, "(Avulso)");
  });

  it("falls back to Consumidor final without customer data", () => {
    const receipt = createSaleReceipt(sale());
    const plainReceipt = createSaleReceipt(
      sale({ items: [saleItem({ specialPriceSnapshot: 0 })] }),
    );

    assert.equal(receipt.customerName, "Consumidor final");
    assert.equal(plainReceipt.items[0].unitPrice, 40);
    assert.equal(plainReceipt.items[0].hasSpecialPrice, false);
    assert.equal(plainReceipt.items[0].specialPriceSource, "CATALOG");
    assert.equal(plainReceipt.specialPriceTotal, 0);
  });
});
