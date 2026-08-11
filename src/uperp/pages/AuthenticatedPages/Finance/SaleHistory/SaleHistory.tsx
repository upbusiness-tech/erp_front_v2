import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { SearchBar } from "@/application-components/SearchBar/SearchBar";
import { Button, Card, Col, DatePicker, Row, Statistic, Typography } from "antd";
import { Download } from "lucide-react";
import {
  SALE_PAYMENT_METHOD_OPTIONS,
  SALE_TYPE_OPTIONS,
  useSaleHistoryController,
} from "./useSaleHistory.controller";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export const SaleHistory = () => {
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
  } = useSaleHistoryController();

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Vendas filtradas" value={sales.length} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total filtrado"
              value={sales.length}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#F26B1F" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Recebido por forma de pagamento
            </Text>
            {/* <Space wrap style={{ marginTop: 8 }}>
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
                <Tag key={m} color="orange" style={{ padding: "4px 8px" }}>
                  {PAYMENT_LABEL[m]}: <strong>R$ {(byMethod[m] || 0).toFixed(2)}</strong>
                </Tag>
              ))}
            </Space> */}
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
          // onRowClick={onRowClick}
          locale={{ emptyText: "Nenhuma venda registrada" }}
        />

        {/* <Table
          rowKey="id"
          size="small"
          dataSource={sales}
          pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [8, 16, 32] }}
          expandable={{
            expandedRowRender: (s) => (
              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pagamentos:
                </Text>
                <Space wrap>
                  {s.payments?.length ? (
                    s.payments.map((p, i) => (
                      <Tag key={i} color="orange">
                        {PAYMENT_LABEL[p.method]}: R$ {p.value.toFixed(2)}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">—</Text>
                  )}
                </Space>
              </Space>
            ),
          }}
          columns={[
            { title: "ID", dataIndex: "id", width: 90 },
            { title: "Data", dataIndex: "date", width: 110 },
            {
              title: "Tipo",
              dataIndex: "type",
              width: 100,
              render: (t: string) => (
                <Tag color={t === "balcao" ? "orange" : "blue"}>
                  {t === "balcao" ? "Balcão" : "Serviço"}
                </Tag>
              ),
            },
            {
              title: "Cliente",
              dataIndex: "customerId",
              render: (id?: string) => customers.find((c) => c.id === id)?.name || "—",
            },
            { title: "Itens", dataIndex: "items", width: 70 },
            {
              title: "Pagamentos",
              render: (_, s) =>
                s.payments?.length ? (
                  <Space size={4} wrap>
                    {s.payments.map((p, i) => (
                      <Tag key={i} style={{ margin: 0 }}>
                        {PAYMENT_LABEL[p.method]}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  "—"
                ),
            },
            {
              title: "Total",
              dataIndex: "total",
              width: 110,
              render: (v: number) => (
                <strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</strong>
              ),
            },
          ]}
        /> */}
      </Card>
    </>
  );
};
