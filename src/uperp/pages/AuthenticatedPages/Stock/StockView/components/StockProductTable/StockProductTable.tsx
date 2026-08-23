import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import { useStockProductTableController } from "./useStockProductTable.controller";
import { STOCK_STATUS_OPTIONS, UNIT_OF_MEASURE_OPTIONS } from "./consts";

export const StockProductTable = () => {
  const {
    tableColumns,
    data,
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
  } = useStockProductTableController();

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
      <GenericTable
        columns={tableColumns}
        data={data}
        total={total}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </>
  );
};
