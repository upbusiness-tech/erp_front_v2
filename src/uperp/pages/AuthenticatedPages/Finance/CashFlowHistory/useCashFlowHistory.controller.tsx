import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { TransactionOrigin } from "@/enums/cashFlow.enum";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { CashFlowModel } from "@/model/cashFlow.model";
import { CashFlowTransactionStatsModel } from "@/model/cashFlowTransaction.model";
import { CashFlowService } from "@/services/cashFlow.service";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { PaginatedResponse } from "@/types/crud.types";
import { formatDateFromApi } from "@/uperp/common/dates";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";

export const movementColors: Record<TransactionOrigin, string> = {
  [TransactionOrigin.SALE]: "green",
  [TransactionOrigin.SANGRIA]: "red",
  [TransactionOrigin.REPLACEMENT]: "purple",
};

const cashFlowTransactionStatsService = new CashFlowTransactionService("stats");

const cashFlowService = new CashFlowService();
export function useCashFlowHistoryController() {
  const {
    data: cashFlowData,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    page,
    pageSize,
    resetPage,
    pageCount,
    total,
  } = useGenericTableFetch<CashFlowModel>({
    service: cashFlowService,
    options: {
      join: [
        {
          field: "openedByUser",
        },
        {
          field: "openedByUser.employee",
        },
      ],
      sort: {
        field: "createdAt",
        order: "DESC",
      },
    },
  });

  const [cashFlowselected, setCashFlowSelected] = useState<CashFlowModel | undefined>(
    cashFlowData[0] ?? undefined,
  );

  const { data: selectedCashFlowStats, isLoading: isLoadingStats } = useGetAllWithParams<
    PaginatedResponse<CashFlowTransactionStatsModel>
  >(
    cashFlowTransactionStatsService,
    {
      filter: [
        {
          field: "cashFlowId",
          operator: "$eq",
          value: cashFlowselected?.id,
        },
      ],
    },
    {
      enabled: !!cashFlowselected,
    },
  );

  const sangriasData = selectedCashFlowStats?.data?.find(
    (st) => st.origin === TransactionOrigin.SANGRIA,
  );
  const salesData = selectedCashFlowStats?.data?.find((st) => st.origin === TransactionOrigin.SALE);
  const replacementData = selectedCashFlowStats?.data?.find(
    (st) => st.origin === TransactionOrigin.REPLACEMENT,
  );
  const generalTotal = selectedCashFlowStats?.data?.find((st) => st.origin === "Total Geral");

  const tableColumns: ColumnsType<CashFlowModel> = [
    { title: "ID", dataIndex: "code", width: 90 },
    {
      title: "Abertura",
      dataIndex: "createdAt",
      render: (v: string) => formatDateFromApi(v),
    },
    {
      title: "Fechamento",
      dataIndex: "closedAt",
      render: (v: string) => (v ? formatDateFromApi(v) : "-"),
    },
    { title: "Operador", render: (_, v: CashFlowModel) => v.openedByUser.employee.name },
  ];

  return {
    cashFlowData,
    cashFlowselected,
    setCashFlowSelected,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    page,
    pageSize,
    resetPage,
    pageCount,
    total,
    tableColumns,
    sangriasData,
    salesData,
    replacementData,
    generalTotal,
  };
}
