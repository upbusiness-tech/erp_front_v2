import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { VariationTags } from "@/application-components/VariationTags/VariationTags";
import { Button, Divider, Modal, Row, Space, Typography } from "antd";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { BRAND, BRAND_BORDER, BRAND_SOFT, SUCCESS } from "@/theme/colors";
import InputNumberFormatted from "../InputNumberFormated/InputNumberFormated";

const { Text, Title } = Typography;

type NegotiatedPriceModalProps = {
  open: boolean;
  item: CartSaleItem | null;
  onApply: (price: number) => void;
  onRemove: (item: CartSaleItem) => void;
  onCancel: () => void;
};

export const NegotiatedPriceModal = ({
  open,
  item,
  onApply,
  onRemove,
  onCancel,
}: NegotiatedPriceModalProps) => {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (!open || !item) return;
    setPrice(item.specialPrice ?? item.productEspecification.salePrice);
  }, [open, item]);

  if (!item) return null;

  const catalogPrice = item.productEspecification.salePrice;
  const quantity = Number(item.quantitySold);
  const unitSold = Number(item.unitSold);
  const lineTotal = price * quantity * unitSold;
  const savings = (catalogPrice - price) * quantity * unitSold;
  const isPriceValid = price > 0;

  return (
    <Modal
      open={open}
      title={
        <Space>
          <DollarSign size={16} style={{ color: BRAND }} />
          Preço negociado
        </Space>
      }
      onCancel={onCancel}
      footer={[
        item.specialPrice != null ? (
          <Button key="remove" danger onClick={() => onRemove(item)}>
            Remover preço negociado
          </Button>
        ) : null,
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button key="apply" type="primary" disabled={!isPriceValid} onClick={() => onApply(price)}>
          Aplicar preço negociado
        </Button>,
      ]}
      width={480}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16, display: "block" }}>
          {item.product.name}
        </Text>
        <div style={{ marginTop: 4 }}>
          <VariationTags specification={item.productEspecification} />
        </div>
      </div>

      <div
        style={{
          background: BRAND_SOFT,
          border: `1px solid ${BRAND_BORDER}`,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Row justify="space-between" style={{ marginBottom: 12 }}>
          <Text>Preço de catálogo</Text>
          <Text>{formatPrice(catalogPrice)}</Text>
        </Row>

        <Text type="secondary" style={{ display: "block", marginBottom: 4, fontSize: 12 }}>
          Preço unitário negociado
        </Text>
        <InputNumberFormatted
          style={{ width: "100%" }}
          placeholder="0"
          prefix="R$"
          min={0}
          value={price}
          onChange={setPrice}
          status={isPriceValid ? undefined : "error"}
        />
        {!isPriceValid && (
          <Text type="danger" style={{ fontSize: 12 }}>
            Informe um preço maior que zero.
          </Text>
        )}

        <Divider style={{ margin: "12px 0" }} />

        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text>Quantidade</Text>
          <Text>
            {quantity}
            {unitSold !== 1 ? ` × ${unitSold}` : ""}
          </Text>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text strong>Total final do produto</Text>
          <Title level={4} style={{ margin: 0, color: BRAND }}>
            {formatPrice(lineTotal)}
          </Title>
        </Row>
        {isPriceValid && savings !== 0 && (
          <Row justify="space-between">
            <Text strong style={{ color: savings > 0 ? SUCCESS : undefined }}>
              {savings > 0 ? "Economia" : "Acréscimo"}
            </Text>
            <Text strong style={{ color: savings > 0 ? SUCCESS : undefined }}>
              {formatPrice(Math.abs(savings))}
            </Text>
          </Row>
        )}
      </div>
    </Modal>
  );
};
