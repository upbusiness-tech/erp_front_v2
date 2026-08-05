import { PaymentMethod } from "@/enums/payment.enum";
import { formatPrice } from "@/uperp/common/productFormulas";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { Avatar, Button, Divider, Empty, List, Row, Select, Space, Steps, Typography } from "antd";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Eye,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { ApplySpecialPriceModal } from "../ApplySpecialPriceModal/ApplySpecialPriceModal";
import { CustomerDetailsModal } from "../CustomerDetailsModal/CustomerDetailsModal";
import InputNumberFormatted from "../InputNumberFormated/InputNumberFormated";
import { OrderProductItem } from "../OrderProductItem/OrderProductItem";
import { PAYMENT_LABEL, useOrderContentController } from "./useOrderContent.controller";

const { Title, Text } = Typography;

export type OrderContentProps = {
  handleSubmitSale: () => Promise<void>;
};

export const OrderContent = ({ handleSubmitSale }: OrderContentProps) => {
  const {
    saleItems,
    setSaleItems,
    saleStep,
    setSaleStep,
    customers,
    isLoadingCustomers,
    selectedCustomer,
    setselectedCustomer,
    getSpecialPriceForItem,
    goToPayment,
    payments,
    addPayment,
    pMethod,
    pValue,
    setpMethod,
    setpValue,
    removePayment,
    change,
    changePreview,
    isOverpaid,
    paid,
    remaining,
    total,
  } = useOrderContentController();

  const [specialPriceModalOpen, setSpecialPriceModalOpen] = useState(false);
  const [itemForSpecialPrice, setItemForSpecialPrice] = useState<CartSaleItem | null>(null);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);

  const handleOpenSpecialPriceModal = (item: CartSaleItem) => {
    setItemForSpecialPrice(item);
    setSpecialPriceModalOpen(true);
  };

  const handleApplySpecialPrice = () => {
    if (!itemForSpecialPrice) return;
    const specialPrice = getSpecialPriceForItem(itemForSpecialPrice);
    if (!specialPrice) return;

    setSaleItems(
      saleItems.map((item) =>
        item.id === itemForSpecialPrice.id
          ? {
              ...item,
              isEspecialPrice: true,
              internCustomerPriceId: specialPrice.id,
              internCustomerPrice: specialPrice,
            }
          : item,
      ),
    );

    setSpecialPriceModalOpen(false);
    setItemForSpecialPrice(null);
  };

  const handleRemoveSpecialPrice = (item: CartSaleItem) => {
    setSaleItems(
      saleItems.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isEspecialPrice: false,
              internCustomerPriceId: undefined,
              internCustomerPrice: undefined,
            }
          : i,
      ),
    );
  };

  return (
    <>
      <Steps
        size="small"
        current={saleStep === "items" ? 0 : 1}
        items={[{ title: "Itens" }, { title: "Pagamento" }]}
        style={{ marginBottom: 12 }}
      />

      {saleStep === "items" ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Cliente
            </Text>
            <Select
              showSearch
              allowClear
              placeholder="Selecionar cliente (opcional)"
              value={selectedCustomer?.id || undefined}
              loading={isLoadingCustomers}
              onChange={(v) => {
                const customer = customers?.find((c) => c.id === v);
                setselectedCustomer(customer);
              }}
              style={{ width: "100%", marginTop: 4 }}
              optionFilterProp="label"
              suffixIcon={<User size={14} />}
              options={customers?.map((c) => ({ value: c.id, label: c.name }))}
            />
            {selectedCustomer && (
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 6,
                  background: "#FFF7ED",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Avatar size="small" style={{ background: "#F26B1F" }}>
                  {selectedCustomer.name.charAt(0)}
                </Avatar>
                <div style={{ flex: 1, lineHeight: 1.3 }}>
                  <Text strong style={{ fontSize: 14, display: "block" }}>
                    {selectedCustomer.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {selectedCustomer.phoneNumber}
                  </Text>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<Eye size={16} />}
                  onClick={() => setCustomerDetailsOpen(true)}
                  style={{ color: "#F26B1F" }}
                />
              </div>
            )}
          </div>

          <Divider style={{ margin: "8px 0 12px" }} />

          {/* {eligibleSpecialPrices.length > 0 && (
            <div
              style={{
                background: "#FEF3C7",
                border: "1px solid #FCD34D",
                padding: 10,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 12, display: "block" }}>
                    <Star size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
                    {eligibleSpecialPrices.length} produto(s) com preço especial
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Este cliente tem preço diferenciado para itens da comanda.
                  </Text>
                </div>
                <Space direction="vertical" size={4}>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                      const n = applySpecialPricesToCart(selectedCustomerId);
                      message.success(`${n} item(ns) atualizado(s) com preço especial`);
                    }}
                  >
                    Aplicar
                  </Button>
                  {cart.some((i) => i.customPrice != null) && (
                    <Button size="small" type="link" onClick={resetCartPrices}>
                      Restaurar
                    </Button>
                  )}
                </Space>
              </Space>
            </div>
          )} */}

          {saleItems.length === 0 ? (
            <Empty description="Carrinho vazio" />
          ) : (
            <List
              dataSource={saleItems}
              style={{ height: 320, overflowY: "auto" }}
              renderItem={(item, index) => (
                <OrderProductItem
                  key={index}
                  item={item}
                  specialPriceAvailable={
                    selectedCustomer && !item.isEspecialPrice
                      ? getSpecialPriceForItem(item)
                      : undefined
                  }
                  onApplySpecialPrice={handleOpenSpecialPriceModal}
                  onRemoveSpecialPrice={handleRemoveSpecialPrice}
                />
              )}
            />
          )}

          <Divider style={{ margin: "12px 0" }} />
          <Text type="secondary">Desconto</Text>
          {/* <Space.Compact style={{ width: "100%", marginTop: 4, marginBottom: 8 }}>
            <Select
              value={discountType}
              onChange={setDiscountType}
              options={[
                { value: "percent", label: "%" },
                { value: "value", label: "R$" },
              ]}
              style={{ width: 80 }}
            />
            <InputNumber
              min={0}
              value={discount}
              onChange={(v) => setDiscount(v || 0)}
              style={{ width: "100%" }}
            />
          </Space.Compact>
          {settings.askDiscountReason && discountValue > 0 && (
            <Input
              placeholder="Motivo do desconto"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              style={{ marginBottom: 12 }}
            />
          )} */}

          <Row justify="space-between">
            <Text>Subtotal</Text>
            <Text>{formatPrice(total)}</Text>
          </Row>
          <Row justify="space-between">
            <Text type="secondary">Desconto</Text>
            {/* <Text type="secondary">- R$ {discountValue.toFixed(2)}</Text> */}
          </Row>
          <Row justify="space-between" style={{ marginTop: 8 }}>
            <Title level={4} style={{ margin: 0 }}>
              Total
            </Title>
            <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>
              {formatPrice(total)}
            </Title>
          </Row>

          <Button
            type="primary"
            block
            size="large"
            style={{ marginTop: 12 }}
            icon={<ArrowRight size={14} />}
            iconPosition="end"
            onClick={goToPayment}
            disabled={saleItems.length === 0}
          >
            Ir para pagamento
          </Button>
        </>
      ) : (
        <>
          <div style={{ background: "#FFF7ED", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <Row justify="space-between">
              <Text>Total da venda</Text>
              <Text strong>{formatPrice(total)}</Text>
            </Row>
            <Row justify="space-between">
              <Text type="secondary">Pago</Text>
              <Text type="secondary">{formatPrice(paid)}</Text>
            </Row>
            <Row justify="space-between">
              <Text strong style={{ color: remaining > 0 ? "#DC2626" : "#16A34A" }}>
                Restante
              </Text>
              <Text strong style={{ color: remaining > 0 ? "#DC2626" : "#16A34A" }}>
                {formatPrice(remaining)}
              </Text>
            </Row>
            {isOverpaid && (
              <Row justify="space-between">
                <Text strong>Troco</Text>
                <Text strong style={{ color: "#16A34A" }}>
                  {formatPrice(change)}
                </Text>
              </Row>
            )}
          </div>

          <Text type="secondary" style={{ fontSize: 14 }}>
            Adicionar pagamento
          </Text>
          <Space.Compact style={{ width: "100%", marginTop: 4 }}>
            <Select
              value={pMethod}
              onChange={setpMethod}
              style={{ width: 160 }}
              options={Object.values(PaymentMethod).map((m) => ({
                value: m,
                label: PAYMENT_LABEL[m as PaymentMethod],
              }))}
            />
            <InputNumberFormatted
              min={0}
              step={0.5}
              value={pValue}
              onChange={(v) => setpValue(v || 0)}
              prefix="R$"
              style={{ width: "100%" }}
            />
            <Button type="primary" icon={<Plus size={14} />} onClick={addPayment}>
              Adc.
            </Button>
          </Space.Compact>

          {changePreview > 0 && (
            <div
              style={{
                marginTop: 8,
                padding: "6px 10px",
                borderRadius: 6,
                background: "#F0FDF4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: 14 }}>
                Troco
              </Text>
              <Text strong style={{ fontSize: 15, color: "#16A34A" }}>
                R$ {changePreview.toFixed(2)}
              </Text>
            </div>
          )}

          {payments.length > 0 && (
            <List
              size="small"
              style={{ marginTop: 12 }}
              dataSource={payments}
              renderItem={(p, idx) => (
                <List.Item
                  actions={[
                    <Button
                      key="x"
                      size="small"
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => removePayment(p.id)}
                    />,
                  ]}
                >
                  <Space>
                    <CreditCard size={14} color="#F26B1F" />
                    <Text>{PAYMENT_LABEL[p.type]}</Text>
                  </Space>
                  <Text strong>R$ {p.amount.toFixed(2)}</Text>
                </List.Item>
              )}
            />
          )}

          <Space style={{ width: "100%", marginTop: 16 }} direction="vertical">
            <Button
              type="primary"
              block
              size="large"
              icon={<CheckCircle2 size={16} />}
              disabled={paid < (total ?? 0) - 0.001}
              onClick={handleSubmitSale}
            >
              Finalizar Venda
            </Button>
            <Button block icon={<ArrowLeft size={14} />} onClick={() => setSaleStep("items")}>
              Voltar para itens
            </Button>
          </Space>
        </>
      )}

      <ApplySpecialPriceModal
        open={specialPriceModalOpen}
        item={itemForSpecialPrice}
        specialPrice={
          itemForSpecialPrice ? (getSpecialPriceForItem(itemForSpecialPrice) ?? null) : null
        }
        onApply={handleApplySpecialPrice}
        onCancel={() => {
          setSpecialPriceModalOpen(false);
          setItemForSpecialPrice(null);
        }}
      />

      <CustomerDetailsModal
        isOpen={customerDetailsOpen}
        customer={selectedCustomer}
        onClose={() => setCustomerDetailsOpen(false)}
      />
    </>
  );
};
