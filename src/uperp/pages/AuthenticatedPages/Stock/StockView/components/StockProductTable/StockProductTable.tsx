import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { ExpandedProductCardList } from "@/application-components/ExpandedProductCardList/ExpandedProductCardList";
import { ProductCardList } from "@/application-components/ProductCardList/ProductCardList";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import type { ProductExpandedViewModel, ProductModel } from "@/model/product.model";
import { ProductService } from "@/services/product.service";
import { Grid, message } from "antd";
import { useState } from "react";
import { ProductStatsModal } from "../ProductStatsModal/ProductStatsModal";
import { useStockProductTableController } from "./useStockProductTable.controller";
import { STOCK_STATUS_OPTIONS, UNIT_OF_MEASURE_OPTIONS } from "./consts";

const { useBreakpoint } = Grid;
const productService = new ProductService();

export const StockProductTable = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const handleRowClick = (record: ProductModel) => {
    setSelectedProduct(record);
    setIsStatsModalOpen(true);
  };

  const handleExpandedRowClick = async (record: ProductExpandedViewModel) => {
    try {
      const parent = await productService.getById<ProductModel>(record.productId);
      setSelectedProduct(parent);
      setIsStatsModalOpen(true);
    } catch {
      message.error("Não foi possível carregar o produto.");
    }
  };

  const handleCloseStatsModal = () => {
    setIsStatsModalOpen(false);
    setSelectedProduct(null);
  };

  const {
    tableColumns,
    expandedTableColumns,
    isExpandedMode,
    products,
    expandedProducts,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    search,
    handleSearchChange,
    categoryFilter,
    handleCategoryFilterChange,
    supplierFilter,
    handleSupplierFilterChange,
    unitFilter,
    handleUnitFilterChange,
    stockStatusFilter,
    handleStockStatusFilterChange,
    categoryOptions,
    supplierOptions,
  } = useStockProductTableController({
    onViewStats: handleRowClick,
  });

  return (
    <>
      <SearchBar
        searches={[
          {
            name: "name",
            value: search,
            onChange: handleSearchChange,
            placeholder: "Buscar por nome",
          },
          {
            name: "category",
            type: "select",
            value: categoryFilter,
            onChange: handleCategoryFilterChange,
            placeholder: "Categoria",
            options: categoryOptions,
            maxWidth: 200,
          },
          {
            name: "supplier",
            type: "select",
            value: supplierFilter,
            onChange: handleSupplierFilterChange,
            placeholder: "Fornecedor",
            options: supplierOptions,
            maxWidth: 220,
          },
          {
            name: "unit",
            type: "select",
            value: unitFilter,
            onChange: handleUnitFilterChange,
            placeholder: "Unidade de medida",
            options: UNIT_OF_MEASURE_OPTIONS,
            maxWidth: 180,
          },
          {
            name: "stockStatus",
            type: "select",
            value: stockStatusFilter,
            onChange: handleStockStatusFilterChange,
            placeholder: "Status de estoque",
            options: STOCK_STATUS_OPTIONS,
            maxWidth: 200,
          },
        ]}
      />
      {isMobile ? (
        isExpandedMode ? (
          <ExpandedProductCardList
            products={expandedProducts}
            total={total}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onClickProduct={handleExpandedRowClick}
          />
        ) : (
          <ProductCardList
            products={products}
            total={total}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onClickProduct={handleRowClick}
          />
        )
      ) : isExpandedMode ? (
        <GenericTable<ProductExpandedViewModel>
          rowKey="productEspecificationId"
          columns={expandedTableColumns}
          data={expandedProducts}
          total={total}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowClick={handleExpandedRowClick}
        />
      ) : (
        <GenericTable
          columns={tableColumns}
          data={products}
          total={total}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowClick={handleRowClick}
        />
      )}
      <ProductStatsModal
        product={selectedProduct}
        open={isStatsModalOpen}
        onClose={handleCloseStatsModal}
      />
    </>
  );
};
