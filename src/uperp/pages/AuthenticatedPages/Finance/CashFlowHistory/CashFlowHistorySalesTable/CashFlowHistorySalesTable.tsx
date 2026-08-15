import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { useCashFlowHistorySalesTableController } from "./useCashFlowHistorySalesTable.controller";
import { SaleReceiptModal } from "@/application-components/SaleReceiptModal/SaleReceiptModal";

type CashFlowHistorySalesTableProps = {
  cashFlowId: number;
};

export const CashFlowHistorySalesTable = ({ cashFlowId }: CashFlowHistorySalesTableProps) => {
  const {
    sales,
    salesTotal,
    salesLoading,
    salesPage,
    salesPageSize,
    salesPageChange,
    salesPageSizeChange,
    salesColumns,
    receiptSale,
    handleViewRecentSale,
    handleCloseReceipt,
  } = useCashFlowHistorySalesTableController({ cashFlowId });

  return (
    <>
      <GenericTable
        rowKey="id"
        size="small"
        columns={salesColumns}
        data={sales}
        total={salesTotal}
        isLoading={salesLoading}
        page={salesPage}
        pageSize={salesPageSize}
        onPageChange={salesPageChange}
        onPageSizeChange={salesPageSizeChange}
        onRowClick={handleViewRecentSale}
        locale={{ emptyText: "Nenhuma venda registrada" }}
      />
      <SaleReceiptModal receiptSale={receiptSale} onClose={handleCloseReceipt} variant={"view"} />
    </>
  );
};
