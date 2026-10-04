import { SubscriptionStatus } from "@/enums/subscription.enum";
import { SubscriptionModel } from "@/model/subscription.model";
import { Modal, Spin, Tag, Typography } from "antd";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, CreditCard, FileText, Link2 } from "lucide-react";
import { usePaymentModalController } from "./usePaymentModal.controller";

const { Text, Link, Title } = Typography;
const BRAND_ORANGE = "#F26B1F";

const statusConfig: Record<SubscriptionStatus, { color: string }> = {
  [SubscriptionStatus.PAID]: { color: "green" },
  [SubscriptionStatus.PENDING]: { color: "orange" },
  [SubscriptionStatus.LATE]: { color: "red" },
  [SubscriptionStatus.ANALISYS]: { color: "blue" },
};

type PaymentModalProps = {
  subscription: SubscriptionModel;
  onClose: VoidFunction;
};

export const PaymentModal = ({ subscription, onClose }: PaymentModalProps) => {
  const { isPolling, startPolling, handleClose, handleOpenPayment } = usePaymentModalController(
    subscription,
    onClose,
  );

  const isPaid = subscription.status === SubscriptionStatus.PAID;

  return (
    <Modal
      open
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${BRAND_ORANGE}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: BRAND_ORANGE,
              fontSize: 16,
            }}
          >
            <CreditCard size={16} />
          </div>
          <span style={{ fontWeight: 600 }}>Pagar fatura</span>
        </div>
      }
      onCancel={handleClose}
      onOk={handleOpenPayment}
      okText="Ir para pagamento"
      cancelText="Fechar"
      okButtonProps={{
        style: {
          background: BRAND_ORANGE,
          boxShadow: "0 2px 8px rgba(242, 107, 31, 0.3)",
          display: isPaid ? "none" : undefined,
        },
      }}
      width={480}
    >
      <div style={{ padding: "8px 0" }}>
        {/* Detalhes da fatura */}
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
              paddingBottom: 12,
              borderBottom: "1px solid #ebebeb",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: `${BRAND_ORANGE}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BRAND_ORANGE,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              <FileText size={12} />
            </div>
            <Text strong style={{ color: "#555", fontSize: 12, letterSpacing: 0.3 }}>
              DETALHES DA FATURA
            </Text>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {/* Mês de referência */}
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "#8c8c8c",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}
              >
                Referência
              </Text>
              <Text
                strong
                style={{
                  fontSize: 14,
                  color: "#1f1f1f",
                  textTransform: "capitalize",
                }}
              >
                {format(parseISO(subscription.referenceMonth), "MMMM/yyyy", { locale: ptBR })}
              </Text>
            </div>

            {/* Status */}
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "#8c8c8c",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}
              >
                Status
              </Text>
              <Tag
                color={statusConfig[subscription.status]?.color}
                style={{
                  margin: 0,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {subscription.status}
              </Tag>
            </div>

            {/* Data de vencimento */}
            <div>
              <Text
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "#8c8c8c",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}
              >
                Vencimento
              </Text>
              <Text strong style={{ fontSize: 14, color: "#1f1f1f" }}>
                {format(parseISO(subscription.dueDate), "dd/MM/yyyy")}
              </Text>
            </div>
          </div>
        </div>

        {isPaid ? (
          <div
            style={{
              background: "#f6ffed",
              border: "1.5px solid #b7eb8f",
              borderRadius: 12,
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#52c41a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={22} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <Text strong style={{ color: "#135200", fontSize: 15, display: "block" }}>
                Fatura paga
              </Text>
              {subscription.paidAt ? (
                <Text style={{ color: "#389e0d", fontSize: 13 }}>
                  Confirmada em {format(parseISO(subscription.paidAt), "dd/MM/yyyy 'às' HH:mm")}
                </Text>
              ) : (
                <Text style={{ color: "#389e0d", fontSize: 13 }}>Pagamento confirmado</Text>
              )}
            </div>
          </div>
        ) : subscription.externalLink ? (
          <div
            style={{
              background: `${BRAND_ORANGE}08`,
              border: `1.5px solid ${BRAND_ORANGE}30`,
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: isPolling ? 20 : 0,
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: BRAND_ORANGE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                <Link2 size={14} />
              </div>
              <Text strong style={{ color: "#1f1f1f", fontSize: 14 }}>
                Link de pagamento
              </Text>
            </div>
            <Link
              href={subscription.externalLink}
              target="_blank"
              rel="noreferrer"
              onClick={startPolling}
              style={{
                fontSize: 13,
                wordBreak: "break-all",
                color: BRAND_ORANGE,
                display: "block",
              }}
            >
              {subscription.externalLink}
            </Link>
          </div>
        ) : (
          <div
            style={{
              background: "#fafafa",
              border: "1.5px dashed #d9d9d9",
              borderRadius: 12,
              padding: "24px 20px",
              textAlign: "center",
              marginBottom: isPolling ? 20 : 0,
            }}
          >
            <Text type="secondary">Link de pagamento indisponível</Text>
          </div>
        )}

        {isPolling && (
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND_ORANGE}08 0%, ${BRAND_ORANGE}15 100%)`,
              border: `1.5px solid ${BRAND_ORANGE}25`,
              borderRadius: 12,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Spin
                size="large"
                indicator={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      border: `3px solid ${BRAND_ORANGE}20`,
                      borderTopColor: BRAND_ORANGE,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                }
              />
            </div>
            <Title
              level={5}
              style={{
                margin: "0 0 8px 0",
                color: "#1f1f1f",
                fontWeight: 600,
              }}
            >
              Aguardando pagamento...
            </Title>
            <Text
              style={{
                color: "#666",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Assim que o pagamento for confirmado, esta janela fecha automaticamente.
            </Text>
          </div>
        )}
      </div>

      {/* CSS para animação do spinner customizado */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
};
