import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  List,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
  Award,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Lock,
  LockOpen,
  Plus,
  Search,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "../../../../store";
import {
  PAYMENT_LABEL,
  type CashMovementType,
  type ClosedCashSession,
  type PaymentMethod,
  type Sale,
} from "../../../../types";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  pix: "#16A34A",
  debito: "#2563EB",
  credito: "#F26B1F",
  dinheiro: "#7C3AED",
};

export function FinanceBase() {
  const { sales, products, customers, cashHistory } = useStore();

  const today = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter((s) => s.date === today);
  const todayRevenue = todaySales.reduce((s, x) => s + x.total, 0);
  const todayCount = todaySales.length;
  const todayAvg = todayCount > 0 ? todayRevenue / todayCount : 0;

  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);

  const paymentTotals = useMemo(() => {
    const acc: Record<PaymentMethod, number> = { pix: 0, debito: 0, credito: 0, dinheiro: 0 };
    sales.forEach((s) => s.payments?.forEach((p) => (acc[p.method] += p.value)));
    return acc;
  }, [sales]);

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

  const PaymentBadges = (
    <Card style={{ marginBottom: 16 }} styles={{ body: { padding: 12 } }}>
      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} md={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Recebido por método (geral)
          </Text>
        </Col>
        {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
          <Col xs={12} md={5} key={m}>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${PAYMENT_COLORS[m]}22`,
                background: `${PAYMENT_COLORS[m]}0d`,
              }}
            >
              <Text style={{ fontSize: 11, color: PAYMENT_COLORS[m], fontWeight: 600 }}>
                {PAYMENT_LABEL[m]}
              </Text>
              <div style={{ fontWeight: 700, fontSize: 15 }}>R$ {paymentTotals[m].toFixed(2)}</div>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );

  const StatCard = ({
    title,
    value,
    prefix,
    color,
    precision = 2,
  }: {
    title: string;
    value: number;
    prefix?: React.ReactNode;
    color?: string;
    precision?: number;
  }) => (
    <Card>
      <Space size={4} style={{ marginBottom: 4 }}>
        <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>
          HOJE
        </Tag>
      </Space>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        prefix={prefix}
        valueStyle={color ? { color } : undefined}
      />
    </Card>
  );

  const Estatisticas = (
    <>
      {PaymentBadges}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <StatCard
            title="Receita"
            value={todayRevenue}
            prefix={<DollarSign size={18} />}
            color="#16A34A"
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Vendas"
            value={todayCount}
            precision={0}
            prefix={<ShoppingBag size={18} />}
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Ticket médio"
            value={todayAvg}
            prefix={<TrendingUp size={18} />}
            color="#F26B1F"
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Lucro estimado"
            value={todayRevenue * 0.32}
            prefix={<Award size={18} />}
          />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Receita acumulada (total)"
              value={totalRevenue}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#0F172A" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total de vendas"
              value={sales.length}
              prefix={<ShoppingBag size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Clientes atendidos"
              value={new Set(sales.map((s) => s.customerId).filter(Boolean)).size}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="Vendas na semana">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                height: 220,
                padding: "8px 0",
              }}
            >
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

  return (
    <Tabs
      defaultActiveKey="stats"
      items={[
        { key: "stats", label: "Estatísticas", children: Estatisticas },
        {
          key: "history",
          label: "Histórico de Vendas",
          children: <SalesHistory sales={sales} customers={customers} />,
        },
        {
          key: "cash",
          label: "Histórico de Caixas",
          children: <CashHistory history={cashHistory} sales={sales} />,
        },
        { key: "reports", label: "Relatórios", children: <Reports /> },
      ]}
    />
  );
}

function SalesHistory({
  sales,
  customers,
}: {
  sales: Sale[];
  customers: ReturnType<typeof useStore>["customers"];
}) {
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
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Vendas filtradas" value={filtered.length} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Total filtrado"
              value={totalFiltered}
              precision={2}
              prefix="R$"
              valueStyle={{ color: "#F26B1F" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Recebido por forma de pagamento
            </Text>
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
                ...(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => ({
                  value: m,
                  label: PAYMENT_LABEL[m],
                })),
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
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Pagamentos:
                </Text>
                <Space wrap>
                  {s.payments?.length ? (
                    s.payments.map((p, i) => (
                      <Tag key={i} color="orange">
                        {PAYMENT_LABEL[p.method]}: R$ {p.value.toFixed(2)}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">—</Text>
                  )}
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
                <Tag color={t === "balcao" ? "orange" : "blue"}>
                  {t === "balcao" ? "Balcão" : "Serviço"}
                </Tag>
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
                      <Tag key={i} style={{ margin: 0 }}>
                        {PAYMENT_LABEL[p.method]}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  "—"
                ),
            },
            {
              title: "Total",
              dataIndex: "total",
              width: 110,
              render: (v: number) => (
                <strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</strong>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}

interface ReportEntry {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  frequency: "semanal" | "mensal" | "anual";
  totalRevenue: number;
  totalSales: number;
}

const initialReports: ReportEntry[] = [
  {
    id: "R-2026-W28",
    title: "Relatório Semanal",
    period: "13/07 a 19/07/2026",
    generatedAt: "2026-07-19",
    frequency: "semanal",
    totalRevenue: 15420.5,
    totalSales: 84,
  },
  {
    id: "R-2026-W27",
    title: "Relatório Semanal",
    period: "06/07 a 12/07/2026",
    generatedAt: "2026-07-12",
    frequency: "semanal",
    totalRevenue: 12980.3,
    totalSales: 71,
  },
  {
    id: "R-2026-06",
    title: "Relatório Mensal",
    period: "Junho/2026",
    generatedAt: "2026-07-01",
    frequency: "mensal",
    totalRevenue: 58200.9,
    totalSales: 312,
  },
  {
    id: "R-2026-05",
    title: "Relatório Mensal",
    period: "Maio/2026",
    generatedAt: "2026-06-01",
    frequency: "mensal",
    totalRevenue: 51840.2,
    totalSales: 287,
  },
  {
    id: "R-2025-ANUAL",
    title: "Relatório Anual",
    period: "2025",
    generatedAt: "2026-01-05",
    frequency: "anual",
    totalRevenue: 612300,
    totalSales: 3450,
  },
];

function Reports() {
  const [reports, setReports] = useState<ReportEntry[]>(initialReports);
  const [filter, setFilter] = useState<"all" | "semanal" | "mensal" | "anual">("all");

  const filtered = reports.filter((r) => filter === "all" || r.frequency === filter);
  const groups = {
    semanal: reports.filter((r) => r.frequency === "semanal").length,
    mensal: reports.filter((r) => r.frequency === "mensal").length,
    anual: reports.filter((r) => r.frequency === "anual").length,
  };

  const generateNew = (freq: ReportEntry["frequency"]) => {
    const id = `R-${Date.now().toString().slice(-6)}`;
    const entry: ReportEntry = {
      id,
      title:
        freq === "semanal"
          ? "Relatório Semanal"
          : freq === "mensal"
            ? "Relatório Mensal"
            : "Relatório Anual",
      period: freq === "semanal" ? "Semana atual" : freq === "mensal" ? "Mês atual" : "Ano atual",
      generatedAt: new Date().toISOString().slice(0, 10),
      frequency: freq,
      totalRevenue: Math.floor(Math.random() * 20000 + 5000),
      totalSales: Math.floor(Math.random() * 100 + 20),
    };
    setReports((r) => [entry, ...r]);
  };

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Relatórios semanais"
              value={groups.semanal}
              prefix={<Calendar size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Relatórios mensais"
              value={groups.mensal}
              prefix={<Calendar size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Relatórios anuais"
              value={groups.anual}
              prefix={<Calendar size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Gerar novo
            </Text>
            <Space wrap style={{ marginTop: 6 }}>
              <Button size="small" icon={<Plus size={12} />} onClick={() => generateNew("semanal")}>
                Semanal
              </Button>
              <Button size="small" icon={<Plus size={12} />} onClick={() => generateNew("mensal")}>
                Mensal
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title="Histórico de Relatórios"
        extra={
          <Select
            value={filter}
            onChange={setFilter}
            style={{ width: 160 }}
            options={[
              { value: "all", label: "Todas frequências" },
              { value: "semanal", label: "Semanais" },
              { value: "mensal", label: "Mensais" },
              { value: "anual", label: "Anuais" },
            ]}
          />
        }
      >
        {filtered.length === 0 ? (
          <Empty description="Nenhum relatório encontrado" />
        ) : (
          <List
            dataSource={filtered}
            renderItem={(r) => (
              <List.Item
                actions={[
                  <Button key="d" size="small" icon={<Download size={12} />}>
                    Baixar
                  </Button>,
                  <Button key="v" size="small" type="link">
                    Visualizar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FileText size={22} color="#F26B1F" />}
                  title={
                    <Space>
                      <Text strong>{r.title}</Text>
                      <Tag
                        color={
                          r.frequency === "semanal"
                            ? "blue"
                            : r.frequency === "mensal"
                              ? "orange"
                              : "purple"
                        }
                      >
                        {r.frequency}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text style={{ fontSize: 12 }}>Período: {r.period}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Gerado em {r.generatedAt} · {r.totalSales} vendas · R${" "}
                        {r.totalRevenue.toFixed(2)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </>
  );
}
