import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { SaleType } from "@/enums/sale.enum";
import { ProductModel } from "@/model/product.model";
import { ProductService } from "@/services/product.service";
import { SaleService } from "@/services/sale.service";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { useSalesStore } from "@/stores/sales.store";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
} from "@/uperp/common/productFormulas";
import { Form, message, Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { ICreateSaleForm, IPaymentMethodField, ISaleItemField } from "./types";

const { Text } = Typography;

const productService = new ProductService();
const saleService = new SaleService();

export function useCommonSaleController() {
  const { currentCashFlow } = useCashFlowStore();
  const isCashFlowOpen = !currentCashFlow?.isClosed;

  const [cartOpen, setCartOpen] = useState(false);

  const { productsView, setProductsView, saleItems, payments, saleStep } = useSalesStore();

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
      render: (_, p: ProductModel) => (
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
  const handleSubmitSale = async () => {
    try {
      setsubmiting(true);
      if (currentCashFlow) {
        const items: ISaleItemField[] = saleItems.map((s) => {
          return {
            isEspecialPrice: s.isEspecialPrice,
            note: s.note,
            productEspecificationId: s.productEspecificationId,
            productId: s.productId,
            quantitySold: s.quantitySold,
            internCustomerPriceId: s.internCustomerPriceId,
          };
        });

        const paymentsConverted: IPaymentMethodField[] = payments.map((p) => {
          return {
            amount: p.amount,
            type: p.type,
          };
        });

        const data: ICreateSaleForm = {
          cashFlowId: currentCashFlow?.id,
          type: SaleType.NORMAL,
          items,
          payments: paymentsConverted,
        };

        await saleService.create(data);
      } else {
        message.warning("Não foi possível encontrar um caixa aberto.");
      }
      message.success("Venda realizada com sucesso!");
    } catch (error) {
      message.error("Ocorreu um erro ao realizar a venda");
    } finally {
      setsubmiting(false);
    }
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
  };
}
