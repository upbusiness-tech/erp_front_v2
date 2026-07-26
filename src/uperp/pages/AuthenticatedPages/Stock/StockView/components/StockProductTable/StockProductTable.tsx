import { GenericTable } from "@/application-components/GenericTable/GenericTable";
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
  } = useStockProductTableController();

  return (
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
  );
};
