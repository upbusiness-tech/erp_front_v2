import { InternCustomerModel } from "@/model/internCustomer.model";
import { ProductModel } from "@/model/product.model";
import { useSalesStore } from "@/stores/sales.store";
import { calculeStockTotalByProductEspecification } from "@/uperp/common/formulas/productFormulas";
import { isVariationSellable } from "@/uperp/common/util/productVariation";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";
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
  const [selectedSpecificationId, setSelectedSpecificationId] = useState<number | undefined>();
  const [qty, setQty] = useState(1);
  const [unitSold, setUnitSold] = useState(1);
  const [note, setNote] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const specifications = useMemo(
    () => product?.productEspecifications ?? [],
    [product?.productEspecifications],
  );
  const selectedSpecification = specifications.find(
    (specification) => specification.id === selectedSpecificationId,
  );
  const isNotStandardUnitOfMeasurement = product?.unitOfMeasure != ProductUnitOfMeasure.UNIT;

  const selectSpecification = (id?: number) => {
    setSelectedSpecificationId(id);
    const specification = specifications.find((item) => item.id === id);

    if (specification?.isStockControlled && qty > specification.stockQuantity) {
      setQty(Math.max(1, specification.stockQuantity));
    }
  };

  const showSearch = specifications.length > 8;
  const visibleSpecifications = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
    if (!normalizedSearchTerm) return specifications;

    const filteredSpecifications = specifications.filter((specification) =>
      [specification.code, specification.size, specification.color, specification.brand].some(
        (value) => value?.toLocaleLowerCase().includes(normalizedSearchTerm),
      ),
    );

    if (
      selectedSpecification &&
      !filteredSpecifications.some((specification) => specification.id === selectedSpecification.id)
    ) {
      return [selectedSpecification, ...filteredSpecifications];
    }

    return filteredSpecifications;
  }, [searchTerm, selectedSpecification, specifications]);

  const stock = selectedSpecification
    ? selectedSpecification.stockQuantity
    : calculeStockTotalByProductEspecification(specifications);

  const specialPriceForSpec = selectedCustomer?.internCustomerPrices?.find(
    (specialPrice) => specialPrice.productEspecificationId === selectedSpecification?.id,
  );

  const { saleItems, setSaleItems } = useSalesStore();

  const isQuantityAvaliable = () => {
    if (!selectedSpecification || !selectedSpecification.isStockControlled) return true;

    const requested = isNotStandardUnitOfMeasurement ? unitSold * qty : qty;
    const inCart = saleItems
      .filter((item) => item.productEspecificationId === selectedSpecification.id)
      .reduce((total, item) => total + item.quantitySold * item.unitSold, 0);

    return inCart + requested <= selectedSpecification.stockQuantity;
  };

  const handleAddToComanda = () => {
    if (!product) return;
    if (specifications.length === 0) {
      return message.error("Produto sem variações cadastradas");
    }
    if (!selectedSpecification) {
      return message.error("Selecione uma variação");
    }
    if (!isVariationSellable(selectedSpecification)) {
      return message.warning("Variação sem estoque disponível");
    }
    if (isNotStandardUnitOfMeasurement && unitSold <= 0) {
      return message.error("Informe um valor pesado/medido.");
    }
    if (selectedSpecification.isStockControlled && !isQuantityAvaliable()) {
      return message.warning("Estoque selecionado está indisponível para venda!");
    }

    const specificationSelected: CartSaleItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      isEspecialPrice: false,
      note,
      productEspecificationId: selectedSpecification.id,
      productId: product.id,
      quantitySold: qty,
      product,
      productEspecification: selectedSpecification,
      unitSold: isNotStandardUnitOfMeasurement ? unitSold : 1,
      unitOfMeasure: product.unitOfMeasure,
    };
    setSaleItems([...saleItems, specificationSelected]);
    onClose();
  };

  useEffect(() => {
    if (openProductEspecificationModal) {
      setQty(1);
      setUnitSold(0);
      setNote(undefined);
      setSearchTerm("");
      setSelectedSpecificationId(specifications.length === 1 ? specifications[0].id : undefined);
    }
  }, [openProductEspecificationModal, product?.id, specifications]);

  const hasSpecifications = specifications.length > 0;
  const hasAvailableSpecification = specifications.some(isVariationSellable);
  const canAddToComanda =
    !!selectedSpecification && isVariationSellable(selectedSpecification) && hasSpecifications;

  return {
    handleAddToComanda,
    selectedSpecification,
    selectedSpecificationId,
    selectSpecification,
    specifications,
    visibleSpecifications,
    searchTerm,
    setSearchTerm,
    showSearch,
    stock,
    specialPriceForSpec,
    qty,
    setQty,
    unitSold,
    setUnitSold,
    isNotStandardUnitOfMeasurement,
    note,
    setNote,
    canAddToComanda,
    hasSpecifications,
    hasAvailableSpecification,
    isQuantityAvaliable,
  };
}
