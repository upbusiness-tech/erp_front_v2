import { useGenericTableFetch } from "@/application-components/GenericTable/useGenericTableFetch";
import { InvoiceStatus } from "@/enums/invoice.enum";
import { InvoiceModel } from "@/model/invoice.model";
import { PlanModel } from "@/model/plan.model";
import { InvoiceService } from "@/services/invoice.service";
import { PlanService } from "@/services/plan.service";
import { useAuthStore } from "@/stores/auth.store";
import { Button, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
const planService = new PlanService();
const invoiceService = new InvoiceService();

const statusConfig: Record<InvoiceStatus, { color: string }> = {
  [InvoiceStatus.PAID]: { color: "green" },
  [InvoiceStatus.PENDING]: { color: "orange" },
  [InvoiceStatus.LATE]: { color: "red" },
  [InvoiceStatus.ANALISYS]: { color: "blue" },
};

export function useInvoiceViewController() {
  const {
    data: invoices,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useGenericTableFetch<InvoiceModel>({ service: invoiceService });

  const { data: plans } = useGenericTableFetch<PlanModel>({
    service: planService,
  });

  const { currentCompany } = useAuthStore();

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceModel | undefined>(undefined);

  const openPaymentProofModal = (invoice: InvoiceModel) => setSelectedInvoice(invoice);
  const closePaymentProofModal = () => setSelectedInvoice(undefined);

  const tableColumns: ColumnsType<InvoiceModel> = [
    {
      title: "Fatura",
      dataIndex: "id",
      width: 100,
      render: (_, v: InvoiceModel) => format(parseISO(v.dueDate), "MMMM/yyyy", { locale: ptBR }),
    },
    {
      title: "Vencimento",
      dataIndex: "dueDate",
      render: (v: string) => format(parseISO(v), "dd/MM/yyyy"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: InvoiceStatus) => <Tag color={statusConfig[s]?.color}>{s}</Tag>,
    },
    {
      title: "Ações",
      width: 120,
      render: (_, r: InvoiceModel) =>
        r.status !== InvoiceStatus.PAID && (
          <Button type="primary" size="small" onClick={() => openPaymentProofModal(r)}>
            Pagar
          </Button>
        ),
    },
  ];

  return {
    plans,
    currentCompany,
    invoices,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    tableColumns,
    selectedInvoice,
    closePaymentProofModal,
  };
}
