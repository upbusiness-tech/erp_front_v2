import { ProductModel } from "@/model/product.model";

export const getProductSupplierNames = (p: ProductModel) => {
  return [
    ...new Set(
      p.productEspecifications
        .map((pe) => pe.productSupplier?.name)
        .filter((name): name is string => !!name),
    ),
  ].join(", ");
};
