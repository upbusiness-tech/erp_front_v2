import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { printSaleReceipt } from "@/application-components/SaleReceiptModal/printSaleReceipt";
import { SearchBarOption } from "@/application-components/SearchBar/SearchBar";
import { SaleType } from "@/enums/sale.enum";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { ProductExpandedViewModel, ProductModel } from "@/model/product.model";
import { ProductCategoryModel } from "@/model/productCategory.model";
import { SaleModel, SaleReceiptModel } from "@/model/sale.model";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { ProductService } from "@/services/product.service";
import { ProductCategoryService } from "@/services/productCategory.service";
import { SaleService } from "@/services/sale.service";
import { StatsDashboardService } from "@/services/statsDashboard.service";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { useCompanySettingsStore } from "@/stores/companySettings.store";
import { useSalesStore } from "@/stores/sales.store";
import { BRAND } from "@/theme/colors";
import { PaginatedResponse } from "@/types/crud.types";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
  extractStockFormatByUnit,
  formatPrice,
  showStockTotalByProductEspecification,
} from "@/uperp/common/formulas/productFormulas";
import { createSaleReceipt } from "@/uperp/common/formulas/saleReceipt";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";
import { toProductModelFromExpanded } from "@/uperp/common/util/productExpanded";
import { buildExpandedFilter } from "@/uperp/common/util/productExpandedFilters";
import { getVariationLabel, isVariationSellable } from "@/uperp/common/util/productVariation";
import { buildScannedCartItem, isQuantityAvailableForSale } from "@/uperp/common/util/saleCart";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";
import { Form, message, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { ICreateSaleForm, IPaymentMethodField, ISaleItemField } from "./types";

const { Text } = Typography;

const productService = new ProductService();
const productExpandedService = new ProductService("expanded");
const productCategoryService = new ProductCategoryService();
const saleService = new SaleService();
const cashFlowTransaction = new CashFlowTransactionService();
const productDashboardService = new StatsDashboardService("product-dashboard");

export function useCommonSaleController() {
  const { currentCashFlow } = useCashFlowStore();
  const isCashFlowOpen = Boolean(currentCashFlow && !currentCashFlow.isClosed);

  const [cartOpen, setCartOpen] = useState(false);

  const { hasSettingActive } = useCompanySettingsStore();
  const isExpandedMode = hasSettingActive(SettingsRef.Product.ViewProductOnExpandedMode);

  const {
    productsView,
    setProductsView,
    saleItems,
    saleServices,
    payments,
    saleStep,
    resetSale,
    selectedCustomer,
    saleDiscount,
  } = useSalesStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const handleCategoryFilterChange = (values: string | string[]) => {
    setCategoryFilter(values as string[]);
    resetPage();
  };

  const handleSearchChange = (value: string | string[]) => {
    setSearch(value as string);
    resetPage();
  };

  const { data: productCategories } =
    useGetAllWithParams<PaginatedResponse<ProductCategoryModel>>(productCategoryService);

  const productCategoriesOptions: SearchBarOption[] =
    productCategories?.data.map((pc) => {
      return { value: pc.id.toString(), label: pc.name };
    }) ?? [];

  const filter = useMemo(() => {
    if (isExpandedMode) {
      return buildExpandedFilter(categoryFilter, search);
    }

    return [
      ...(search ? [{ field: "name", operator: "$contUL", value: search.trim() }] : []),
      ...(categoryFilter.length > 0
        ? [{ field: "productCategoryId", operator: "$in", value: categoryFilter }]
        : []),
    ];
  }, [categoryFilter, isExpandedMode, search]);

  const {
    data,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  } = useGenericTableFetch<ProductModel | ProductExpandedViewModel>({
    service: isExpandedMode ? productExpandedService : productService,
    options: {
      sort: { field: "createdAt", order: "ASC" },
      filter,
    },
  });

  const products = isExpandedMode ? [] : (data as ProductModel[]);
  const expandedProducts = isExpandedMode ? (data as ProductExpandedViewModel[]) : [];

  const {
    data: recentSales,
    total: recentSalesTotal,
    isLoading: recentSalesLoading,
    page: recentSalesPage,
    pageSize: recentSalesPageSize,
    handlePageChange: handleRecentSalesPageChange,
    handlePageSizeChange: handleRecentSalesPageSizeChange,
  } = useGenericTableFetch<SaleModel>({
    service: saleService,
    options: {
      sort: { field: "createdAt", order: "DESC" },
      filter: currentCashFlow
        ? [{ field: "cashFlowId", operator: "$eq", value: currentCashFlow.id }]
        : undefined,
      join: [
        { field: "items" },
        { field: "items.product" },
        { field: "items.productEspecification" },
        { field: "items.internCustomerPrice" },
        { field: "internCustomer" },
        { field: "payments" },
        { field: "services" },
      ],
    },
  });

  const tableColumns: ColumnsType<ProductModel> = [
    {
      title: "Produto",
      dataIndex: "name",
    },
    {
      title: "Categoria",
      dataIndex: "productCategoryId",
      render: (_, p: ProductModel) =>
        p.productCategory ? (
          <Space>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: p.productCategory?.color || BRAND,
              }}
            />
            <Text strong>{p.productCategory?.name || "-"}</Text>
          </Space>
        ) : (
          <Text>—</Text>
        ),
    },
    { title: "Un.", dataIndex: "unitOfMeasure", width: 70, render: (u: string) => u || "—" },
    {
      title: "Preço",
      dataIndex: "salePrice",
      render: (_, p: ProductModel) => `${calculeSalePriceRange(p.productEspecifications)}`,
    },
    {
      title: "Estoque",
      dataIndex: "stockQuantity",
      render: (_, v: ProductModel) => (
        <Tag
          color={
            calculeStockTotalByProductEspecification(v.productEspecifications) > 5
              ? "green"
              : calculeStockTotalByProductEspecification(v.productEspecifications) > 0
                ? "orange"
                : "red"
          }
        >
          {showStockTotalByProductEspecification(v, v.productEspecifications)}
        </Tag>
      ),
    },
  ];

  const expandedTableColumns: ColumnsType<ProductExpandedViewModel> = [
    {
      title: "Código",
      dataIndex: "code",
      render: (_, row) => row.code || `#${row.productEspecificationId}`,
    },
    {
      title: "Produto",
      dataIndex: "productName",
    },
    {
      title: "Categoria",
      dataIndex: "productCategoryId",
      render: (_, row) => (
        <Space>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: row.productCategoryColor || BRAND,
            }}
          />
          <Text strong>{row.productCategoryName || "-"}</Text>
        </Space>
      ),
    },
    { title: "Un.", dataIndex: "unitOfMeasure", width: 70, render: (u: string) => u || "—" },
    {
      title: "Preço",
      dataIndex: "salePrice",
      render: (_, row) => formatPrice(row.salePrice),
    },
    {
      title: "Estoque",
      dataIndex: "stockQuantity",
      render: (_, row) => {
        const value = row.stockQuantity;
        return (
          <Tag color={value > 5 ? "green" : value > 0 ? "orange" : "red"}>
            {extractStockFormatByUnit(row.unitOfMeasure, value)}
          </Tag>
        );
      },
    },
  ];

  const [recentOpen, setRecentOpen] = useState(false);
  const [receiptVariant, setReceiptVariant] = useState<"success" | "view">("success");

  const handleViewRecentSale = (sale: SaleModel) => {
    setRecentOpen(false);
    setReceiptVariant("view");
    setReceiptSale(createSaleReceipt(sale));
  };

  const [openProductModal, setOpenProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | undefined>(undefined);
  const [initialSpecificationId, setInitialSpecificationId] = useState<number | undefined>();
  const handleOpenProductModal = (p: ProductModel | ProductExpandedViewModel) => {
    if (isExpandedMode) {
      const expanded = p as ProductExpandedViewModel;
      setSelectedProduct(toProductModelFromExpanded(expanded));
      setInitialSpecificationId(expanded.productEspecificationId);
    } else {
      setInitialSpecificationId(undefined);
      setSelectedProduct(p as ProductModel);
    }
    setOpenProductModal(true);
  };
  const handleCloseProductModal = () => {
    setInitialSpecificationId(undefined);
    setOpenProductModal(false);
    setSelectedProduct(undefined);
  };

  const [saleForm] = Form.useForm<ICreateSaleForm>();

  const [submiting, setsubmiting] = useState(false);
  const [receiptSale, setReceiptSale] = useState<SaleReceiptModel | null>(null);

  const handleCloseReceipt = () => {
    setReceiptSale(null);
  };

  const handleBarcodeScan = async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    try {
      const response = await productService.getAll<PaginatedResponse<ProductModel>>({
        page: 1,
        limit: 2,
        filter: [
          {
            field: "productEspecifications.barcode",
            operator: "$eq",
            value: code,
          },
        ],
      });

      const matches = (response?.data ?? []).flatMap((product) =>
        (product.productEspecifications ?? [])
          .filter((specification) => specification.barcode === code)
          .map((specification) => ({ product, specification })),
      );

      if (matches.length === 0) {
        message.warning("Produto não encontrado para o código de barras lido.");
        return;
      }

      if (matches.length > 1) {
        message.warning("Código de barras duplicado. Ajuste o cadastro antes de vender.");
        return;
      }

      const { product, specification } = matches[0];

      if (!isVariationSellable(specification)) {
        message.warning("Variação sem estoque disponível.");
        return;
      }

      if (product.unitOfMeasure !== ProductUnitOfMeasure.UNIT) {
        setSelectedProduct(product);
        setInitialSpecificationId(specification.id);
        setOpenProductModal(true);
        return;
      }

      const currentSaleItems = useSalesStore.getState().saleItems;
      if (!isQuantityAvailableForSale(specification, currentSaleItems, 1)) {
        message.warning("Estoque insuficiente para adicionar este produto.");
        return;
      }

      const scannedItem = buildScannedCartItem(product, specification);
      useSalesStore.getState().setSaleItems([...currentSaleItems, scannedItem]);
      message.success(
        `${product.name} — ${getVariationLabel(specification)} adicionado à comanda.`,
      );
    } catch {
      message.error("Não foi possível buscar o produto pelo código de barras.");
    }
  };

  const { invalidateQuery } = useCacheManager();

  const handleSubmitSale = async (type: SaleType) => {
    try {
      setsubmiting(true);
      if (!currentCashFlow || currentCashFlow.isClosed) {
        message.warning("Não foi possível encontrar um caixa aberto.");
        return;
      }

      const items: ISaleItemField[] = saleItems.map((s) => {
        return {
          isEspecialPrice: s.isEspecialPrice,
          note: s.note,
          productEspecificationId: s.productEspecificationId,
          productId: s.productId,
          quantitySold: s.quantitySold,
          unitSold: s.unitSold,
          internCustomerPriceId: s.internCustomerPriceId,
          discountInfo: s.discountInfo,
          unitOfMeasure: s.unitOfMeasure,
        };
      });

      const paymentsConverted: IPaymentMethodField[] = payments.map((p) => {
        return {
          amount: p.amount,
          type: p.type,
        };
      });

      const data: ICreateSaleForm = {
        cashFlowId: currentCashFlow.id,
        type,
        items,
        payments: paymentsConverted,
        internCustomerId: selectedCustomer?.id,
        discount: saleDiscount?.value != null ? saleDiscount : undefined,
      };

      if (type === SaleType.SERVICE) {
        data.services = saleServices;
      }

      const sale = await saleService.create<SaleModel>(data);

      // O POST nem sempre devolve os serviços aninhados na resposta. Reanexa os
      // serviços enviados para o comprovante exibi-los junto com os itens e
      // para o modal/PDF mostrarem a lista de serviços corretamente.
      if (
        type === SaleType.SERVICE &&
        saleServices.length > 0 &&
        (!sale.services || sale.services.length === 0)
      ) {
        sale.services = saleServices.map((service, index) => ({
          id: -(index + 1),
          description: service.description,
          onwerEmployee: service.onwerEmployee,
          amount: service.amount,
          discount: { value: 0 },
          saleId: sale.id,
        }));
      }

      invalidateQueries();
      setReceiptVariant("success");
      setReceiptSale(createSaleReceipt(sale));
      resetSale();
      setCartOpen(false);

      if (hasSettingActive(SettingsRef.Sale.GenerateSaleProofDocument)) {
        await printSaleReceipt(createSaleReceipt(sale));
      }
      message.success("Venda realizada com sucesso!");
    } catch (error) {
      message.error("Ocorreu um erro ao realizar a venda");
    } finally {
      setsubmiting(false);
    }
  };

  const invalidateQueries = () => {
    invalidateQuery(productService);
    invalidateQuery(saleService);
    invalidateQuery(cashFlowTransaction);
    invalidateQuery(productDashboardService);
  };

  useBarcodeScanner({
    enabled: hasSettingActive(SettingsRef.Product.ScanProductByCode),
    onScan: handleBarcodeScan,
    ignoreWhen: () =>
      openProductModal || cartOpen || recentOpen || Boolean(receiptSale) || submiting,
  });

  return {
    search,
    handleSearchChange,
    productsView: Number(productsView),
    setProductsView,
    products,
    isExpandedMode,
    expandedProducts,
    expandedTableColumns,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
    tableColumns,
    handleOpenProductModal,
    handleCloseProductModal,
    openProductModal,
    selectedProduct,
    initialSpecificationId,
    isCashFlowOpen,
    saleForm,
    saleItems,
    saleStep,
    cartOpen,
    setCartOpen,
    handleSubmitSale,
    submiting,
    receiptSale,
    handleCloseReceipt,
    receiptVariant,
    recentOpen,
    setRecentOpen,
    recentSales,
    recentSalesTotal,
    recentSalesLoading,
    recentSalesPage,
    recentSalesPageSize,
    handleRecentSalesPageChange,
    handleRecentSalesPageSizeChange,
    handleViewRecentSale,
    resetSale,
    categoryFilter,
    handleCategoryFilterChange,
    productCategoriesOptions,
  };
}
