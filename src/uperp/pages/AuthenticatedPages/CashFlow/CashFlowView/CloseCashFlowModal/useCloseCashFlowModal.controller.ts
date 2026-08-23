/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentMethod } from "@/enums/payment.enum";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { CashierPaths } from "@/routes/AuthenticatedRoutes/Cashier/routes";
import { CashFlowService } from "@/services/cashFlow.service";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { Form, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CashFlowCloseStats, ICloseCashFlowForm, InformedValue } from "./types";

const cashFlowServiceInvalidateQuery = new CashFlowService();

export function useCloseCashFlowModalController({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: VoidFunction;
}) {
  const { currentCashFlow } = useCashFlowStore();
  const cashFlowTransactionService = new CashFlowTransactionService(
    `${currentCashFlow?.id}/close-stats`,
  );

  const { data: closeCashFlowStatsToCompare } = useGetAllWithParams<CashFlowCloseStats>(
    cashFlowTransactionService,
  );

  const [form] = Form.useForm<ICloseCashFlowForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { invalidateQuery } = useCacheManager();
  const { handleCloseCashFlow } = useCashFlowStore();
  const navigate = useNavigate();

  const paymentMethods = useMemo(() => Object.values(PaymentMethod), []);

  const informedValues = Form.useWatch("informedValues", form);

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        informedValues: paymentMethods.map((method) => ({
          method,
          value: 0,
        })),
      });
    }
  }, [isOpen, form, paymentMethods]);

  // Saldo estimado pelo SISTEMA: soma de tudo que o sistema calculou
  const estimatedBalance = useMemo(() => {
    if (!closeCashFlowStatsToCompare) return 0;

    return paymentMethods.reduce(
      (acc, method) => acc + (closeCashFlowStatsToCompare[method] ?? 0),
      0,
    );
  }, [closeCashFlowStatsToCompare, paymentMethods]);

  // Saldo estimado pelo USUÁRIO: soma do que ele digitou nos inputs
  const userEstimatedBalance = useMemo(() => {
    return (informedValues ?? []).reduce(
      (acc: number, item: InformedValue) => acc + (item?.value ?? 0),
      0,
    );
  }, [informedValues]);

  const totalDifference = useMemo(
    () => estimatedBalance - userEstimatedBalance,
    [estimatedBalance, userEstimatedBalance],
  );

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      const result = await handleCloseCashFlow({
        ...values,
        closingBalance: userEstimatedBalance,
      });
      if (result) {
        invalidateQuery(cashFlowServiceInvalidateQuery);
        navigate(CashierPaths.OPEN);
        onClose();
        form.resetFields();
      } else {
        message.error("Erro ao encerrar o caixa.");
      }
    } catch (error: any) {
      return error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    closeCashFlowStatsToCompare,
    handleSubmit,
    isSubmitting,
    form,
    paymentMethods,
    informedValues,
    estimatedBalance,
    userEstimatedBalance,
    totalDifference,
  };
}
