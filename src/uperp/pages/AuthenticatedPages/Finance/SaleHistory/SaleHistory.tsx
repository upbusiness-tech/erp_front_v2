import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { RecentSaleCardList } from "@/application-components/RecentSalesModal/RecentSaleCardList";
import { SaleReceiptModal } from "@/application-components/SaleReceiptModal/SaleReceiptModal";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import { PaymentMethod } from "@/enums/payment.enum";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { Button, Card, Col, Grid, Row, Space, Statistic, Tag, Typography } from "antd";
import { Download } from "lucide-react";
import { PAYMENT_LABEL } from "../../../../common/consts";
import {
  SALE_PAYMENT_METHOD_OPTIONS,
  SALE_TYPE_OPTIONS,
  useSaleHistoryController,
} from "./useSaleHistory.controller";

const { useBreakpoint } = Grid;
const { Text } = Typography;

export const SaleHistory = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const {
    sales,
    salesTotal,
    salesLoading,
    salesPage,
    salesPageSize,
    salesPageChange,
    salesPageSizeChange,
    salesColumns,
    handleSearchChange,
    search,
    searchCustomerName,
    handleSearchCustomerNameChange,
    typeFilter,
    handleTypeFilterChange,
    methodFilter,
    handleMethodFilterChange,
    handleCloseReceipt,
    handleViewRecentSale,
    receiptSale,
    loadingSaleDashboard,
    saleDashboardData,
  } = useSaleHistoryController();

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card loading={loadingSaleDashboard}>
            <Statistic title="Vendas filtradas" value={saleDashboardData?.summary.filteredSales} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card loading={loadingSaleDashboard}>
            <Statistic
              title="Total filtrado"
              value={saleDashboardData?.summary.total}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#F26B1F" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card loading={loadingSaleDashboard}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Recebido por forma de pagamento
            </Text>
            <Space wrap style={{ marginTop: 8 }}>
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
                <Tag key={m} color="orange" style={{ padding: "4px 8px" }}>
                  {PAYMENT_LABEL[m]}:{" "}
                  <strong>
                    R${" "}
                    {formatPrice(
                      saleDashboardData?.paymentBreakdown.find((p) => p.type === m)?.amount ?? 0,
                    )}
                  </strong>
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title="Histórico de Vendas Detalhado"
        extra={<Button icon={<Download size={14} />}>Exportar</Button>}
      >
        <SearchBar
          searches={[
            {
              name: "code",
              value: search,
              onChange: handleSearchChange,
              placeholder: "Buscar por código",
              maxWidth: 200,
            },
            {
              name: "internCustomer",
              value: searchCustomerName,
              onChange: handleSearchCustomerNameChange,
              placeholder: "Buscar por cliente",
              maxWidth: 300,
            },
            {
              name: "type",
              type: "select",
              value: typeFilter,
              onChange: handleTypeFilterChange,
              placeholder: "Tipo de venda",
              options: SALE_TYPE_OPTIONS,
              maxWidth: 200,
            },
            {
              name: "method",
              type: "select",
              value: methodFilter,
              onChange: handleMethodFilterChange,
              placeholder: "Forma de pagamento",
              options: SALE_PAYMENT_METHOD_OPTIONS,
              maxWidth: 250,
            },
          ]}
        />

        {isMobile ? (
          <RecentSaleCardList
            data={sales}
            total={salesTotal}
            page={salesPage}
            pageSize={salesPageSize}
            onPageChange={salesPageChange}
            onPageSizeChange={salesPageSizeChange}
            isLoading={salesLoading}
            onRowClick={handleViewRecentSale}
            onView={handleViewRecentSale}
            showItemCount
            showPayments
          />
        ) : (
          <GenericTable
            rowKey="id"
            columns={salesColumns}
            data={sales}
            total={salesTotal}
            isLoading={salesLoading}
            page={salesPage}
            pageSize={salesPageSize}
            onPageChange={salesPageChange}
            onPageSizeChange={salesPageSizeChange}
            onRowClick={handleViewRecentSale}
            locale={{ emptyText: "Nenhuma venda registrada" }}
          />
        )}

        <SaleReceiptModal receiptSale={receiptSale} onClose={handleCloseReceipt} variant={"view"} />
      </Card>
    </>
  );
};
