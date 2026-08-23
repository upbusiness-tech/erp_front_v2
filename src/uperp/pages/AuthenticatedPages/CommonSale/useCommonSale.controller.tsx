import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { printSaleReceipt } from "@/application-components/SaleReceiptModal/printSaleReceipt";
import { SearchBarOption } from "@/application-components/SearchBar/SearchBar";
import { SaleType } from "@/enums/sale.enum";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { ProductModel } from "@/model/product.model";
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
import { PaginatedResponse } from "@/types/crud.types";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
} from "@/uperp/common/formulas/productFormulas";
import { createSaleReceipt } from "@/uperp/common/formulas/saleReceipt";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";
import { Form, message, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { ICreateSaleForm, IPaymentMethodField, ISaleItemField } from "./types";

const { Text } = Typography;

const productService = new ProductService();
const productCategoryService = new ProductCategoryService();
const saleService = new SaleService();
const cashFlowTransaction = new CashFlowTransactionService();
const productDashboardService = new StatsDashboardService("product-dashboard");

export function useCommonSaleController() {
  const { currentCashFlow } = useCashFlowStore();
  const isCashFlowOpen = Boolean(currentCashFlow && !currentCashFlow.isClosed);

  const [cartOpen, setCartOpen] = useState(false);

  const { hasSettingActive } = useCompanySettingsStore();

  const {
    productsView,
    setProductsView,
    saleItems,
    payments,
    saleStep,
    resetSale,
    selectedCustomer,
    saleDiscount,
  } = useSalesStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const handleCategoryFilterChange = (values: string | string[]) =>
    setCategoryFilter(values as string[]);

  const handleSearchChange = (value: string | string[]) => {
    setSearch(value as string);
  };

  const { data: productCategories } =
    useGetAllWithParams<PaginatedResponse<ProductCategoryModel>>(productCategoryService);

  const productCategoriesOptions: SearchBarOption[] =
    productCategories?.data.map((pc) => {
      return { value: pc.id.toString(), label: pc.name };
    }) ?? [];

  const filter = useMemo(() => {
    return [
      ...(search ? [{ field: "name", operator: "$contL", value: search.trim() }] : []),
      ...(categoryFilter.length > 0
        ? [{ field: "productCategoryId", operator: "$in", value: categoryFilter }]
        : []),
    ];
  }, [categoryFilter, search]);

  const {
    data: products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPage,
  } = useGenericTableFetch<ProductModel>({
    service: productService,
    options: {
      sort: { field: "name", order: "ASC" },
      filter,
    },
  });

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
      ],
    },
  });

  const tableColumns: ColumnsType<ProductModel> = [
    {
      title: "Produto",
      dataIndex: "name",
    },
    {
      title: "Variação (Tam, cor, marca)",
      render: (n: string, p: ProductModel) => (
        <Space direction="vertical" size={0}>
          {p.productEspecifications.map((pe) => (
            <Space size={4}>
              {pe.size && (
                <Tag style={{ margin: 0 }} color="orange">
                  {pe.size}
                </Tag>
              )}
              {pe.color && <Tag style={{ margin: 0 }}>{pe.color}</Tag>}
            </Space>
          ))}
        </Space>
      ),
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
                background: `${p.productCategory?.color || "#F26B1F"}`,
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
          {calculeStockTotalByProductEspecification(v.productEspecifications)} un.
        </Tag>
      ),
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
  const handleOpenProductModal = (p: ProductModel) => {
    setOpenProductModal(true);
    setSelectedProduct(p);
  };
  const handleCloseProductModal = () => {
    setOpenProductModal(false);
    setSelectedProduct(undefined);
  };

  const [saleForm] = Form.useForm<ICreateSaleForm>();

  const [submiting, setsubmiting] = useState(false);
  const [receiptSale, setReceiptSale] = useState<SaleReceiptModel | null>(null);

  const handleCloseReceipt = () => {
    setReceiptSale(null);
    setRecentOpen(true);
  };

  const { invalidateQuery } = useCacheManager();

  const handleSubmitSale = async () => {
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
          internCustomerPriceId: s.internCustomerPriceId,
          discountInfo: s.discountInfo,
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
        type: SaleType.NORMAL,
        items,
        payments: paymentsConverted,
        internCustomerId: selectedCustomer?.id,
        discount: saleDiscount?.value != null ? saleDiscount : undefined,
      };

      const sale = await saleService.create<SaleModel>(data);
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

  return {
    search,
    handleSearchChange,
    productsView: Number(productsView),
    setProductsView,
    products,
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
