import { InternCustomerModel } from "@/model/internCustomer.model";
import { ProductModel } from "@/model/product.model";
import { ProductEspecificationModel } from "@/model/productEspecification.model";
import { useSalesStore } from "@/stores/sales.store";
import { calculeStockTotalByProductEspecification } from "@/uperp/common/formulas/productFormulas";
import { getUnitSoldFormat } from "@/uperp/common/formulas/saleReceipt";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";
import { UNIT_OF_MEASURE_OPTIONS } from "@/uperp/pages/AuthenticatedPages/Stock/StockView/components/StockProductTable/consts";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";

type ProductEspecificationModalControllerProps = {
  openProductEspecificationModal: boolean;
  product: ProductModel | undefined;
  onClose: () => void;
  selectedCustomer?: InternCustomerModel;
};

export function useProductEspecificationModalController({
  onClose,
  openProductEspecificationModal,
  product,
  selectedCustomer,
}: ProductEspecificationModalControllerProps) {
  const [qty, setQty] = useState(1);
  const [unitSold, setUnitSold] = useState(1);
  const [note, setNote] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);

  const sizes = Array.from(
    new Set(product?.productEspecifications?.filter((pe) => pe.size).map((pe) => pe.size) ?? []),
  );

  const colorOptions =
    product?.productEspecifications?.filter((pe) =>
      sizes.length > 0 ? pe.size === selectedSize : !!pe.color,
    ) ?? [];

  const colors = Array.from(
    new Set(colorOptions.map((pe) => pe.color).filter(Boolean)),
  ) as string[];

  const brandOptions =
    product?.productEspecifications?.filter(
      (pe) =>
        (sizes.length === 0 || pe.size === selectedSize) &&
        (colors.length === 0 || pe.color === selectedColor),
    ) ?? [];

  const brands = Array.from(
    new Set(brandOptions.map((pe) => pe.brand).filter(Boolean)),
  ) as string[];

  const findSpecification = (): ProductEspecificationModel | undefined => {
    return product?.productEspecifications.find(
      (pe) =>
        (sizes.length === 0 || pe.size === selectedSize) &&
        (colors.length === 0 || pe.color === selectedColor) &&
        (brands.length === 0 || pe.brand === selectedBrand),
    );
  };

  const stock = findSpecification()
    ? findSpecification()?.stockQuantity
    : calculeStockTotalByProductEspecification(product?.productEspecifications || []);

  const isQuantityAvaliable = () => {
    const currentEspecification = findSpecification();
    if (currentEspecification) {
      return currentEspecification?.stockQuantity > unitSold * qty;
    }
  };

  const isNotStandardUnitOfMeasurement = product?.unitOfMeasure != ProductUnitOfMeasure.UNIT;

  const specialPriceForSpec = useMemo(() => {
    const spec = product?.productEspecifications.find(
      (pe) =>
        (sizes.length === 0 || pe.size === selectedSize) &&
        (colors.length === 0 || pe.color === selectedColor) &&
        (brands.length === 0 || pe.brand === selectedBrand),
    );
    if (!spec || !selectedCustomer?.internCustomerPrices) return null;
    return selectedCustomer.internCustomerPrices.find(
      (sp) => sp.productEspecificationId === spec.id,
    );
  }, [
    selectedSize,
    selectedColor,
    selectedBrand,
    selectedCustomer,
    product,
    sizes,
    colors,
    brands,
  ]);

  const { saleItems, setSaleItems } = useSalesStore();

  const handleAddToComanda = () => {
    if (!product) return;
    if (sizes.length > 0 && !selectedSize) return message.error("Selecione o tamanho");
    if (colors.length > 0 && !selectedColor) return message.error("Selecione a cor");
    if (brands.length > 0 && !selectedBrand) return message.error("Selecione a marca");

    const specification = findSpecification();
    if (isNotStandardUnitOfMeasurement && unitSold <= 0) {
      return message.error("Informe um valor pesado/medido.");
    }
    if (specification?.isStockControlled) {
      if (specification.stockQuantity === 0) {
        message.warning("Sem estoque suficiente!");
        return;
      }
      if (!isQuantityAvaliable()) {
        message.warning("Estoque selecionado está indisponível para venda!");
        return;
      }
      const sameSpecificationAtOrder = saleItems.filter(
        (si) => si.productEspecificationId === specification?.id,
      );
      if (sameSpecificationAtOrder.length > 0) {
        const currentStock = specification.stockQuantity;
        const totalAdded = sameSpecificationAtOrder.reduce((acc, value) => {
          return acc + value.quantitySold * value.unitSold;
        }, 0);
        if (currentStock <= totalAdded) {
          message.warning("Estoque selecionado está indisponível para venda!");
          return;
        }
      }
    }
    if (specification) {
      const specificationSelected: CartSaleItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        isEspecialPrice: false,
        note,
        productEspecificationId: specification?.id,
        productId: product.id,
        quantitySold: qty,
        product,
        productEspecification: specification,
        unitSold: isNotStandardUnitOfMeasurement ? unitSold : 1,
        unitOfMeasure: product.unitOfMeasure,
      };
      setSaleItems([...saleItems, specificationSelected]);
    }
    onClose();
  };

  useEffect(() => {
    if (openProductEspecificationModal) {
      setQty(1);
      setUnitSold(0);
      setSelectedSize(undefined);
      setSelectedColor(undefined);
      setSelectedBrand(undefined);
      setNote(undefined);
    }
  }, [openProductEspecificationModal, product?.id]);

  return {
    handleAddToComanda,
    findSpecification,
    stock,
    specialPriceForSpec,
    qty,
    setQty,
    unitSold,
    setUnitSold,
    isNotStandardUnitOfMeasurement,
    sizes,
    selectedSize,
    selectedColor,
    setSelectedSize,
    setSelectedColor,
    colors,
    brands,
    selectedBrand,
    setSelectedBrand,
    setNote,
    note,
    isQuantityAvaliable,
  };
}
