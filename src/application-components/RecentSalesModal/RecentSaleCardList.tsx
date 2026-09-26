import { SaleModel } from "@/model/sale.model";
import { Card, Col, Empty, Pagination, Row, Skeleton } from "antd";
import { RecentSaleCard } from "./RecentSaleCard";

type RecentSaleCardListProps = {
  data: SaleModel[];
  total?: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading: boolean;
  onRowClick?: (sale: SaleModel) => void;
  onView: (sale: SaleModel) => void;
  showItemCount?: boolean;
  showPayments?: boolean;
};

export const RecentSaleCardList = ({
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  onRowClick,
  onView,
  showItemCount = false,
  showPayments = false,
}: RecentSaleCardListProps) => {
  if (isLoading) {
    return (
      <Row gutter={[12, 12]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Col xs={24} sm={12} key={i}>
            <Card size="small" styles={{ body: { padding: 12 } }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (!data || data.length === 0) {
    return <Empty description="Nenhuma venda registrada" />;
  }

  return (
    <div>
      <Row gutter={[12, 12]}>
        {data.map((sale) => (
          <Col xs={24} sm={12} key={sale.id}>
            <RecentSaleCard
              sale={sale}
              onClick={onRowClick}
              onView={onView}
              showItemCount={showItemCount}
              showPayments={showPayments}
            />
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total ?? data.length}
          onChange={onPageChange}
          onShowSizeChange={(_, size) => onPageSizeChange(size)}
          pageSizeOptions={["6", "12", "24"]}
          showSizeChanger
          showTotal={(t) => `${t} venda${t !== 1 ? "s" : ""}`}
          size="small"
        />
      </div>
    </div>
  );
};
