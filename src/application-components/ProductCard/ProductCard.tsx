import { useState } from "react";
import { ProductModel } from "@/model/product.model";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
  showStockTotalByProductEspecification,
} from "@/uperp/common/formulas/productFormulas";
import { Card, Image, Tag, Typography } from "antd";
import { BRAND, BRAND_GRADIENT_END, BRAND_SOFT_ALT } from "@/theme/colors";

const { Text } = Typography;

type ProductCardProps = {
  product: ProductModel;
  onClickProduct?: (p: ProductModel) => void;
  fitToHeight?: boolean;
};

export const ProductCard = ({ product, onClickProduct, fitToHeight = false }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const stock = calculeStockTotalByProductEspecification(product.productEspecifications);
  const isClickable = !!onClickProduct;
  const canHover = isClickable && stock > 0;

  if (fitToHeight) {
    return (
      <Card
        size="small"
        hoverable={false}
        styles={{
          body: { padding: 12, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
        }}
        onClick={() => onClickProduct?.(product)}
        onMouseEnter={() => canHover && setIsHovered(true)}
        onMouseLeave={() => canHover && setIsHovered(false)}
        style={{
          opacity: stock > 0 ? 1 : 0.5,
          cursor: isClickable ? "pointer" : "default",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          transition: "transform 0.15s ease",
          transform: isHovered ? "scale(1.02)" : "scale(1)",
          zIndex: isHovered ? 10 : "auto",
        }}
      >
        {product.productPicture ? (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 10,
              display: "flex",
            }}
          >
            <Image
              width="100%"
              height="100%"
              src={product.productPicture}
              preview={false}
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              borderRadius: 8,
              background: `linear-gradient(135deg, ${BRAND_SOFT_ALT}, ${BRAND_GRADIENT_END})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
              fontWeight: 700,
              color: BRAND,
              fontSize: 32,
            }}
          >
            {product.name.charAt(0)}
          </div>
        )}
        <div style={{ flexShrink: 0 }}>
          <Text
            strong
            style={{
              display: "block",
              fontSize: 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {product.id}
          </Text>
          <div
            style={{
              marginTop: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong style={{ color: BRAND }}>
              {calculeSalePriceRange(product.productEspecifications)}
            </Text>
            <Tag color={stock > 5 ? "green" : stock > 0 ? "orange" : "red"} style={{ margin: 0 }}>
              {showStockTotalByProductEspecification(product, product.productEspecifications)}
            </Tag>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      hoverable={false}
      styles={{ body: { padding: 12 } }}
      onClick={() => onClickProduct?.(product)}
      onMouseEnter={() => canHover && setIsHovered(true)}
      onMouseLeave={() => canHover && setIsHovered(false)}
      style={{
        opacity: stock > 0 ? 1 : 0.5,
        cursor: isClickable ? "pointer" : "default",
        position: "relative",
        transition: "transform 0.15s ease",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        zIndex: isHovered ? 10 : "auto",
      }}
    >
      {product.productPicture ? (
        <div
          style={{
            aspectRatio: "1 / 1",
            width: "100%",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <Image
            width="100%"
            height="100%"
            src={product.productPicture}
            preview={false}
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : (
        <div
          style={{
            aspectRatio: "1 / 1",
            width: "100%",
            borderRadius: 8,
            background: `linear-gradient(135deg, ${BRAND_SOFT_ALT}, ${BRAND_GRADIENT_END})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            fontWeight: 700,
            color: BRAND,
            fontSize: 32,
          }}
        >
          {product.name.charAt(0)}
        </div>
      )}
      <Text strong style={{ display: "block", fontSize: 13 }}>
        {product.name}
      </Text>
      <Text type="secondary" style={{ fontSize: 11 }}>
        {product.id}
      </Text>
      <div
        style={{
          marginTop: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong style={{ color: BRAND }}>
          {calculeSalePriceRange(product.productEspecifications)}
        </Text>
        <Tag color={stock > 5 ? "green" : stock > 0 ? "orange" : "red"} style={{ margin: 0 }}>
          {showStockTotalByProductEspecification(product, product.productEspecifications)}
        </Tag>
      </div>
    </Card>
  );
};
