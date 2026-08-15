import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { TransactionOrigin } from "@/enums/cashFlow.enum";
import { CashFlowTransactionModel } from "@/model/cashFlowTransaction.model";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { formatDateFromApi } from "@/uperp/common/dates";
import { Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";

const { Text } = Typography;

const cashFlowTransaction = new CashFlowTransactionService();
export function useCashFlowHistoryTransactionTableController({
  cashFlowId,
}: {
  cashFlowId: number;
}) {
  const {
    data: transactions,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useGenericTableFetch<CashFlowTransactionModel>({
    service: cashFlowTransaction,
    options: {
      filter: [
        {
          field: "cashFlowId",
          operator: "$eq",
          value: cashFlowId,
        },
      ],
      sort: { field: "createdAt", order: "DESC" },
    },
  });

  const cashFlowTransactionsTableColumns: ColumnsType<CashFlowTransactionModel> = [
    {
      title: "Horário",
      dataIndex: "createdAt",
      width: 50,
      render: (v: string) => formatDateFromApi(v),
    },
    {
      title: "Tipo",
      dataIndex: "origin",
      width: 50,
      render: (t: string) => {
        const colors: Record<string, string> = {
          Venda: "green",
          Sangria: "red",
          Reposição: "purple",
        };
        return <Tag color={colors[t]}>{t}</Tag>;
      },
    },
    { title: "Observação", dataIndex: "note", width: 50, render: (v?: string) => v || "-" },
    {
      title: "Valor",
      dataIndex: "amount",
      width: 50,
      align: "right",
      render: (v: number, r) => (
        <Text
          strong
          style={{
            color: r.origin === TransactionOrigin.SANGRIA ? "#DC2626" : "#16A34A",
          }}
        >
          {r.origin === TransactionOrigin.SANGRIA ? "-" : "+"} R$ {Number(v).toFixed(2)}
        </Text>
      ),
    },
  ];

  return {
    transactions,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    cashFlowTransactionsTableColumns,
  };
}
