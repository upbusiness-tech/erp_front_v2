import { TransactionOrigin } from "@/enums/cashFlow.enum";
import { PaymentMethod } from "@/enums/payment.enum";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { CashFlowModel } from "@/model/cashFlow.model";
import { CashFlowTransactionStatsModel } from "@/model/cashFlowTransaction.model";
import { CashierPaths } from "@/routes/AuthenticatedRoutes/Cashier/routes";
import { CashFlowService } from "@/services/cashFlow.service";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { PaginatedResponse } from "@/types/crud.types";
import { calculeCashFlowEstimetedAmount } from "@/uperp/common/formulas/cashFlowFormulas";
import { CashFlowCloseStats } from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowView/CloseCashFlowModal/types";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.PIX]: "PIX",
  [PaymentMethod.CREDIT]: "Cartão de Crédito",
  [PaymentMethod.DEBIT]: "Cartão de Débito",
  [PaymentMethod.CASH]: "Dinheiro",
};

const cashFlowService = new CashFlowService();
const cashFlowTransactionStatsService = new CashFlowTransactionService("stats");

export function useCashFlowHistoryDetailController() {
  const { cashFlowId } = useParams<{ cashFlowId: string }>();
  const navigate = useNavigate();

  const { data: cashFlowResponse, isLoading: isLoadingCashFlow } = useGetAllWithParams<
    PaginatedResponse<CashFlowModel>
  >(
    cashFlowService,
    {
      filter: [
        {
          field: "id",
          operator: "$eq",
          value: cashFlowId,
        },
      ],
      join: [
        { field: "openedByUser" },
        { field: "openedByUser.employee" },
        { field: "closedByUser" },
        { field: "closedByUser.employee" },
      ],
    },
    { enabled: !!cashFlowId },
  );

  const cashFlow = cashFlowResponse?.data?.[0];
  const isClosed = !!cashFlow?.isClosed && !!cashFlow?.closedAt;

  const { data: stats } = useGetAllWithParams<PaginatedResponse<CashFlowTransactionStatsModel>>(
    cashFlowTransactionStatsService,
    {
      filter: [
        {
          field: "cashFlowId",
          operator: "$eq",
          value: cashFlowId,
        },
      ],
    },
    { enabled: !!cashFlowId },
  );

  const closeStatsService = new CashFlowTransactionService(`${cashFlowId ?? ""}/close-stats`);

  const { data: closeStats } = useGetAllWithParams<CashFlowCloseStats>(
    closeStatsService,
    undefined,
    { enabled: !!cashFlowId },
  );

  console.info({ closeStats });

  const sangriasData = stats?.data?.find((st) => st.origin === TransactionOrigin.SANGRIA);
  const salesData = stats?.data?.find((st) => st.origin === TransactionOrigin.SALE);
  const replacementData = stats?.data?.find((st) => st.origin === TransactionOrigin.REPLACEMENT);

  const paymentMethods = useMemo(() => Object.values(PaymentMethod), []);

  const expectedAmount = calculeCashFlowEstimetedAmount(
    Number(sangriasData?.amount ?? []),
    Number(replacementData?.amount ?? []),
    Number(salesData?.amount ?? []),
    Number(cashFlow?.initialBalance ?? []),
  );

  const getInformedValue = (method: PaymentMethod) =>
    cashFlow?.informedValues?.find(
      (v) => String(v.method).toUpperCase() === String(method).toUpperCase(),
    )?.value ?? 0;

  const handleBack = () => navigate(-1);

  return {
    cashFlow,
    isClosed,
    isLoadingCashFlow,
    closeStats,
    sangriasData,
    salesData,
    replacementData,
    paymentMethods,
    expectedAmount,
    getInformedValue,
    handleBack,
  };
}
