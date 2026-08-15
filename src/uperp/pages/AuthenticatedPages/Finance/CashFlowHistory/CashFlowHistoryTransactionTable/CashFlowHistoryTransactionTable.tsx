import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { useCashFlowHistoryTransactionTableController } from "./useCashFlowHistoryTransactionTable.controller";

type CashFlowHistoryTransactionTableProps = {
  cashFlowId: number;
};

export const CashFlowHistoryTransactionTable = ({
  cashFlowId,
}: CashFlowHistoryTransactionTableProps) => {
  const {
    transactions,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    cashFlowTransactionsTableColumns,
  } = useCashFlowHistoryTransactionTableController({ cashFlowId });

  return (
    <GenericTable
      size="small"
      columns={cashFlowTransactionsTableColumns}
      data={transactions}
      total={total}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
};
