import { ProductExpandedViewModel } from "@/model/product.model";
import { extractStockFormatByUnit, formatPrice } from "@/uperp/common/formulas/productFormulas";
import { Card, Col, Empty, Grid, Image, Pagination, Row, Spin, Tag, Typography } from "antd";
import { useState } from "react";
import { BRAND, BRAND_GRADIENT_END, BRAND_SOFT_ALT } from "@/theme/colors";

const { Text } = Typography;
const { useBreakpoint } = Grid;

const DEFAULT_PAGE_SIZE_OPTIONS = [8, 12, 16, 24];

type ExpandedProductCardProps = {
  product: ProductExpandedViewModel;
  onClickProduct?: (p: ProductExpandedViewModel) => void;
  fitToHeight?: boolean;
};

export const ExpandedProductCard = ({
  product,
  onClickProduct,
  fitToHeight = false,
}: ExpandedProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const stock = product.stockQuantity;
  const isClickable = !!onClickProduct;
  const canHover = isClickable && stock > 0;
  const priceLabel = formatPrice(product.salePrice);
  const stockLabel = extractStockFormatByUnit(product.unitOfMeasure, stock);
  const rowId = product.code || `#${product.productEspecificationId}`;

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
            {product.productName.charAt(0)}
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
            {product.productName}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {rowId}
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
              {priceLabel}
            </Text>
            <Tag color={stock > 5 ? "green" : stock > 0 ? "orange" : "red"} style={{ margin: 0 }}>
              {stockLabel}
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
          {product.productName.charAt(0)}
        </div>
      )}
      <Text strong style={{ display: "block", fontSize: 13 }}>
        {product.productName}
      </Text>
      <Text type="secondary" style={{ fontSize: 11 }}>
        {rowId}
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
          {priceLabel}
        </Text>
        <Tag color={stock > 5 ? "green" : stock > 0 ? "orange" : "red"} style={{ margin: 0 }}>
          {stockLabel}
        </Tag>
      </div>
    </Card>
  );
};

type ExpandedProductCardListProps = {
  products: ProductExpandedViewModel[];
  total?: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onClickProduct?: (p: ProductExpandedViewModel) => void;
  pageSizeOptions?: number[];
  fitToHeight?: boolean;
};

export const ExpandedProductCardList = ({
  products,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onClickProduct,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  fitToHeight = false,
}: ExpandedProductCardListProps) => {
  const screens = useBreakpoint();

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <Spin />
      </div>
    );
  }

  if (fitToHeight) {
    const cols = screens.md ? 4 : screens.sm ? 3 : 2;
    const rows = Math.ceil(products.length / cols);

    return (
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "grid",
            gap: 12,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: rows > 1 ? `repeat(${rows}, minmax(0, 1fr))` : "auto",
          }}
        >
          {products.map((p) => (
            <ExpandedProductCard
              key={p.productEspecificationId}
              product={p}
              onClickProduct={onClickProduct}
              fitToHeight
            />
          ))}
          {products.length === 0 && (
            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center" }}>
              <Empty style={{ width: "100%", padding: 32 }} />
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 16,
            flexShrink: 0,
          }}
        >
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total ?? products.length}
            showSizeChanger
            align="start"
            pageSizeOptions={pageSizeOptions}
            onChange={(p) => onPageChange(p)}
            onShowSizeChange={(_, size) => onPageSizeChange(size)}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          paddingRight: 8,
          marginRight: -8,
        }}
      >
        <Row gutter={[12, 12]}>
          {products.map((p) => (
            <Col key={p.productEspecificationId} xs={12} sm={8} md={6}>
              <ExpandedProductCard product={p} onClickProduct={onClickProduct} />
            </Col>
          ))}
          {products.length === 0 && <Empty style={{ width: "100%", padding: 32 }} />}
        </Row>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginTop: 16,
          flexShrink: 0,
        }}
      >
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total ?? products.length}
          showSizeChanger
          align="start"
          pageSizeOptions={pageSizeOptions}
          onChange={(p) => onPageChange(p)}
          onShowSizeChange={(_, size) => onPageSizeChange(size)}
        />
      </div>
    </div>
  );
};
