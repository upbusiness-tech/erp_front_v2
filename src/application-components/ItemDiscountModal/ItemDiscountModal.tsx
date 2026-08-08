import { formatPrice } from "@/uperp/common/productFormulas";
import { CartSaleItem, DiscountInfo } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { Button, Divider, Input, InputNumber, Modal, Row, Space, Tag, Typography } from "antd";
import { Percent } from "lucide-react";
import { useEffect, useState } from "react";
import InputNumberFormatted from "../InputNumberFormated/InputNumberFormated";

const { Text, Title } = Typography;

type ItemDiscountModalProps = {
  open: boolean;
  item: CartSaleItem | null;
  onApply: (item: CartSaleItem, discount: DiscountInfo) => void;
  onRemove: (item: CartSaleItem) => void;
  onCancel: () => void;
};

type LastEdited = "%" | "R$" | null;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const ItemDiscountModal = ({
  open,
  item,
  onApply,
  onRemove,
  onCancel,
}: ItemDiscountModalProps) => {
  const [percentInput, setPercentInput] = useState<number | null>(null);
  const [valueInput, setValueInput] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [lastEdited, setLastEdited] = useState<LastEdited>(null);

  const effectivePrice = item?.isEspecialPrice
    ? Number(item.internCustomerPrice?.specialPrice ?? 0)
    : Number(item?.productEspecification.salePrice ?? 0);

  const quantity = Number(item?.quantitySold ?? 0);
  const lineTotal = effectivePrice * quantity;
  const maxDiscount = lineTotal;

  const currentValue = valueInput ?? 0;
  const totalAfterDiscount = Math.max(lineTotal - currentValue, 0);

  useEffect(() => {
    if (open && item) {
      const existing = item.discountInfo;
      if (existing?.value) {
        setValueInput(existing.value);
        setPercentInput(existing.percent ?? round2((existing.value / lineTotal) * 100));
        setReason(existing.reason ?? "");
        setLastEdited(null);
      } else {
        setPercentInput(null);
        setValueInput(null);
        setReason("");
        setLastEdited(null);
      }
    }
  }, [open, item, lineTotal]);

  const handlePercentChange = (v: number | null) => {
    if (v != null && (v < 0 || v > 100)) return;
    setPercentInput(v);
    if (v != null) {
      setValueInput(round2((v / 100) * lineTotal));
    } else {
      setValueInput(null);
    }
    setLastEdited("%");
  };

  const handleValueChange = (v: number | null) => {
    setValueInput(v);
    if (v != null && lineTotal > 0) {
      setPercentInput(round2((v / lineTotal) * 100));
    } else {
      setPercentInput(null);
    }
    setLastEdited("R$");
  };

  const handleApply = () => {
    if (!item) return;
    if (currentValue > maxDiscount) return;

    onApply(item, {
      value: currentValue > 0 ? currentValue : undefined,
      percent: percentInput && percentInput > 0 ? percentInput : undefined,
      reason: reason.trim() || undefined,
    });
  };

  const handleRemove = () => {
    if (!item) return;
    onRemove(item);
  };

  if (!item) return null;

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Percent size={16} style={{ color: "#F26B1F" }} />
          Desconto no item
        </Space>
      }
      onCancel={onCancel}
      footer={[
        item.discountInfo?.value ? (
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
          {item.product.name}
        </Text>
        <Space size={4} style={{ marginTop: 4 }}>
          {item.productEspecification.size && (
            <Tag color="orange">Tam. {item.productEspecification.size}</Tag>
          )}
          {item.productEspecification.color && (
            <Tag color="default">{item.productEspecification.color}</Tag>
          )}
        </Space>
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
        <Text strong style={{ color: "#F26B1F", fontSize: 16 }}>
          {formatPrice(totalAfterDiscount)}
        </Text>
      </Row>
    </Modal>
  );
};
