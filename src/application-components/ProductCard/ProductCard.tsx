import { ProductModel } from "@/model/product.model";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
} from "@/uperp/common/productFormulas";
import { Card, Image, Tag, Typography } from "antd";

const { Text } = Typography;

type ProductCardProps = {
  product: ProductModel;
  onClickProduct: (p: ProductModel) => void;
};

export const ProductCard = ({ product, onClickProduct }: ProductCardProps) => {
  const stock = calculeStockTotalByProductEspecification(product.productEspecifications);

  return (
    <Card
      size="small"
      hoverable={stock > 0}
      styles={{ body: { padding: 12 } }}
      onClick={() => onClickProduct(product)}
      style={{
        opacity: stock > 0 ? 1 : 0.5,
      }}
    >
      {product.productPicture ? (
        <Image width="100%" src={product.productPicture} preview={false} />
      ) : (
        <div
          style={{
            aspectRatio: "1 / 1",
            width: "100%",
            borderRadius: 8,
            background: "linear-gradient(135deg, #fff3e8, #ffe0c2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            fontWeight: 700,
            color: "#F26B1F",
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
        <Text strong style={{ color: "#F26B1F" }}>
          {calculeSalePriceRange(product.productEspecifications)}
        </Text>
        <Tag color={stock > 5 ? "green" : stock > 0 ? "orange" : "red"} style={{ margin: 0 }}>
          {stock}
        </Tag>
      </div>
    </Card>
  );
};
