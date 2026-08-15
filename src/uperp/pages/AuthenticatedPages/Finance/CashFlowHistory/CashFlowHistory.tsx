/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { formatDateFromApi } from "@/uperp/common/dates";
import {
  calculateCashFlowDiff,
  calculeCashFlowEstimetedAmount,
} from "@/uperp/common/formulas/cashFlowFormulas";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { Card, Col, Empty, Row, Space, Tabs, Typography } from "antd";
import { Lock, LockOpen, Wallet } from "lucide-react";
import { CashFlowHistorySalesTable } from "./CashFlowHistorySalesTable/CashFlowHistorySalesTable";
import { CashFlowHistoryTransactionTable } from "./CashFlowHistoryTransactionTable/CashFlowHistoryTransactionTable";
import { useCashFlowHistoryController } from "./useCashFlowHistory.controller";

const { Text, Title } = Typography;

export const CashFlowHistory = () => {
  const {
    cashFlowData,
    cashFlowselected,
    setCashFlowSelected,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    page,
    pageSize,
    total,
    tableColumns,
    sangriasData,
    salesData,
    replacementData,
  } = useCashFlowHistoryController();

  const expectedAmount = calculeCashFlowEstimetedAmount(
    Number(sangriasData?.amount ?? []),
    Number(replacementData?.amount ?? []),
    Number(salesData?.amount ?? []),
    Number(cashFlowselected?.initialBalance ?? []),
  );

  const diff = calculateCashFlowDiff(cashFlowselected, expectedAmount);

  return (
    <>
      {/* <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Caixas fechados"
              value={history.length}
              prefix={<Wallet size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total em vendas"
              value={0}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#16A34A" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total em reposições"
              value={0}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#2563EB" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total em sangrias"
              value={0}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#DC2626" }}
            />
          </Card>
        </Col>
      </Row> */}

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="Caixas da empresa">
            <GenericTable
              data={cashFlowData ?? []}
              columns={tableColumns}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
              total={total}
              locale={{ emptyText: "Nenhum caixa encontrado" }}
              onRowClick={(r) => setCashFlowSelected(r)}
              size="small"
              rowClassName={(r: any) =>
                cashFlowselected?.id === r.id ? "ant-table-row-selected" : ""
              }
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          {cashFlowselected ? (
            <Card
              title={
                <Space>
                  <Wallet size={16} color="#F26B1F" />
                  Detalhes — {cashFlowselected.id}
                </Space>
              }
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Row justify="space-between">
                  <Text
                    type="secondary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      textAlign: "center",
                    }}
                  >
                    <LockOpen size={12} /> Aberto em
                  </Text>
                  <Text>{formatDateFromApi(cashFlowselected?.createdAt ?? "")}</Text>
                </Row>
                <Row justify="space-between">
                  <Text
                    type="secondary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      textAlign: "center",
                    }}
                  >
                    <Lock size={12} /> Fechado em
                  </Text>
                  {cashFlowselected?.closedAt ? (
                    <Text>{formatDateFromApi(cashFlowselected?.closedAt)}</Text>
                  ) : (
                    <Text strong style={{ color: "#16A34A" }}>
                      Caixa aberto
                    </Text>
                  )}
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">Operador</Text>
                  <Text strong>{cashFlowselected.openedByUser.employee.name}</Text>
                </Row>
              </Space>

              <div style={{ marginTop: 12, padding: 12, background: "#FFF7ED", borderRadius: 8 }}>
                <Row justify="space-between">
                  <Text>Valor inicial</Text>
                  <Text>R$ {cashFlowselected.initialBalance}</Text>
                </Row>
                <Row justify="space-between">
                  <Text>+ Vendas</Text>
                  <Text style={{ color: "#16A34A" }}>{formatPrice(salesData?.amount ?? 0)}</Text>
                </Row>
                <Row justify="space-between">
                  <Text>+ Reposições</Text>
                  <Text style={{ color: "#7C3AED" }}>
                    {formatPrice(replacementData?.amount ?? 0)}
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text>- Sangrias</Text>
                  <Text style={{ color: "#DC2626" }}>{formatPrice(sangriasData?.amount ?? 0)}</Text>
                </Row>
                <div style={{ borderTop: "1px dashed #FED7AA", margin: "8px 0" }} />
                <Row justify="space-between">
                  <Title level={5} style={{ margin: 0 }}>
                    Saldo esperado
                  </Title>
                  <Title level={5} style={{ margin: 0, color: "#F26B1F" }}>
                    {formatPrice(expectedAmount)}
                  </Title>
                </Row>
                {cashFlowselected.closingBalance != null && (
                  <>
                    <Row justify="space-between" style={{ marginTop: 4 }}>
                      <Text>Valor informado</Text>
                      <Text strong>{formatPrice(cashFlowselected.closingBalance)}</Text>
                    </Row>
                    <Row justify="space-between">
                      <Text>Diferença</Text>
                      <Text strong style={{ color: (diff ?? 0) < 0 ? "#DC2626" : "#16A34A" }}>
                        {formatPrice(diff)}
                      </Text>
                    </Row>
                  </>
                )}
              </div>

              <Tabs
                size="small"
                style={{ marginTop: 8 }}
                items={[
                  {
                    key: "mov",
                    label: `Movimentações`,
                    children: <CashFlowHistoryTransactionTable cashFlowId={cashFlowselected.id} />,
                  },
                  {
                    key: "sales",
                    label: `Vendas`,
                    children: <CashFlowHistorySalesTable cashFlowId={cashFlowselected.id} />,
                  },
                ]}
              />
            </Card>
          ) : (
            <Card>
              <Empty description="Selecione um caixa para ver detalhes" />
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
};
