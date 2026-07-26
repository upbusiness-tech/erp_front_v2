import { Card, Col, Empty, Progress, Row, Space, Statistic, Typography } from "antd";

import {
  AlertCircle,
  AlertTriangle,
  DollarSign,
  Package,
  RefreshCcw,
  Star,
  TrendingUp,
} from "lucide-react";
import { useStore } from "../../../../../../store";
const { Text } = Typography;

export const StockStatsOverview = () => {
  const { products, sales } = useStore();

  // Compute sold quantities per product name from sale lines (fallback to random for mock lines)
  const soldByName = new Map<string, number>();
  sales.forEach((s) =>
    s.lines?.forEach((l) => soldByName.set(l.name, (soldByName.get(l.name) || 0) + l.qty)),
  );

  const enriched = products.map((p) => {
    const sold = soldByName.get(p.name) ?? Math.floor((Math.abs(hashCode(p.id)) % 60) + 5);
    const turnover = p.stock > 0 ? sold / p.stock : sold;
    const revenue = sold * p.price;
    return { ...p, sold, turnover, revenue };
  });

  const topSold = [...enriched].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const topRevenue = [...enriched].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const topTurnover = [...enriched].sort((a, b) => b.turnover - a.turnover).slice(0, 5);
  const lowStock = enriched
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);
  const dead = enriched.filter((p) => p.sold === 0).slice(0, 5);

  const totalSold = enriched.reduce((s, p) => s + p.sold, 0);
  const totalRevenue = enriched.reduce((s, p) => s + p.revenue, 0);
  const bestSeller = topSold[0];

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Unidades vendidas (estim.)"
              value={totalSold}
              prefix={<Package size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Faturamento por produtos"
              value={totalRevenue}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#F26B1F" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Produto destaque
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Star size={20} color="#F26B1F" />
              <div>
                <Text strong style={{ display: "block", fontSize: 13 }}>
                  {bestSeller?.name || "—"}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {bestSeller?.sold || 0} un. vendidas
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Sem giro"
              value={dead.length}
              prefix={<AlertCircle size={16} />}
              valueStyle={{ color: dead.length > 0 ? "#DC2626" : undefined }}
            />
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
            <RankList
              items={topSold.map((p) => ({
                label: p.name,
                sub: `${p.sold} un.`,
                value: p.sold,
                max: topSold[0]?.sold || 1,
              }))}
            />
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
            <RankList
              items={topRevenue.map((p) => ({
                label: p.name,
                sub: `R$ ${p.revenue.toFixed(2)}`,
                value: p.revenue,
                max: topRevenue[0]?.revenue || 1,
              }))}
              color="#F26B1F"
            />
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
            <RankList
              items={topTurnover.map((p) => ({
                label: p.name,
                sub: `Giro ${p.turnover.toFixed(1)}x`,
                value: p.turnover,
                max: topTurnover[0]?.turnover || 1,
              }))}
              color="#2563EB"
            />
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
            {lowStock.length === 0 ? (
              <Empty
                description="Nenhum produto com estoque crítico"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <RankList
                items={lowStock.map((p) => ({
                  label: p.name,
                  sub: `${p.stock} em estoque`,
                  value: 6 - Math.min(p.stock, 5),
                  max: 6,
                }))}
                color="#DC2626"
              />
            )}
          </Card>
        </Col>
      </Row>
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

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
