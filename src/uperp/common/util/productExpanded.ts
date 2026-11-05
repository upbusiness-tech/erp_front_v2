import type { ProductExpandedViewModel, ProductModel } from "@/model/product.model";
import type { ProductFiscalClassification } from "@/model/productFiscalClassification.model";
import type { UserModel } from "@/model/user.model";

/**
 * Constrói um `ProductModel` sintético a partir de uma linha do endpoint
 * `product/expanded`. O objeto existe apenas durante a sessão do modal de
 * variação/carrinho: a identidade de linha das listas deve continuar sendo
 * `productEspecificationId` para não colidir entre variações do mesmo produto.
 */
export const toProductModelFromExpanded = (item: ProductExpandedViewModel): ProductModel => ({
  id: item.productId,
  name: item.productName,
  productCategoryId: item.productCategoryId,
  productCategory: {
    id: item.productCategoryId,
    name: item.productCategoryName,
    color: item.productCategoryColor,
  },
  unitOfMeasure: item.unitOfMeasure,
  createByUserUid: "",
  productPicture: item.productPicture,
  productEspecifications: [
    {
      id: item.productEspecificationId,
      code: item.code,
      barcode: item.barcode,
      salePrice: item.salePrice,
      costPrice: item.costPrice,
      isStockControlled: item.isStockControlled,
      stockQuantity: item.stockQuantity,
      size: item.size,
      color: item.color,
      brand: item.brand,
      productSupplierId: item.productSupplierId,
      productSupplier: item.supplierName
        ? { id: item.productSupplierId, name: item.supplierName }
        : undefined,
    },
  ],
  productFiscalClassification: undefined as unknown as ProductFiscalClassification,
  createByUser: undefined as unknown as UserModel,
  createdAt: item.createdAt,
});

export const getExpandedProductRowKey = (item: ProductExpandedViewModel) =>
  item.productEspecificationId;
