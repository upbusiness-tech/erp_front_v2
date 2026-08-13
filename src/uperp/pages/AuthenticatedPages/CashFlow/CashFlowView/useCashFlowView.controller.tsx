import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { TransactionOrigin } from "@/enums/cashFlow.enum";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import {
  CashFlowTransactionModel,
  CashFlowTransactionStatsModel,
} from "@/model/cashFlowTransaction.model";
import { CashierPaths } from "@/routes/AuthenticatedRoutes/Cashier/routes";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { PaginatedResponse } from "@/types/crud.types";
import { formatDateFromApi } from "@/uperp/common/dates";
import { Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const cashFlowTransaction = new CashFlowTransactionService();
const cashFlowTransactionStatsService = new CashFlowTransactionService("stats");
export function useCashFlowViewController() {
  const { currentCashFlow } = useCashFlowStore();

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
          value: currentCashFlow?.id,
        },
      ],
      sort: { field: "createdAt", order: "DESC" },
    },
  });

  const { data: stats } = useGetAllWithParams<PaginatedResponse<CashFlowTransactionStatsModel>>(
    cashFlowTransactionStatsService,
    {
      filter: [
        {
          field: "cashFlowId",
          operator: "$eq",
          value: currentCashFlow?.id,
        },
      ],
    },
    {
      enabled: !!currentCashFlow,
    },
  );

  const sangriasData = stats?.data?.find((st) => st.origin === TransactionOrigin.SANGRIA);
  const salesData = stats?.data?.find((st) => st.origin === TransactionOrigin.SALE);
  const replacementData = stats?.data?.find((st) => st.origin === TransactionOrigin.REPLACEMENT);
  const generalTotal = stats?.data?.find((st) => st.origin === "Total Geral");

  const navigate = useNavigate();

  const [openCloseCashFlowModal, setOpenCloseCashFlowModal] = useState(false);

  const handleCloseCashModal = () => setOpenCloseCashFlowModal(true);

  const [openTransactionModal, setOpenTransactionModal] = useState(false);
  const [currentModalTransaction, setCurrentModalTransaction] = useState<
    TransactionOrigin | undefined
  >(undefined);
  const handleOpenModal = (transaction: TransactionOrigin) => {
    setOpenTransactionModal(true);
    setCurrentModalTransaction(transaction);
  };

  const handleCloseModal = () => {
    setOpenTransactionModal(false);
    setCurrentModalTransaction(undefined);
  };

  const cashFlowTransactionsTableColumns: ColumnsType<CashFlowTransactionModel> = [
    {
      title: "Horário",
      dataIndex: "createdAt",
      width: 160,
      render: (v: string) => formatDateFromApi(v),
    },
    {
      title: "Tipo",
      dataIndex: "origin",
      width: 140,
      render: (t: string) => {
        const colors: Record<string, string> = {
          Venda: "green",
          Sangria: "red",
          Reposição: "purple",
        };
        return <Tag color={colors[t]}>{t}</Tag>;
      },
    },
    { title: "Observação", dataIndex: "note", render: (v?: string) => v || "-" },
    {
      title: "Valor",
      dataIndex: "amount",
      width: 140,
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

  useEffect(() => {
    if (!currentCashFlow) navigate(CashierPaths.OPEN);
  }, [currentCashFlow, navigate]);

  return {
    currentCashFlow,
    handleOpenModal,
    handleCloseModal,
    openTransactionModal,
    currentModalTransaction,
    transactions,
    sangriasData,
    replacementData,
    salesData,
    cashFlowTransactionsTableColumns,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleCloseCashModal,
    openCloseCashFlowModal,
    setOpenCloseCashFlowModal,
    generalTotal,
  };
}
