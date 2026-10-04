import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { SubscriptionStatus } from "@/enums/subscription.enum";
import { PlanModel } from "@/model/plan.model";
import { SubscriptionModel } from "@/model/subscription.model";
import { PlanService } from "@/services/plan.service";
import { SubscriptionService } from "@/services/subscription.service";
import { useAuthStore } from "@/stores/auth.store";
import { Button, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
const planService = new PlanService();
const subscriptionService = new SubscriptionService();

const statusConfig: Record<SubscriptionStatus, { color: string }> = {
  [SubscriptionStatus.PAID]: { color: "green" },
  [SubscriptionStatus.PENDING]: { color: "orange" },
  [SubscriptionStatus.LATE]: { color: "red" },
  [SubscriptionStatus.ANALISYS]: { color: "blue" },
};

export function useSubscriptionViewController() {
  const {
    data: subscriptions,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useGenericTableFetch<SubscriptionModel>({ service: subscriptionService });

  const { data: plans } = useGenericTableFetch<PlanModel>({
    service: planService,
  });

  const { currentCompany } = useAuthStore();

  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionModel | undefined>(
    undefined,
  );

  const openPaymentModal = (subscription: SubscriptionModel) =>
    setSelectedSubscription(subscription);
  const closePaymentModal = () => setSelectedSubscription(undefined);

  const tableColumns: ColumnsType<SubscriptionModel> = [
    {
      title: "Fatura",
      dataIndex: "referenceMonth",
      width: 100,
      render: (_, v: SubscriptionModel) =>
        format(parseISO(v.referenceMonth), "MMMM/yyyy", { locale: ptBR }),
    },
    {
      title: "Vencimento",
      dataIndex: "dueDate",
      render: (v: string) => format(parseISO(v), "dd/MM/yyyy"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: SubscriptionStatus) => <Tag color={statusConfig[s]?.color}>{s}</Tag>,
    },
    {
      title: "Ações",
      width: 120,
      render: (_, r: SubscriptionModel) =>
        r.status !== SubscriptionStatus.PAID && (
          <Button type="primary" size="small" onClick={() => openPaymentModal(r)}>
            Pagar
          </Button>
        ),
    },
  ];

  return {
    plans,
    currentCompany,
    subscriptions,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    tableColumns,
    selectedSubscription,
    closePaymentModal,
    openPaymentModal,
  };
}
