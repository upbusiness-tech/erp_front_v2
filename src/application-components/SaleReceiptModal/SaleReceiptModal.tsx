import { SaleReceiptModel } from "@/model/sale.model";
import { formatPrice } from "@/uperp/common/productFormulas";
import { SALE_PAYMENT_LABEL } from "@/uperp/common/saleReceipt";
import { Button, Divider, List, message, Modal, Row, Space, Tag, Typography } from "antd";
import { CheckCircle2, CreditCard, Printer, Star } from "lucide-react";
import { useState } from "react";
import { printSaleReceipt } from "./printSaleReceipt";

const { Title, Text } = Typography;

type SaleReceiptModalProps = {
  receiptSale: SaleReceiptModel | null;
  onClose: () => void;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
};

export const SaleReceiptModal = ({ receiptSale, onClose }: SaleReceiptModalProps) => {
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (!receiptSale) return;

    try {
      setPrinting(true);
      await printSaleReceipt(receiptSale);
      message.success("Comprovante enviado para impressão");
    } catch {
      message.error("Não foi possível gerar o comprovante");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Modal
      open={receiptSale !== null}
      title={
        receiptSale ? (
          <Space>
            <CheckCircle2 size={20} color="#16A34A" />
            <span>Venda realizada com sucesso</span>
          </Space>
        ) : undefined
      }
      onCancel={onClose}
      width={620}
      destroyOnHidden
      footer={
        receiptSale ? (
          <Space wrap>
            <Button onClick={onClose}>Nova venda</Button>
            <Button
              type="primary"
              icon={<Printer size={15} />}
              loading={printing}
              onClick={handlePrint}
            >
              Imprimir comprovante
            </Button>
          </Space>
        ) : null
      }
    >
      {receiptSale && (
        <div>
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 16,
            }}
          >
            <Text type="secondary" style={{ display: "block" }}>
              Venda {receiptSale.code} · {formatDate(receiptSale.date)}
            </Text>
            <Title level={2} style={{ margin: "4px 0 0", color: "#15803D" }}>
              {formatPrice(receiptSale.subtotal)}
            </Title>
            <Text strong style={{ display: "block", marginTop: 8 }}>
              Cliente: {receiptSale.customerName || "Consumidor final"}
            </Text>
          </div>

          <Divider style={{ margin: "14px 0 10px" }}>Itens</Divider>
          <List
            size="small"
            dataSource={receiptSale.items}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space size={6} wrap>
                      <Text strong>{item.name}</Text>
                      {item.hasSpecialPrice && (
                        <Tag color="gold" icon={<Star size={11} />} style={{ margin: 0 }}>
                          Preço especial
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.quantity} × {formatPrice(item.unitPrice)}
                        {item.size ? ` · Tam. ${item.size}` : ""}
                        {item.color ? ` · ${item.color}` : ""}
                      </Text>
                      {item.hasSpecialPrice && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          De <Text delete>{formatPrice(item.originalUnitPrice)}</Text> por{" "}
                          <Text strong style={{ color: "#B45309" }}>
                            {formatPrice(item.unitPrice)}
                          </Text>
                        </Text>
                      )}
                      {item.note && (
                        <Text italic type="secondary" style={{ fontSize: 11 }}>
                          "{item.note}"
                        </Text>
                      )}
                    </Space>
                  }
                />
                <Text strong>{formatPrice(item.lineTotal)}</Text>
              </List.Item>
            )}
          />

          <Divider style={{ margin: "14px 0 10px" }}>Resumo</Divider>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Text>Subtotal</Text>
            <Text>{formatPrice(receiptSale.subtotal)}</Text>
          </Row>
          {receiptSale.specialPriceTotal > 0 && (
            <Row justify="space-between" style={{ marginBottom: 4 }}>
              <Text type="secondary">Total de preços especiais</Text>
              <Text type="secondary">{formatPrice(receiptSale.specialPriceTotal)}</Text>
            </Row>
          )}
          <Row justify="space-between" style={{ marginTop: 8 }}>
            <Title level={4} style={{ margin: 0 }}>
              Total
            </Title>
            <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>
              {formatPrice(receiptSale.subtotal)}
            </Title>
          </Row>

          <Divider style={{ margin: "14px 0 10px" }}>Pagamentos</Divider>
          {receiptSale.payments.map((payment) => (
            <Row key={payment.id} justify="space-between" style={{ marginBottom: 5 }}>
              <Space>
                <CreditCard size={14} color="#F26B1F" />
                <Text>{SALE_PAYMENT_LABEL[payment.type] || payment.type}</Text>
              </Space>
              <Text strong>{formatPrice(payment.amount)}</Text>
            </Row>
          ))}
          <Row justify="space-between" style={{ marginTop: 8 }}>
            <Text type="secondary">Pago</Text>
            <Text>{formatPrice(receiptSale.paid)}</Text>
          </Row>
          {receiptSale.change > 0 && (
            <Row justify="space-between" style={{ marginTop: 4 }}>
              <Text strong style={{ color: "#16A34A" }}>
                Troco
              </Text>
              <Text strong style={{ color: "#16A34A" }}>
                {formatPrice(receiptSale.change)}
              </Text>
            </Row>
          )}
        </div>
      )}
    </Modal>
  );
};
