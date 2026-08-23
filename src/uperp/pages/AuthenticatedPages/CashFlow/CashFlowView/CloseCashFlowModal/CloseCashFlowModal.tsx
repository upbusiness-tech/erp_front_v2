/* eslint-disable @typescript-eslint/no-explicit-any */
import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { PaymentMethod } from "@/enums/payment.enum";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Alert, Divider, Form, Modal, Tag, Typography } from "antd";
import { useState } from "react";
import { calculateActualCashFromSales, formatBRL, formatSigned } from "./const";
import { CashBreakdown } from "./types";
import { useCloseCashFlowModalController } from "./useCloseCashFlowModal.controller";

const { Text } = Typography;

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.PIX]: "PIX",
  [PaymentMethod.CREDIT]: "Cartão de Crédito",
  [PaymentMethod.DEBIT]: "Cartão de Débito",
  [PaymentMethod.CASH]: "Dinheiro",
};

type CloseCashFlowModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  cashBreakdown: CashBreakdown;
};

export const CloseCashFlowModal = ({ isOpen, onClose, cashBreakdown }: CloseCashFlowModalProps) => {
  const {
    closeCashFlowStatsToCompare,
    handleSubmit,
    isSubmitting,
    form,
    paymentMethods,
    informedValues,
    estimatedBalance,
    userEstimatedBalance,
    totalDifference,
  } = useCloseCashFlowModalController({ isOpen, onClose });

  const [isCashOpen, setIsCashOpen] = useState(false);

  return (
    <Modal
      open={isOpen}
      title="Fechar Caixa"
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Fechar Caixa"
      cancelText="Cancelar"
      confirmLoading={isSubmitting}
    >
      <Form layout="vertical" form={form}>
        <Text strong style={{ marginBottom: 8, display: "block" }}>
          Valores Informados
        </Text>

        <Form.List name="informedValues">
          {(fields) =>
            fields.map(({ key, name }) => {
              const method = paymentMethods[name];
              const systemValue = closeCashFlowStatsToCompare?.[method] ?? 0;
              const informedValue = informedValues?.[name]?.value ?? 0;
              const diff = systemValue - informedValue;
              const hasDiff = diff !== 0;

              return (
                <div key={key}>
                  <Form.Item name={[name, "method"]} hidden>
                    <input />
                  </Form.Item>
                  <Form.Item
                    label={PAYMENT_METHOD_LABELS[method]}
                    required
                    style={{ marginBottom: hasDiff ? 4 : 16 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Form.Item
                        name={[name, "value"]}
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: `Informe o valor de ${PAYMENT_METHOD_LABELS[method]}`,
                          },
                        ]}
                      >
                        <InputNumberFormatted
                          min={0}
                          step={1}
                          style={{ width: "100%" }}
                          prefix="R$"
                        />
                      </Form.Item>
                      <Text type="secondary" style={{ whiteSpace: "nowrap" }}>
                        Sistema: {formatBRL(systemValue)}
                      </Text>
                    </div>
                  </Form.Item>

                  {hasDiff && (
                    <Text
                      type="danger"
                      style={{ display: "block", marginTop: 8, marginBottom: 16, fontSize: 12 }}
                    >
                      Diferença: {formatBRL(diff)}
                    </Text>
                  )}
                </div>
              );
            })
          }
        </Form.List>

        <Divider style={{ margin: "12px 0" }} />

        <Text strong style={{ marginBottom: 8, display: "block" }}>
          Composição do Saldo Esperado
        </Text>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
          {paymentMethods.map((method) => {
            if (method === PaymentMethod.CASH) {
              return (
                <div key={method}>
                  <div
                    onClick={() => setIsCashOpen((prev) => !prev)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isCashOpen ? (
                        <DownOutlined style={{ fontSize: 10 }} />
                      ) : (
                        <RightOutlined style={{ fontSize: 10 }} />
                      )}
                      <Text type="secondary">{PAYMENT_METHOD_LABELS[method]}:</Text>
                    </div>
                    <Text>{formatBRL(closeCashFlowStatsToCompare?.[method])}</Text>
                  </div>

                  {isCashOpen && cashBreakdown && (
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
                          {formatSigned(cashBreakdown.initialBalance)}
                        </Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Vendas
                        </Text>
                        <Text style={{ fontSize: 13 }}>
                          {formatSigned(
                            calculateActualCashFromSales(
                              Number(cashBreakdown.sales),
                              closeCashFlowStatsToCompare,
                            ),
                          )}
                        </Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Reposições
                        </Text>
                        <Text style={{ fontSize: 13 }}>
                          {formatSigned(cashBreakdown.replacement)}
                        </Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Sangria
                        </Text>
                        <Text style={{ fontSize: 13 }}>
                          {formatSigned(-Math.abs(cashBreakdown.sagrias))}
                        </Text>
                      </div>
                      <Divider style={{ margin: "4px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text strong style={{ fontSize: 13 }}>
                          Total
                        </Text>
                        <Text strong style={{ fontSize: 13 }}>
                          {formatBRL(closeCashFlowStatsToCompare?.[method])}
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={method} style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">{PAYMENT_METHOD_LABELS[method]}:</Text>
                <Text>{formatBRL(closeCashFlowStatsToCompare?.[method])}</Text>
              </div>
            );
          })}

          <Divider style={{ margin: "4px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Text strong>Saldo estimado</Text>
              <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                Sistema
              </Tag>
            </div>
            <Text strong>{formatBRL(estimatedBalance)}</Text>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Text strong>Saldo estimado</Text>
              <Tag color="gold" style={{ marginInlineEnd: 0 }}>
                Usuário
              </Tag>
            </div>
            <Text strong>{formatBRL(userEstimatedBalance)}</Text>
          </div>
        </div>

        {totalDifference !== 0 && (
          <Alert
            type="warning"
            showIcon
            message={`Há uma diferença de ${formatBRL(
              Math.abs(totalDifference),
            )} entre o saldo estimado pelo sistema e o valor informado.`}
            description="Essa diferença não impede o fechamento do caixa."
            style={{ marginBottom: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
};
