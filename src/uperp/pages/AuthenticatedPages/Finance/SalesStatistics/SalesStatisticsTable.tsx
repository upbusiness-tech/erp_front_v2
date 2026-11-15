import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { RecentSaleCardList } from "@/application-components/RecentSalesModal/RecentSaleCardList";
import { SaleReceiptModal } from "@/application-components/SaleReceiptModal/SaleReceiptModal";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import { PaymentMethod } from "@/enums/payment.enum";
import type { SaleModel, SaleReceiptModel } from "@/model/sale.model";
import { createSaleReceipt, SALE_PAYMENT_LABEL } from "@/uperp/common/formulas/saleReceipt";
import { SALE_STATUS_OPTIONS_ARRAY_FORMATED } from "@/uperp/common/util/sale.util";
import { Card, Grid } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useSalesTable } from "./useSalesTable";

const { useBreakpoint } = Grid;

const PAYMENT_METHOD_OPTIONS = Object.values(PaymentMethod).map((m) => ({
  value: m,
  label: SALE_PAYMENT_LABEL[m],
}));

interface SalesStatisticsTableProps {
  from: string;
  to: string;
  salesColumns: ColumnsType<SaleModel>;
}

export function SalesStatisticsTable({ from, to, salesColumns }: SalesStatisticsTableProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const [receiptSale, setReceiptSale] = useState<SaleReceiptModel | null>(null);
  const handleViewSale = (sale: SaleModel) => setReceiptSale(createSaleReceipt(sale));

  const {
    data: salesData,
    total: salesTotal,
    isLoading: salesLoading,
    page: salesPage,
    pageSize: salesPageSize,
    handlePageChange: salesPageChange,
    handlePageSizeChange: salesPageSizeChange,
    code,
    handleCodeChange,
    customerName,
    handleCustomerNameChange,
    status,
    handleStatusChange,
    paymentMethod,
    handlePaymentMethodChange,
  } = useSalesTable(from, to);

  return (
    <Card title="Vendas do período">
      <SearchBar
        searches={[
          {
            name: "code",
            value: code,
            onChange: handleCodeChange,
            placeholder: "Buscar por código",
            maxWidth: 200,
          },
          {
            name: "customerName",
            value: customerName,
            onChange: handleCustomerNameChange,
            placeholder: "Buscar por cliente",
            maxWidth: 300,
          },
          {
            name: "status",
            type: "select",
            value: status,
            onChange: handleStatusChange,
            placeholder: "Status",
            options: SALE_STATUS_OPTIONS_ARRAY_FORMATED,
            maxWidth: 200,
          },
          {
            name: "paymentMethod",
            type: "select",
            value: paymentMethod,
            onChange: handlePaymentMethodChange,
            placeholder: "Forma de pagamento",
            options: PAYMENT_METHOD_OPTIONS,
            maxWidth: 250,
          },
        ]}
      />

      {isMobile ? (
        <RecentSaleCardList
          data={salesData}
          total={salesTotal}
          page={salesPage}
          pageSize={salesPageSize}
          onPageChange={salesPageChange}
          onPageSizeChange={salesPageSizeChange}
          isLoading={salesLoading}
          onRowClick={handleViewSale}
          onView={handleViewSale}
          showItemCount
          showPayments
          pageSizeOptions={["8", "12", "16", "20"]}
        />
      ) : (
        <GenericTable
          rowKey="id"
          columns={salesColumns}
          data={salesData}
          total={salesTotal}
          isLoading={salesLoading}
          page={salesPage}
          pageSize={salesPageSize}
          onPageChange={salesPageChange}
          onPageSizeChange={salesPageSizeChange}
          onRowClick={handleViewSale}
          locale={{ emptyText: "Nenhuma venda registrada" }}
        />
      )}

      <SaleReceiptModal
        receiptSale={receiptSale}
        onClose={() => setReceiptSale(null)}
        variant="view"
      />
    </Card>
  );
}
