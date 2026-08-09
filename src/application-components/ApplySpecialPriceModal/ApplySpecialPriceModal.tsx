import { InternCustomerSpecialPriceModel } from "@/model/internCustomerPrice.model";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { Button, Divider, Modal, Row, Space, Tag, Typography } from "antd";
import { Star } from "lucide-react";

const { Text, Title } = Typography;

type ApplySpecialPriceModalProps = {
  open: boolean;
  item: CartSaleItem | null;
  specialPrice: InternCustomerSpecialPriceModel | null;
  onApply: () => void;
  onCancel: () => void;
};

export const ApplySpecialPriceModal = ({
  open,
  item,
  specialPrice,
  onApply,
  onCancel,
}: ApplySpecialPriceModalProps) => {
  if (!item || !specialPrice) return null;

  const normalPrice = item.productEspecification.salePrice;
  const specialPriceValue = specialPrice.specialPrice;
  const quantity = item.quantitySold;
  const discountPerUnit = normalPrice - specialPriceValue;
  const discountPercent = ((discountPerUnit / normalPrice) * 100).toFixed(0);
  const totalNormal = normalPrice * quantity;
  const totalSpecial = specialPriceValue * quantity;
  const totalSavings = totalNormal - totalSpecial;

  return (
    <Modal
      open={open}
      title={
        <Space>
          <Star size={16} style={{ color: "#F26B1F" }} />
          Aplicar Preço Especial
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button key="apply" type="primary" onClick={onApply}>
          Aplicar Preço Especial
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
          background: "#FFF7ED",
          border: "1px solid #FED7AA",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text>Preço normal</Text>
          <Text>{formatPrice(normalPrice)}</Text>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Space>
            <Text>Preço especial</Text>
            <Tag color="gold" icon={<Star size={10} />} style={{ margin: 0 }}>
              -{discountPercent}%
            </Tag>
          </Space>
          <Text strong style={{ color: "#F26B1F" }}>
            {formatPrice(specialPriceValue)}
          </Text>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text type="secondary">Economia por unidade</Text>
          <Text type="secondary">{formatPrice(discountPerUnit)}</Text>
        </Row>

        <Divider style={{ margin: "12px 0" }} />

        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text>Quantidade</Text>
          <Text>{quantity}</Text>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text>Total normal</Text>
          <Text delete type="secondary">
            {formatPrice(totalNormal)}
          </Text>
        </Row>
        <Row justify="space-between" style={{ marginBottom: 8 }}>
          <Text strong>Total com preço especial</Text>
          <Text strong style={{ color: "#F26B1F", fontSize: 16 }}>
            {formatPrice(totalSpecial)}
          </Text>
        </Row>
        <Row justify="space-between">
          <Text strong style={{ color: "#16A34A" }}>
            Economia total
          </Text>
          <Text strong style={{ color: "#16A34A" }}>
            {formatPrice(totalSavings)}
          </Text>
        </Row>
      </div>
    </Modal>
  );
};
