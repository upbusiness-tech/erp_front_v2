import { PeriodSelector } from "@/application-components/PeriodSelector/PeriodSelector";
import { Card, Col, Empty, Progress, Row, Space, Typography } from "antd";
import { Layers } from "lucide-react";
import { useStockCategoryStatsController } from "./useStockCategoryStats.controller";

const { Text } = Typography;

export const StockCategoryStats = () => {
  const { period, categoriesStats, handlePeriodChange, isLoading } =
    useStockCategoryStatsController();

  const containerStyle = isLoading ? { opacity: 0.6, transition: "opacity 0.2s" } : {};

  return (
    <Card
      style={{ marginBottom: 16 }}
      title={
        <Space>
          <Layers size={16} /> Estatisticas de Categorias
        </Space>
      }
    >
      <PeriodSelector period={period} onChange={handlePeriodChange} />

      <div style={containerStyle}>
        {/* <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Card>
              <Statistic
                title="Categoria mais vendida"
                value={topCategory?.categoryName || "—"}
                prefix={<Crown size={16} color="#F26B1F" />}
                valueStyle={{ fontSize: 18, color: "#F26B1F" }}
              />
              {topCategory && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {topCategory.totalSold} unidades vendidas no periodo
                </Text>
              )}
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Total de unidades"
                value={totalSold}
                prefix={<TrendingUp size={16} />}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Faturamento por categorias"
                value={totalRevenue}
                precision={2}
                prefix="R$"
                valueStyle={{ color: "#F26B1F" }}
              />
            </Card>
          </Col>
        </Row> */}

        {categoriesStats?.length === 0 ? (
          <Empty description="Nenhuma categoria encontrada" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Row gutter={[16, 16]}>
            {categoriesStats?.map((cat) => {
              return (
                <Col key={cat.categoryId} xs={24} sm={12} md={8}>
                  <div
                    style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}
                  >
                    <Space size={6}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: cat.categoryColor,
                        }}
                      />
                      <Text strong>{cat.categoryName}</Text>
                    </Space>
                    {/* <Text type="secondary">{cat.unitsSold}</Text> */}
                  </div>
                  <Progress
                    percent={cat.percentage}
                    strokeColor={cat.categoryColor}
                    showInfo={false}
                  />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    R$ {cat.revenue.toFixed(2)} · {cat.percentage}% das vendas
                  </Text>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </Card>
  );
};
