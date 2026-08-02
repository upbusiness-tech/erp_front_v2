import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import { useStockProductTableController } from "./useStockProductTable.controller";

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
