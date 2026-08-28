import { PaymentMethod } from "@/enums/payment.enum";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import {
  calculateActualCashFromSales,
  formatBRL,
  formatSigned,
} from "@/uperp/pages/AuthenticatedPages/CashFlow/CashFlowView/CloseCashFlowModal/const";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Row,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { ArrowDownCircle, ArrowLeft, Lock, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { formatDateFromApi } from "@/uperp/common/dates";
import { CashFlowHistorySalesTable } from "../CashFlowHistorySalesTable/CashFlowHistorySalesTable";
import { CashFlowHistoryTransactionTable } from "../CashFlowHistoryTransactionTable/CashFlowHistoryTransactionTable";
import {
  PAYMENT_METHOD_LABELS,
  useCashFlowHistoryDetailController,
} from "./useCashFlowHistoryDetail.controller";

const { Text, Title } = Typography;

export const CashFlowHistoryDetail = () => {
  const {
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
  } = useCashFlowHistoryDetailController();

  const [isCashOpen, setIsCashOpen] = useState(true);

  if (isLoadingCashFlow) {
    return (
      <Card>
        <Spin style={{ display: "block", margin: "48px auto" }} />
      </Card>
    );
  }

  if (!cashFlow || !isClosed) {
    return (
      <Card>
        <Empty description="Caixa não encontrado ou ainda aberto">
          <Button icon={<ArrowLeft size={14} />} onClick={handleBack}>
            Voltar
          </Button>
        </Empty>
      </Card>
    );
  }

  const closingBalance = cashFlow.closingBalance ?? 0;
  const diff = expectedAmount - closingBalance;

  return (
    <>
      <Card
        style={{ marginBottom: 16, borderLeft: "4px solid #DC2626" }}
        styles={{ body: { padding: 16 } }}
        extra={
          <Button icon={<ArrowLeft size={14} />} onClick={handleBack}>
            Voltar
          </Button>
        }
      >
        <Row align="middle" gutter={[16, 12]}>
          <Col>
            <Space align="center">
              <Lock color="#DC2626" size={24} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Caixa Fechado — {cashFlow.code}
                </Text>
                <Title level={4} style={{ margin: 0 }}>
                  Operador: {cashFlow.openedByUser?.employee?.name}
                </Title>
                <Space size={16} wrap>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Aberto em {formatDateFromApi(cashFlow.createdAt ?? "")}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Fechado em {formatDateFromApi(cashFlow.closedAt ?? "")}
                  </Text>
                  {cashFlow.closedByUser?.employee?.name && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Fechado por {cashFlow.closedByUser.employee.name}
                    </Text>
                  )}
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Resumo de valores */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Valor inicial"
              value={formatPrice(cashFlow.initialBalance ?? 0)}
              prefix={<Wallet size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Vendas"
              value={formatPrice(salesData?.amount ?? 0)}
              valueStyle={{ color: "#16A34A" }}
              prefix={<TrendingUp size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Reposições"
              value={formatPrice(replacementData?.amount ?? 0)}
              valueStyle={{ color: "#2563EB" }}
              prefix={<ArrowDownCircle size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Sangrias"
              value={formatPrice(sangriasData?.amount ?? 0)}
              valueStyle={{ color: "#DC2626" }}
              prefix={<TrendingDown size={16} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Saldo estimado x informado */}
      <Card
        style={{
          marginBottom: 16,
          background: "#FFF7ED",
          borderColor: "#FED7AA",
        }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 12]}>
          <Col>
            <Text type="secondary">Saldo estimado (Sistema)</Text>
            <Title level={2} style={{ margin: 0, color: "#F26B1F" }}>
              {formatPrice(expectedAmount.toFixed(2))}
            </Title>
          </Col>
          <Col>
            <Space direction="vertical" size={4} align="end">
              <Row justify="space-between" gutter={24}>
                <Text type="secondary">Saldo informado (Usuário)</Text>
                <Text style={{ marginInline: 5 }} strong>
                  {formatPrice(closingBalance)}
                </Text>
              </Row>
              <Row justify="space-between" gutter={24}>
                <Text type="secondary">Diferença</Text>
                <Text strong style={{ color: diff < 0 ? "#DC2626" : "#16A34A", marginInline: 5 }}>
                  {formatPrice(diff)}
                </Text>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Informações gerais — sistema x usuário por forma de pagamento */}
      <Card title="Informações Gerais" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Row gutter={16} style={{ marginBottom: 4 }}>
            <Col flex="auto">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Forma de pagamento
              </Text>
            </Col>
            <Col span={6} style={{ textAlign: "right" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Registrado (Sistema)
              </Text>
            </Col>
            <Col span={6} style={{ textAlign: "right" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Informado (Usuário)
              </Text>
            </Col>
          </Row>

          {paymentMethods.map((method) => {
            const systemValue = closeStats?.[method] ?? 0;
            const informedValue = getInformedValue(method);
            const methodDiff = systemValue - informedValue;
            const isCash = method === PaymentMethod.CASH;

            return (
              <div key={method}>
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Text strong={!isCash}>{PAYMENT_METHOD_LABELS[method]}</Text>
                  </Col>
                  <Col span={6} style={{ textAlign: "right" }}>
                    <Text>{formatBRL(systemValue)}</Text>
                  </Col>
                  <Col span={6} style={{ textAlign: "right" }}>
                    <Space size={8}>
                      <Text strong>{formatPrice(informedValue)}</Text>
                      {methodDiff !== 0 && (
                        <Tag
                          color={methodDiff > 0 ? "orange" : "red"}
                          style={{ marginInlineEnd: 0 }}
                        >
                          {formatBRL(methodDiff)}
                        </Tag>
                      )}
                    </Space>
                  </Col>
                </Row>

                {isCash && (
                  <>
                    <div
                      onClick={() => setIsCashOpen((prev) => !prev)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        cursor: "pointer",
                        userSelect: "none",
                        marginTop: 2,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {isCashOpen ? "Ocultar" : "Ver"} composição do dinheiro em caixa
                      </Text>
                    </div>
                    {isCashOpen && (
                      <div
                        style={{
                          marginTop: 6,
                          marginBottom: 4,
                          marginLeft: 18,
                          paddingLeft: 10,
                          borderLeft: "2px solid #f0f0f0",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Valor inicial
                          </Text>
                          <Text style={{ fontSize: 13 }}>
                            {formatSigned(cashFlow.initialBalance)}
                          </Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Vendas (dinheiro)
                          </Text>
                          <Text style={{ fontSize: 13 }}>
                            {formatSigned(
                              calculateActualCashFromSales(
                                Number(salesData?.amount ?? 0),
                                closeStats,
                              ),
                            )}
                          </Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Reposições
                          </Text>
                          <Text style={{ fontSize: 13 }}>
                            {formatSigned(replacementData?.amount ?? 0)}
                          </Text>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Sangrias
                          </Text>
                          <Text style={{ fontSize: 13 }}>
                            {formatSigned(-Math.abs(Number(sangriasData?.amount ?? 0)))}
                          </Text>
                        </div>
                        <Divider style={{ margin: "4px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <Text strong style={{ fontSize: 13 }}>
                            Total esperado em dinheiro
                          </Text>
                          <Text strong style={{ fontSize: 13 }}>
                            {formatBRL(closeStats?.[method])}
                          </Text>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <Divider style={{ margin: "8px 0" }} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Vendas e Movimentações */}
      <Card title="Vendas e movimentações do caixa" style={{ marginBottom: 16 }}>
        <Tabs
          items={[
            {
              key: "sales",
              label: "Vendas",
              children: <CashFlowHistorySalesTable cashFlowId={Number(cashFlow.id)} />,
            },
            {
              key: "mov",
              label: "Movimentações",
              children: <CashFlowHistoryTransactionTable cashFlowId={Number(cashFlow.id)} />,
            },
          ]}
        />
      </Card>
    </>
  );
};
