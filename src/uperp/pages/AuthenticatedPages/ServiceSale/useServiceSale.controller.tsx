import { ProductModel } from "@/model/product.model";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
  showStockTotalByProductEspecification,
} from "@/uperp/common/formulas/productFormulas";
import { Space, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useCommonSaleController } from "../CommonSale/useCommonSale.controller";

const { Text } = Typography;

export function useServiceSaleController() {
  const {
    search,
    handleSearchChange,
    products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleOpenProductModal,
    handleCloseProductModal,
    openProductModal,
    selectedProduct,
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
  } = useCommonSaleController();

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
                background: `${p.productCategory?.color || "#F26B1F"}`,
              }}
            />
            <Text strong>{p.productCategory?.name || "-"}</Text>
          </Space>
        ) : (
          <Text>—</Text>
        ),
    },
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

  return {
    search,
    handleSearchChange,
    products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    tableColumns,
    handleOpenProductModal,
    handleCloseProductModal,
    openProductModal,
    selectedProduct,
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
  };
}
