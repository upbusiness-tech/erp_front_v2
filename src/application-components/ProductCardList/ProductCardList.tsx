import { ProductModel } from "@/model/product.model";
import { ProductCard } from "@/application-components/ProductCard/ProductCard";
import { Col, Empty, Pagination, Row, Spin } from "antd";

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
}: ProductCardListProps) => {
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

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <Row gutter={[12, 12]}>
          {products.map((p) => (
            <Col key={p.id} xs={12} sm={8} md={6}>
              <ProductCard product={p} onClickProduct={onClickProduct} />
            </Col>
          ))}
          {products.length === 0 && <Empty style={{ width: "100%", padding: 32 }} />}
        </Row>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 16 }}>
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
