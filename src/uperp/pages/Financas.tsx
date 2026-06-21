import { Card, Row, Col, Statistic, Table, Typography, Progress } from "antd";
import { TrendingUp, DollarSign, ShoppingBag, Award } from "lucide-react";
import { useStore } from "../store";

const { Title, Text } = Typography;

export function Financas() {
  const { sales, products } = useStore();

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalSales = sales.length;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // mock top products
  const topProducts = products
    .slice(0, 5)
    .map((p) => ({ ...p, sold: Math.floor(Math.random() * 80 + 20) }))
    .sort((a, b) => b.sold - a.sold);
  const maxSold = topProducts[0]?.sold || 1;

  // mock weekly chart
  const weekData = [
    { d: "Seg", v: 1200 },
    { d: "Ter", v: 1850 },
    { d: "Qua", v: 980 },
    { d: "Qui", v: 2400 },
    { d: "Sex", v: 3100 },
    { d: "Sáb", v: 4200 },
    { d: "Dom", v: 1700 },
  ];
  const maxV = Math.max(...weekData.map((d) => d.v));

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Receita total" value={totalRevenue} precision={2} prefix={<DollarSign size={18} />} valueStyle={{ color: "#16A34A" }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Vendas" value={totalSales} prefix={<ShoppingBag size={18} />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Ticket médio" value={avgTicket} precision={2} prefix={<TrendingUp size={18} />} valueStyle={{ color: "#F26B1F" }} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Lucro estimado" value={totalRevenue * 0.32} precision={2} prefix={<Award size={18} />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="Vendas na semana" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 220, padding: "8px 0" }}>
              {weekData.map((d) => (
                <div key={d.d} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      height: `${(d.v / maxV) * 180}px`,
                      background: "linear-gradient(180deg, #F26B1F, #ffb27a)",
                      borderRadius: 6,
                      transition: "all .3s",
                    }}
                    title={`R$ ${d.v}`}
                  />
                  <Text style={{ fontSize: 12 }}>{d.d}</Text>
                  <div style={{ fontSize: 11, color: "#888" }}>R$ {d.v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Histórico de Vendas">
            <Table
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              dataSource={sales}
              columns={[
                { title: "ID", dataIndex: "id" },
                { title: "Data", dataIndex: "date" },
                { title: "Tipo", dataIndex: "type", render: (t) => (t === "balcao" ? "Balcão" : "Serviço") },
                { title: "Itens", dataIndex: "items" },
                {
                  title: "Total",
                  dataIndex: "total",
                  render: (v: number) => <strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</strong>,
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Produtos mais vendidos">
            {topProducts.map((p) => (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text strong>{p.name}</Text>
                  <Text type="secondary">{p.sold} un.</Text>
                </div>
                <Progress
                  percent={Math.round((p.sold / maxSold) * 100)}
                  showInfo={false}
                  strokeColor="#F26B1F"
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </>
  );
}
