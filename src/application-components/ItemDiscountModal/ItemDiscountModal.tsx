import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { CartSaleItem, DiscountInfo } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { VariationTags } from "@/application-components/VariationTags/VariationTags";
import { Button, Divider, Input, InputNumber, Modal, Row, Space, Typography } from "antd";
import { Percent } from "lucide-react";
import { BRAND } from "@/theme/colors";
import InputNumberFormatted from "../InputNumberFormated/InputNumberFormated";
import { useItemDiscountModalController } from "./useItemDiscountModal.controller";

const { Text } = Typography;

type ItemDiscountModalProps = {
  open: boolean;
  item: CartSaleItem | null;
  onApply: (item: CartSaleItem, discount: DiscountInfo) => void;
  onRemove: (item: CartSaleItem) => void;
  onCancel: () => void;
};

export const ItemDiscountModal = ({
  open,
  item,
  onApply,
  onRemove,
  onCancel,
}: ItemDiscountModalProps) => {
  const {
    handleRemove,
    handleApply,
    effectivePrice,
    quantity,
    lineTotal,
    maxDiscount,
    valueInput,
    handleValueChange,
    setLastEdited,
    percentInput,
    handlePercentChange,
    reason,
    setReason,
    totalAfterDiscount,
  } = useItemDiscountModalController({ open, item, onApply, onRemove });

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Percent size={16} style={{ color: BRAND }} />
          Desconto no item
        </Space>
      }
      onCancel={onCancel}
      footer={[
        item?.discountInfo?.value ? (
          <Button key="remove" danger onClick={handleRemove}>
            Remover desconto
          </Button>
        ) : null,
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button key="apply" type="primary" onClick={handleApply}>
          Aplicar desconto
        </Button>,
      ]}
      width={480}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16, display: "block" }}>
          {item?.product.name}
        </Text>
        {item && (
          <div style={{ marginTop: 4 }}>
            <VariationTags specification={item.productEspecification} />
          </div>
        )}
      </div>

      <div
        style={{
          background: "#F5F5F5",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text>Preço unitário</Text>
          <Text>{formatPrice(effectivePrice)}</Text>
        </Row>
        <Row justify="space-between">
          <Text>Total do item ({quantity}x)</Text>
          <Text strong>{formatPrice(lineTotal)}</Text>
        </Row>
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
            Modo de desconto
          </Text>
          <Space.Compact style={{ width: "100%" }}>
            <InputNumberFormatted
              style={{ width: "100%" }}
              placeholder="0"
              prefix="R$"
              min={0}
              max={maxDiscount}
              value={valueInput ?? 0}
              onChange={handleValueChange}
              onFocus={() => setLastEdited("R$")}
            />
            <InputNumber
              style={{ width: "100%" }}
              placeholder="%"
              suffix="%"
              min={0}
              max={100}
              value={percentInput}
              onChange={handlePercentChange}
              onFocus={() => setLastEdited("%")}
            />
          </Space.Compact>
        </div>

        <div>
          <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
            Motivo (opcional)
          </Text>
          <Input
            placeholder="Ex.: quebra, acordo, defeito..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </Space>

      <Divider style={{ margin: "16px 0 12px" }} />

      <Row justify="space-between">
        <Text strong>Total com desconto</Text>
        <Text strong style={{ color: BRAND, fontSize: 16 }}>
          {formatPrice(totalAfterDiscount)}
        </Text>
      </Row>
    </Modal>
  );
};
