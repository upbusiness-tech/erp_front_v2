import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { SaleType } from "@/enums/sale.enum";
import { ProductModel } from "@/model/product.model";
import { SaleItemModel, SaleModel, SaleReceiptModel } from "@/model/sale.model";
import { ProductService } from "@/services/product.service";
import { SaleService } from "@/services/sale.service";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { useSalesStore } from "@/stores/sales.store";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
  formatPrice,
} from "@/uperp/common/formulas/productFormulas";
import { SALE_PAYMENT_LABEL, createSaleReceipt } from "@/uperp/common/formulas/saleReceipt";
import { calculateTotalCartItems } from "@/uperp/common/formulas/saleFormulas";
import { Button, Form, message, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Receipt } from "lucide-react";
import { useState } from "react";
import { ICreateSaleForm, IPaymentMethodField, ISaleItemField } from "./types";
import { useCacheManager } from "@/hooks/useCacheManager";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { ProductDashboardService } from "@/services/productDashboard.service";

const { Text } = Typography;

const productService = new ProductService();
const saleService = new SaleService();
const cashFlowTransaction = new CashFlowTransactionService();
const productDashboardService = new ProductDashboardService("product-dashboard");

export function useCommonSaleController() {
  const { currentCashFlow } = useCashFlowStore();
  const isCashFlowOpen = Boolean(currentCashFlow && !currentCashFlow.isClosed);

  const [cartOpen, setCartOpen] = useState(false);

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

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
      filter: search.trim()
        ? [{ field: "name", operator: "$contL", value: search.trim() }]
        : undefined,
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
    { title: "Id", dataIndex: "id", width: 110 },
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
    { title: "Fornecedor", dataIndex: "supplierName", render: (u: string) => u || "—" },
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

  const recentSalesColumns: ColumnsType<SaleModel> = [
    { title: "Código", dataIndex: "code", width: 110 },
    {
      title: "Data",
      dataIndex: "createdAt",
      width: 130,
      render: (v?: string) => (v ? new Date(v).toLocaleString("pt-BR") : "—"),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      width: 100,
      render: (t: SaleType) => {
        const map: Record<SaleType, { label: string; color: string }> = {
          [SaleType.NORMAL]: { label: "Balcão", color: "orange" },
          [SaleType.SERVICE]: { label: "Serviço", color: "blue" },
          [SaleType.PDV]: { label: "PDV", color: "purple" },
        };
        const { label, color } = map[t] || { label: t, color: "default" };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Cliente",
      render: (_, sale: SaleModel) => sale.internCustomer?.name || "—",
    },
    {
      title: "Itens",
      dataIndex: "items",
      width: 70,
      align: "center",
      render: (items: SaleItemModel[]) => items?.length ?? 0,
    },
    {
      title: "Pagamentos",
      render: (_, sale: SaleModel) =>
        sale.payments?.length ? (
          <Space size={4} wrap>
            {sale.payments.map((p) => (
              <Tag key={p.id} style={{ margin: 0 }}>
                {SALE_PAYMENT_LABEL[p.type] || p.type}
              </Tag>
            ))}
          </Space>
        ) : (
          "—"
        ),
    },
    {
      title: "Total",
      width: 110,
      align: "right",
      render: (_, sale: SaleModel) => (
        <strong style={{ color: "#F26B1F" }}>
          {formatPrice(calculateTotalCartItems(sale.items, sale.discount))}
        </strong>
      ),
    },
    {
      title: "Ações",
      width: 90,
      align: "center",
      render: (_, sale: SaleModel) => (
        <Button
          size="small"
          type="link"
          icon={<Receipt size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewRecentSale(sale);
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

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
    productsView,
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
    recentSalesColumns,
    handleViewRecentSale,
    resetSale,
  };
}
