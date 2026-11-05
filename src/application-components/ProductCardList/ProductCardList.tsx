import { ProductModel } from "@/model/product.model";
import { ProductCard } from "@/application-components/ProductCard/ProductCard";
import { Col, Empty, Grid, Pagination, Row, Spin } from "antd";

const { useBreakpoint } = Grid;

type ProductCardListProps = {
  products: ProductModel[];
  total?: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onClickProduct?: (p: ProductModel) => void;
  pageSizeOptions?: number[];
  fitToHeight?: boolean;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [8, 12, 16, 24];

export const ProductCardList = ({
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
}: ProductCardListProps) => {
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
    // Determinar número de colunas baseado no breakpoint
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
            <ProductCard key={p.id} product={p} onClickProduct={onClickProduct} fitToHeight />
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
            <Col key={p.id} xs={12} sm={8} md={6}>
              <ProductCard product={p} onClickProduct={onClickProduct} />
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
