import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";
import { useSalesStatistics } from "@/hooks/useSalesStatistics";
import { PaymentMethod } from "@/enums/payment.enum";
import { BRAND } from "@/theme/colors";
import { formatDateFromApi } from "@/uperp/common/dates";
import { fmtBrl } from "@/uperp/common/util/sale.util";
import { calculateTotalCartItems } from "@/uperp/common/formulas/saleFormulas";
import { SALE_PAYMENT_LABEL } from "@/uperp/common/formulas/saleReceipt";
import { getSaleCustomerLabel } from "@/uperp/common/util/isolatedCustomer";
import { message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SaleModel } from "@/model/sale.model";
import { useEffect } from "react";

export function useSalesStatisticsController() {
  const { period, handlePeriodChange } = useDashboardPeriod();

  const {
    data: statsData,
    isLoading: statsLoading,
    isFetching: statsFetching,
    isError: statsError,
  } = useSalesStatistics({ from: period.from, to: period.to });

  useEffect(() => {
    if (statsError) {
      message.error("Erro ao carregar estatísticas de vendas");
    }
  }, [statsError]);

  const summary = statsData?.summary;
  const timeline = statsData?.timeline ?? [];
  const paymentBreakdown = statsData?.paymentBreakdown ?? [];
  const weekdayRevenue = statsData?.weekdayRevenue ?? [];

  const salesColumns: ColumnsType<SaleModel> = [
    { title: "Código", dataIndex: "code" },
    {
      title: "Data",
      dataIndex: "createdAt",
      render: (v?: string) => (v ? formatDateFromApi(v) : "—"),
    },
    {
      title: "Cliente",
      render: (_, sale: SaleModel) => getSaleCustomerLabel(sale),
    },
    {
      title: "Itens",
      dataIndex: "items",
      align: "center",
      render: (items: SaleModel["items"]) => items?.length ?? 0,
    },
    {
      title: "Pagamento",
      render: (_, sale: SaleModel) =>
        sale.payments?.length
          ? sale.payments
              .map((p) => SALE_PAYMENT_LABEL[p.type as PaymentMethod] || p.type)
              .join(", ")
          : "—",
    },
    {
      title: "Total",
      align: "right",
      render: (_, sale: SaleModel) => (
        <strong style={{ color: BRAND }}>
          {fmtBrl.format(calculateTotalCartItems(sale.items, sale.services ?? [], sale.discount))}
        </strong>
      ),
    },
  ];

  return {
    period,
    handlePeriodChange,
    statsLoading,
    statsFetching,
    summary,
    timeline,
    paymentBreakdown,
    weekdayRevenue,
    salesColumns,
  };
}
