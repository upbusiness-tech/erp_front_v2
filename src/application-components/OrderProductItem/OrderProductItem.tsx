import { InternCustomerSpecialPriceModel } from "@/model/internCustomerPrice.model";
import { calculateOrderItem, formatPrice } from "@/uperp/common/formulas/productFormulas";
import { productUnitFormat } from "@/uperp/common/util/productForm";
import { CartSaleItem } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";
import { Button, InputNumber, List, Row, Space, Tag, Typography } from "antd";
import { ChevronDown, ChevronRight, Percent, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useOrderProductItemController } from "./useOrderProductItem.controller";

const { Text } = Typography;

type OrderProductItemProps = {
  item: CartSaleItem;
  specialPriceAvailable?: InternCustomerSpecialPriceModel;
  onApplySpecialPrice?: (item: CartSaleItem) => void;
  onRemoveSpecialPrice?: (item: CartSaleItem) => void;
  onOpenDiscount?: (item: CartSaleItem) => void;
};

export const OrderProductItem = ({
  item,
  specialPriceAvailable,
  onApplySpecialPrice,
  onRemoveSpecialPrice,
  onOpenDiscount,
}: OrderProductItemProps) => {
  const { removeSaleItem, updateSaleItemQuantity } = useOrderProductItemController();
  const [expanded, setExpanded] = useState(false);

  const effective = item.productEspecification.salePrice;
  const itemPrice = item.internCustomerPrice?.specialPrice ?? item.productEspecification.salePrice;
  const hasSpecial = item.isEspecialPrice;
  const hasDiscount = item.discountInfo?.value != null && item.discountInfo.value > 0;
  const discountValue = Number(item.discountInfo?.value ?? 0);
  const lineTotal = calculateOrderItem(item);

  const discountPercent = specialPriceAvailable
    ? (
        ((item.productEspecification.salePrice - specialPriceAvailable.specialPrice) /
          item.productEspecification.salePrice) *
        100
      ).toFixed(0)
    : "0";

  return (
    <List.Item
      actions={[
        onOpenDiscount && (
          <Button
            key="d"
            size="small"
            type="text"
            icon={<Percent size={14} />}
            onClick={() => onOpenDiscount(item)}
            title="Desconto"
          />
        ),
        <Button
          key="r"
          size="small"
          type="text"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => removeSaleItem(item.id)}
        />,
      ]}
    >
      <List.Item.Meta
        title={
          <Space>
            {item.product.name}
            {hasSpecial && (
              <>
                <Tag color="gold" style={{ margin: 0 }} icon={<Star size={10} />}>
                  Especial
                </Tag>
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<X size={12} />}
                  onClick={() => onRemoveSpecialPrice?.(item)}
                  style={{ padding: 0, height: "auto" }}
                >
                  Remover
                </Button>
              </>
            )}
          </Space>
        }
        description={
          <Space direction="vertical" size={2} style={{ width: "100%" }}>
            {(item.productEspecification.size || item.productEspecification.color) && (
              <Space size={4} wrap>
                {item.productEspecification.size && (
                  <Tag color="orange" style={{ margin: 0 }}>
                    Tam. {item.productEspecification.size}
                  </Tag>
                )}
                {item.productEspecification.color && (
                  <Tag color="default" style={{ margin: 0 }}>
                    {item.productEspecification.color}
                  </Tag>
                )}
              </Space>
            )}
            {item.note && (
              <Text type="secondary" italic style={{ fontSize: 13 }}>
                "{item.note}"
              </Text>
            )}
            {item.unitSold && item.product.unitOfMeasure != ProductUnitOfMeasure.UNIT && (
              <Text type="secondary" italic style={{ fontSize: 13 }}>
                {`${item.unitSold.toFixed(3)}${productUnitFormat(item.product.unitOfMeasure as ProductUnitOfMeasure)?.suffix}`}
              </Text>
            )}
            {hasSpecial && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                De{" "}
                <Text delete style={{ fontSize: 13 }}>
                  {formatPrice(effective)}
                </Text>{" "}
                por{" "}
                <Text strong style={{ color: "#F26B1F", fontSize: 13 }}>
                  {formatPrice(itemPrice)}
                </Text>
              </Text>
            )}
            {hasDiscount && (
              <Space size={4}>
                <Tag color="red" style={{ margin: 0 }}>
                  -{formatPrice(discountValue)}
                  {item.discountInfo?.percent ? ` (${item.discountInfo.percent}%)` : ""}
                </Tag>
              </Space>
            )}
            {specialPriceAvailable && !hasSpecial && (
              <div
                style={{
                  background: "#FEF3C7",
                  border: "1px solid #FCD34D",
                  borderRadius: 6,
                  padding: "6px 8px",
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpanded(!expanded)}
                >
                  <Space size={4}>
                    <Star size={12} style={{ color: "#F59E0B" }} />
                    <Text strong style={{ fontSize: 12, color: "#92400E" }}>
                      Preço especial: {formatPrice(specialPriceAvailable.specialPrice)} (-
                      {discountPercent}%)
                    </Text>
                  </Space>
                  {expanded ? (
                    <ChevronDown size={14} style={{ color: "#92400E" }} />
                  ) : (
                    <ChevronRight size={14} style={{ color: "#92400E" }} />
                  )}
                </div>
                {expanded && (
                  <div style={{ marginTop: 8 }}>
                    <Button
                      size="small"
                      type="primary"
                      icon={<Star size={12} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplySpecialPrice?.(item);
                      }}
                    >
                      Aplicar preço especial
                    </Button>
                  </div>
                )}
              </div>
            )}
            <Row align="middle" justify="space-between" style={{ width: "100%" }}>
              <Space>
                <InputNumber
                  min={1}
                  value={item.quantitySold}
                  onChange={(v) => updateSaleItemQuantity(item.id, v || 1)}
                  style={{ width: 70 }}
                />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  x {formatPrice(itemPrice)}
                </Text>
              </Space>
              <Text strong style={{ fontSize: 15 }}>
                {formatPrice(lineTotal)}
              </Text>
            </Row>
          </Space>
        }
      />
    </List.Item>
  );
};
