import {
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
  message,
} from "antd";
import { useEffect } from "react";

import { PeriodSelector } from "@/application-components/PeriodSelector/PeriodSelector";
import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import type { ProductDashboardResponse } from "@/types/productDashboard";
import dayjs from "dayjs";
import {
  AlertCircle,
  AlertTriangle,
  DollarSign,
  Package,
  RefreshCcw,
  Star,
  TrendingUp,
} from "lucide-react";
import { ProductDashboardService } from "@/services/productDashboard.service";

const { Text } = Typography;

const productDashboardService = new ProductDashboardService("product-dashboard");
export const StockStatsOverview = () => {
  const { period, setPreset, setCustomRange } = useDashboardPeriod("this_month");

  const { data, isLoading, isFetching, isError, error } =
    useGetAllWithParams<ProductDashboardResponse>(productDashboardService, undefined, {
      queryParams: {
        from: period.from,
        to: period.to,
        limit: "5",
      },
    });

  useEffect(() => {
    if (isError && error) {
      message.error("Erro ao carregar dados do dashboard de produtos.");
    }
  }, [isError, error]);

  const handlePeriodChange = (next: typeof period) => {
    if (next.preset === "custom") {
      setPreset("custom");
      setCustomRange(dayjs(next.from), dayjs(next.to));
    } else {
      setPreset(next.preset);
    }
  };

  const containerStyle = isFetching && data ? { opacity: 0.6, transition: "opacity 0.2s" } : {};

  const summary = data?.summary;
  const rankings = data?.rankings;

  return (
    <>
      <PeriodSelector period={period} onChange={handlePeriodChange} />

      <div style={containerStyle}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} md={6}>
            <Card>
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title="Unidades vendidas"
                  value={summary?.unitsSold ?? 0}
                  prefix={<Package size={16} />}
                />
              )}
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title="Faturamento por produtos"
                  value={summary?.revenue ?? 0}
                  precision={2}
                  prefix="R$"
                  valueStyle={{ color: "#F26B1F" }}
                />
              )}
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Produto destaque
                  </Text>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <Star size={20} color="#F26B1F" />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 13 }}>
                        {summary?.featuredProduct?.productName || "—"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {summary?.featuredProduct?.quantitySold ?? 0} un. vendidas
                      </Text>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 1 }} />
              ) : (
                <Statistic
                  title="Sem giro"
                  value={summary?.zeroStockProducts ?? 0}
                  prefix={<AlertCircle size={16} />}
                  valueStyle={{
                    color: (summary?.zeroStockProducts ?? 0) > 0 ? "#DC2626" : undefined,
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <TrendingUp size={16} color="#16A34A" /> Mais vendidos
                </Space>
              }
            >
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <RankList
                  items={(rankings?.bestSelling ?? []).map((p) => ({
                    label: p.productName,
                    sub: `${p.quantitySold} un.`,
                    value: p.quantitySold,
                    max: rankings?.bestSelling[0]?.quantitySold || 1,
                  }))}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <DollarSign size={16} color="#F26B1F" /> Maior faturamento
                </Space>
              }
            >
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <RankList
                  items={(rankings?.highestRevenue ?? []).map((p) => ({
                    label: p.productName,
                    sub: `R$ ${p.revenue.toFixed(2)}`,
                    value: p.revenue,
                    max: rankings?.highestRevenue[0]?.revenue || 1,
                  }))}
                  color="#F26B1F"
                />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <RefreshCcw size={16} color="#2563EB" /> Maior giro
                </Space>
              }
            >
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                <RankList
                  items={(rankings?.highestTurnover ?? []).map((p) => ({
                    label: p.productName,
                    sub: `Giro ${p.turnover.toFixed(1)}x`,
                    value: p.turnover,
                    max: rankings?.highestTurnover[0]?.turnover || 1,
                  }))}
                  color="#2563EB"
                />
              )}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <AlertTriangle size={16} color="#DC2626" /> Reposição urgente
                </Space>
              }
            >
              {isLoading && !data ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (rankings?.urgentRestock ?? []).length === 0 ? (
                <Empty
                  description="Nenhum produto com estoque crítico"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <RankList
                  items={(rankings?.urgentRestock ?? []).map((p) => ({
                    label: p.productName,
                    sub: `${p.stockQuantity} em estoque`,
                    value: 6 - Math.min(p.stockQuantity, 5),
                    max: 6,
                  }))}
                  color="#DC2626"
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

function RankList({
  items,
  color = "#16A34A",
}: {
  items: { label: string; sub: string; value: number; max: number }[];
  color?: string;
}) {
  if (items.length === 0)
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem dados" />;
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Text strong style={{ fontSize: 13 }}>
              {i + 1}. {it.label}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {it.sub}
            </Text>
          </div>
          <Progress
            percent={Math.round((it.value / it.max) * 100)}
            showInfo={false}
            strokeColor={color}
          />
        </div>
      ))}
    </div>
  );
}
