import { ConfirmDangerModal } from "@/application-components/ConfirmDangerModal/ConfirmDangerModal";
import { SaleStatus } from "@/enums/sale.enum";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useHasPermission } from "@/hooks/useHasPermission";
import { SaleReceiptModel } from "@/model/sale.model";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { ProductService } from "@/services/product.service";
import { SaleService } from "@/services/sale.service";
import { StatsDashboardService } from "@/services/statsDashboard.service";
import { formatDateFromApi } from "@/uperp/common/dates";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { SALE_PAYMENT_LABEL } from "@/uperp/common/formulas/saleReceipt";
import { PermissionsRef } from "@/uperp/common/permissions/const/permissions.ref";
import { Button, Divider, List, message, Modal, Row, Space, Tag, Typography } from "antd";
import { CheckCircle2, CreditCard, Percent, Printer, Share2, Star } from "lucide-react";
import { useState } from "react";
import { printSaleReceipt } from "./printSaleReceipt";
import { shareSaleReceipt } from "./shareSaleReceipt";

const { Title, Text } = Typography;

type SaleReceiptModalProps = {
  receiptSale: SaleReceiptModel | null;
  onClose: () => void;
  variant?: "success" | "view";
};

const productService = new ProductService();
const saleService = new SaleService();
const cashFlowTransaction = new CashFlowTransactionService();
const productDashboardService = new StatsDashboardService("product-dashboard");

export const SaleReceiptModal = ({
  receiptSale,
  onClose,
  variant = "success",
}: SaleReceiptModalProps) => {
  const [printing, setPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

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

  const handleShare = async () => {
    if (!receiptSale) return;

    try {
      setSharing(true);
      const result = await shareSaleReceipt(receiptSale);
      message.success(result === "shared" ? "Comprovante compartilhado" : "Comprovante baixado");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      message.error("Não foi possível compartilhar o comprovante");
    } finally {
      setSharing(false);
    }
  };

  const { invalidateQuery } = useCacheManager();

  const [submiting, setSubmiting] = useState(false);
  const handleCancelSale = async () => {
    try {
      setSubmiting(true);
      if (receiptSale) {
        await saleService.cancelSale(receiptSale?.sale.id);
        await invalidateQueries();
        closeConfirmModal();
      }
      message.success("Venda cancelada com sucesso!");
    } catch (error) {
      message.error("Ocorreu um erro ao realizar o cancelamento da venda.");
    } finally {
      setSubmiting(false);
    }
  };

  const invalidateQueries = async () => {
    await invalidateQuery(productService);
    await invalidateQuery(saleService);
    await invalidateQuery(cashFlowTransaction);
    await invalidateQuery(productDashboardService);
  };

  const canCancelSale = useHasPermission(PermissionsRef.Sale.Cancel.name);

  const closeConfirmModal = () => {
    setCancelConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <ConfirmDangerModal
        open={cancelConfirmOpen}
        title="Cancelar venda"
        description={`Tem certeza que deseja cancelar a venda ${receiptSale?.code}? Esta ação não poderá ser desfeita.`}
        confirmText="Cancelar venda"
        onConfirm={handleCancelSale}
        onCancel={closeConfirmModal}
        loading={submiting}
      />

      <Modal
        open={receiptSale !== null}
        title={
          receiptSale ? (
            variant === "success" ? (
              <Space>
                <CheckCircle2 size={20} color="#16A34A" />
                <span>Venda realizada com sucesso</span>
              </Space>
            ) : (
              <Space>
                <span>Venda {receiptSale.code}</span>
              </Space>
            )
          ) : undefined
        }
        onCancel={onClose}
        width={620}
        destroyOnHidden
        footer={
          receiptSale ? (
            <Space wrap>
              {variant === "view" && canCancelSale ? (
                <Button
                  disabled={receiptSale.sale.status === SaleStatus.CANCELED}
                  danger
                  onClick={() => setCancelConfirmOpen(true)}
                >
                  Cancelar venda
                </Button>
              ) : (
                <></>
              )}
              <Button icon={<Share2 size={15} />} loading={sharing} onClick={handleShare}>
                Compartilhar
              </Button>
              <Button
                type="primary"
                icon={<Printer size={15} />}
                loading={printing}
                onClick={handlePrint}
              >
                Imprimir
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
                Venda {receiptSale.code} · {formatDateFromApi(receiptSale.date)}
              </Text>
              <Title level={2} style={{ margin: "4px 0 0", color: "#15803D" }}>
                {formatPrice(receiptSale.total)}
              </Title>
              <Text strong style={{ display: "block", marginTop: 8 }}>
                Cliente: {receiptSale.customerName || "Consumidor final"}
              </Text>
              {receiptSale.sale.status === SaleStatus.CANCELED && (
                <Text strong style={{ display: "block", marginTop: 8, color: "#DC2626" }}>
                  Venda cancelada
                  {receiptSale.sale.canceledAt
                    ? ` em ${formatDateFromApi(receiptSale.sale.canceledAt)}`
                    : ""}
                </Text>
              )}
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
                        {item.discountValue != null && item.discountValue > 0 && (
                          <Tag color="red" icon={<Percent size={11} />} style={{ margin: 0 }}>
                            {formatPrice(item.discountValue)}
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
                <Text type="secondary">Preços especiais</Text>
                <Text type="secondary">-{formatPrice(receiptSale.specialPriceTotal)}</Text>
              </Row>
            )}
            {receiptSale.itemDiscountTotal > 0 && (
              <Row justify="space-between" style={{ marginBottom: 4 }}>
                <Text type="secondary">Desconto dos itens</Text>
                <Text type="secondary">-{formatPrice(receiptSale.itemDiscountTotal)}</Text>
              </Row>
            )}
            {receiptSale.saleDiscountValue > 0 && (
              <Row justify="space-between" style={{ marginBottom: 4 }}>
                <Text type="secondary">Desconto da venda</Text>
                <Text type="secondary">-{formatPrice(receiptSale.saleDiscountValue)}</Text>
              </Row>
            )}
            <Row justify="space-between" style={{ marginTop: 8 }}>
              <Title level={4} style={{ margin: 0 }}>
                Total
              </Title>
              <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>
                {formatPrice(receiptSale.total)}
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
    </>
  );
};
