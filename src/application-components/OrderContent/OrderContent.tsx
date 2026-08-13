import { PaymentMethod } from "@/enums/payment.enum";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import {
  Avatar,
  Button,
  Divider,
  Empty,
  Input,
  InputNumber,
  List,
  Row,
  Select,
  Space,
  Steps,
  Typography,
} from "antd";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Eye,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { ApplySpecialPriceModal } from "../ApplySpecialPriceModal/ApplySpecialPriceModal";
import { CustomerDetailsModal } from "../CustomerDetailsModal/CustomerDetailsModal";
import InputNumberFormatted from "../InputNumberFormated/InputNumberFormated";
import { ItemDiscountModal } from "../ItemDiscountModal/ItemDiscountModal";
import { OrderProductItem } from "../OrderProductItem/OrderProductItem";
import { useOrderContentController } from "./useOrderContent.controller";
import { PAYMENT_LABEL } from "@/uperp/common/consts";

const { Title, Text } = Typography;

export type OrderContentProps = {
  handleSubmitSale: () => Promise<void>;
  submitingSale: boolean;
};

export const OrderContent = ({ handleSubmitSale, submitingSale }: OrderContentProps) => {
  const {
    saleItems,
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
    saleDiscount,
    specialPriceModalOpen,
    discountModalOpen,
    itemForDiscount,
    customerDetailsOpen,
    setCustomerDetailsOpen,
    saleDiscountExpanded,
    handleOpenSpecialPriceModal,
    handleApplySpecialPrice,
    handleRemoveSpecialPrice,
    handleOpenDiscountModal,
    handleApplyItemDiscount,
    handleRemoveItemDiscount,
    handleSaleDiscountPercentChange,
    handleSaleDiscountValueChange,
    handleSaleDiscountReasonChange,
    handleRemoveSaleDiscount,
    grossSubtotal,
    specialPriceSavings,
    itemDiscountsTotal,
    setSaleDiscountExpanded,
    saleDiscountValue,
    itemForSpecialPrice,
    setSpecialPriceModalOpen,
    setItemForSpecialPrice,
    setDiscountModalOpen,
    setItemForDiscount,
  } = useOrderContentController();

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
                  onOpenDiscount={handleOpenDiscountModal}
                />
              )}
            />
          )}

          <Divider style={{ margin: "12px 0" }} />

          <Row justify="space-between">
            <Text>Subtotal</Text>
            <Text>{formatPrice(grossSubtotal)}</Text>
          </Row>
          {specialPriceSavings > 0 && (
            <Row justify="space-between">
              <Text type="secondary">Preços especiais</Text>
              <Text type="secondary">-{formatPrice(specialPriceSavings)}</Text>
            </Row>
          )}
          {itemDiscountsTotal > 0 && (
            <Row justify="space-between">
              <Text type="secondary">Desconto dos itens</Text>
              <Text type="secondary">-{formatPrice(itemDiscountsTotal)}</Text>
            </Row>
          )}

          <div
            style={{
              cursor: "pointer",
              marginBottom: 4,
              marginTop: 4,
            }}
            onClick={() => setSaleDiscountExpanded(!saleDiscountExpanded)}
          >
            <Row justify="space-between" align="middle">
              <Space size={4}>
                {saleDiscountExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Text style={{ color: saleDiscountValue > 0 ? "#F26B1F" : undefined }}>
                  Desconto da venda
                </Text>
              </Space>
              <Text type={saleDiscountValue > 0 ? "secondary" : undefined}>
                {saleDiscountValue > 0 ? `-${formatPrice(saleDiscountValue)}` : "R$ 0,00"}
              </Text>
            </Row>
          </div>

          {saleDiscountExpanded && (
            <div
              style={{
                background: "#F5F5F5",
                borderRadius: 6,
                padding: "8px 10px",
                marginBottom: 8,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Space.Compact style={{ width: "100%", marginBottom: 6 }}>
                <InputNumberFormatted
                  style={{ width: "100%" }}
                  placeholder="0"
                  prefix="R$"
                  min={0}
                  max={grossSubtotal - specialPriceSavings - itemDiscountsTotal}
                  value={saleDiscountValue}
                  onChange={handleSaleDiscountValueChange}
                />
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="%"
                  suffix="%"
                  min={0}
                  max={100}
                  value={saleDiscount?.percent ?? null}
                  onChange={handleSaleDiscountPercentChange}
                />
              </Space.Compact>
              <Input
                size="small"
                placeholder="Motivo do desconto (opcional)"
                value={saleDiscount?.reason ?? ""}
                onChange={(e) => handleSaleDiscountReasonChange(e.target.value)}
                style={{ marginBottom: 6 }}
              />
              {saleDiscountValue > 0 && (
                <Button size="small" danger block onClick={handleRemoveSaleDiscount}>
                  Remover desconto da venda
                </Button>
              )}
            </div>
          )}

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
              loading={submitingSale}
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

      <ItemDiscountModal
        open={discountModalOpen}
        item={itemForDiscount}
        onApply={handleApplyItemDiscount}
        onRemove={handleRemoveItemDiscount}
        onCancel={() => {
          setDiscountModalOpen(false);
          setItemForDiscount(null);
        }}
      />
    </>
  );
};
