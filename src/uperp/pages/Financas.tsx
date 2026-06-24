import { useMemo, useState } from "react";
import { Card, Row, Col, Statistic, Table, Typography, Progress, Tabs, Tag, Space, Select, DatePicker, Input, Button } from "antd";
import { TrendingUp, DollarSign, ShoppingBag, Award, Search, Download } from "lucide-react";
import { useStore } from "../store";
import { PAYMENT_LABEL, type PaymentMethod, type Sale } from "../types";
import dayjs, { type Dayjs } from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export function Financas() {
  const { sales, products, customers } = useStore();

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalSales = sales.length;
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const topProducts = products
    .slice(0, 5)
    .map((p) => ({ ...p, sold: Math.floor(Math.random() * 80 + 20) }))
    .sort((a, b) => b.sold - a.sold);
  const maxSold = topProducts[0]?.sold || 1;

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

  const Estatisticas = (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><Card><Statistic title="Receita total" value={totalRevenue} precision={2} prefix={<DollarSign size={18} />} valueStyle={{ color: "#16A34A" }} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Vendas" value={totalSales} prefix={<ShoppingBag size={18} />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Ticket médio" value={avgTicket} precision={2} prefix={<TrendingUp size={18} />} valueStyle={{ color: "#F26B1F" }} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Lucro estimado" value={totalRevenue * 0.32} precision={2} prefix={<Award size={18} />} /></Card></Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="Vendas na semana">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 220, padding: "8px 0" }}>
              {weekData.map((d) => (
                <div key={d.d} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      height: `${(d.v / maxV) * 180}px`,
                      background: "linear-gradient(180deg, #F26B1F, #ffb27a)",
                      borderRadius: 6,
                    }}
                    title={`R$ ${d.v}`}
                  />
                  <Text style={{ fontSize: 12 }}>{d.d}</Text>
                  <div style={{ fontSize: 11, color: "#888" }}>R$ {d.v}</div>
                </div>
              ))}
            </div>
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
                <Progress percent={Math.round((p.sold / maxSold) * 100)} showInfo={false} strokeColor="#F26B1F" />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <Tabs
      defaultActiveKey="stats"
      items={[
        { key: "stats", label: "Estatísticas", children: Estatisticas },
        { key: "history", label: "Histórico de Vendas", children: <SalesHistory sales={sales} customers={customers} /> },
      ]}
    />
  );
}

function SalesHistory({ sales, customers }: { sales: Sale[]; customers: ReturnType<typeof useStore>["customers"] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "balcao" | "servico">("all");
  const [method, setMethod] = useState<"all" | PaymentMethod>("all");
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      if (search && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (type !== "all" && s.type !== type) return false;
      if (method !== "all" && !s.payments?.some((p) => p.method === method)) return false;
      if (range) {
        const d = dayjs(s.date);
        if (d.isBefore(range[0], "day") || d.isAfter(range[1], "day")) return false;
      }
      return true;
    });
  }, [sales, search, type, method, range]);

  const totalFiltered = filtered.reduce((s, x) => s + x.total, 0);

  const byMethod = filtered.reduce<Record<string, number>>((acc, s) => {
    s.payments?.forEach((p) => {
      acc[p.method] = (acc[p.method] || 0) + p.value;
    });
    return acc;
  }, {});

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><Card><Statistic title="Vendas filtradas" value={filtered.length} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Total filtrado" value={totalFiltered} precision={2} prefix="R$" valueStyle={{ color: "#F26B1F" }} /></Card></Col>
        <Col xs={24} md={12}>
          <Card>
            <Text type="secondary" style={{ fontSize: 12 }}>Recebido por forma de pagamento</Text>
            <Space wrap style={{ marginTop: 8 }}>
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
                <Tag key={m} color="orange" style={{ padding: "4px 8px" }}>
                  {PAYMENT_LABEL[m]}: <strong>R$ {(byMethod[m] || 0).toFixed(2)}</strong>
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title="Histórico de Vendas Detalhado"
        extra={<Button icon={<Download size={14} />}>Exportar</Button>}
      >
        <Row gutter={8} style={{ marginBottom: 12 }}>
          <Col xs={24} md={6}>
            <Input
              placeholder="Buscar ID..."
              prefix={<Search size={14} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              value={type}
              onChange={setType}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "Todos os tipos" },
                { value: "balcao", label: "Balcão" },
                { value: "servico", label: "Serviço" },
              ]}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              value={method}
              onChange={setMethod}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "Todos os pagamentos" },
                ...(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => ({ value: m, label: PAYMENT_LABEL[m] })),
              ]}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              value={range as never}
              onChange={(v) => setRange(v ? [v[0]!, v[1]!] : null)}
            />
          </Col>
        </Row>

        <Table
          rowKey="id"
          size="small"
          dataSource={filtered}
          pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: [8, 16, 32] }}
          expandable={{
            expandedRowRender: (s) => (
              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>Pagamentos:</Text>
                <Space wrap>
                  {s.payments?.length ? s.payments.map((p, i) => (
                    <Tag key={i} color="orange">{PAYMENT_LABEL[p.method]}: R$ {p.value.toFixed(2)}</Tag>
                  )) : <Text type="secondary">—</Text>}
                </Space>
              </Space>
            ),
          }}
          columns={[
            { title: "ID", dataIndex: "id", width: 90 },
            { title: "Data", dataIndex: "date", width: 110 },
            {
              title: "Tipo",
              dataIndex: "type",
              width: 100,
              render: (t: string) => (
                <Tag color={t === "balcao" ? "orange" : "blue"}>{t === "balcao" ? "Balcão" : "Serviço"}</Tag>
              ),
            },
            {
              title: "Cliente",
              dataIndex: "customerId",
              render: (id?: string) => customers.find((c) => c.id === id)?.name || "—",
            },
            { title: "Itens", dataIndex: "items", width: 70 },
            {
              title: "Pagamentos",
              render: (_, s) =>
                s.payments?.length ? (
                  <Space size={4} wrap>
                    {s.payments.map((p, i) => (
                      <Tag key={i} style={{ margin: 0 }}>{PAYMENT_LABEL[p.method]}</Tag>
                    ))}
                  </Space>
                ) : "—",
            },
            {
              title: "Total",
              dataIndex: "total",
              width: 110,
              render: (v: number) => <strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</strong>,
            },
          ]}
        />
      </Card>
    </>
  );
}
