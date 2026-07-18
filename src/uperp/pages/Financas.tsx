import { useMemo, useState } from "react";
import { Card, Row, Col, Statistic, Table, Typography, Progress, Tabs, Tag, Space, Select, DatePicker, Input, Button, Empty, List } from "antd";
import { TrendingUp, DollarSign, ShoppingBag, Award, Search, Download, Wallet, LockOpen, Lock, FileText, Calendar, Plus } from "lucide-react";
import { useStore } from "../store";
import { PAYMENT_LABEL, type CashMovementType, type ClosedCashSession, type PaymentMethod, type Sale } from "../types";
import dayjs, { type Dayjs } from "dayjs";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  pix: "#16A34A",
  debito: "#2563EB",
  credito: "#F26B1F",
  dinheiro: "#7C3AED",
};

export function Financas() {
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
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                R$ {paymentTotals[m].toFixed(2)}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );

  const StatCard = ({
    title, value, prefix, color, precision = 2,
  }: { title: string; value: number; prefix?: React.ReactNode; color?: string; precision?: number }) => (
    <Card>
      <Space size={4} style={{ marginBottom: 4 }}>
        <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>HOJE</Tag>
      </Space>
      <Statistic title={title} value={value} precision={precision} prefix={prefix} valueStyle={color ? { color } : undefined} />
    </Card>
  );

  const Estatisticas = (
    <>
      {PaymentBadges}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><StatCard title="Receita" value={todayRevenue} prefix={<DollarSign size={18} />} color="#16A34A" /></Col>
        <Col xs={12} md={6}><StatCard title="Vendas" value={todayCount} precision={0} prefix={<ShoppingBag size={18} />} /></Col>
        <Col xs={12} md={6}><StatCard title="Ticket médio" value={todayAvg} prefix={<TrendingUp size={18} />} color="#F26B1F" /></Col>
        <Col xs={12} md={6}><StatCard title="Lucro estimado" value={todayRevenue * 0.32} prefix={<Award size={18} />} /></Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Receita acumulada (total)" value={totalRevenue} precision={2} prefix="R$" valueStyle={{ color: "#0F172A" }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Total de vendas" value={sales.length} prefix={<ShoppingBag size={16} />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Clientes atendidos" value={new Set(sales.map((s) => s.customerId).filter(Boolean)).size} />
          </Card>
        </Col>
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
        { key: "cash", label: "Histórico de Caixas", children: <CashHistory history={cashHistory} sales={sales} /> },
        { key: "reports", label: "Relatórios", children: <Reports /> },
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

function CashHistory({ history, sales }: { history: ClosedCashSession[]; sales: Sale[] }) {
  const [selected, setSelected] = useState<ClosedCashSession | null>(history[0] || null);

  const totals = useMemo(() => {
    const sum = history.reduce(
      (acc, h) => {
        acc.vendas += h.totals.vendas;
        acc.sangrias += h.totals.sangrias;
        acc.entradas += h.totals.entradas + h.totals.reposicoes;
        return acc;
      },
      { vendas: 0, sangrias: 0, entradas: 0 },
    );
    return sum;
  }, [history]);

  const movementLabels: Record<CashMovementType, string> = {
    entrada: "Entrada",
    sangria: "Sangria",
    reposicao: "Reposição",
    venda: "Venda",
  };
  const movementColors: Record<CashMovementType, string> = {
    entrada: "blue",
    venda: "green",
    sangria: "red",
    reposicao: "purple",
  };

  const relatedSales = useMemo(() => {
    if (!selected) return [];
    return sales.filter((s) => selected.saleIds.includes(s.id));
  }, [selected, sales]);

  const diff = selected && selected.declaredValue != null
    ? selected.declaredValue - selected.totals.saldo
    : null;

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><Card><Statistic title="Caixas fechados" value={history.length} prefix={<Wallet size={16} />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Total em vendas" value={totals.vendas} precision={2} prefix="R$" valueStyle={{ color: "#16A34A" }} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Total em entradas" value={totals.entradas} precision={2} prefix="R$" valueStyle={{ color: "#2563EB" }} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Total em sangrias" value={totals.sangrias} precision={2} prefix="R$" valueStyle={{ color: "#DC2626" }} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card title="Caixas encerrados">
            {history.length === 0 ? (
              <Empty description="Nenhum caixa fechado ainda" />
            ) : (
              <Table
                rowKey="id"
                size="small"
                dataSource={history}
                pagination={{ pageSize: 6 }}
                onRow={(r) => ({ onClick: () => setSelected(r), style: { cursor: "pointer" } })}
                rowClassName={(r) => (selected?.id === r.id ? "ant-table-row-selected" : "")}
                columns={[
                  { title: "ID", dataIndex: "id", width: 90 },
                  {
                    title: "Abertura",
                    dataIndex: "openedAt",
                    render: (v: string) => new Date(v).toLocaleString("pt-BR"),
                  },
                  {
                    title: "Fechamento",
                    dataIndex: "closedAt",
                    render: (v: string) => new Date(v).toLocaleString("pt-BR"),
                  },
                  { title: "Operador", dataIndex: "operatorName" },
                  {
                    title: "Saldo",
                    dataIndex: ["totals", "saldo"],
                    width: 120,
                    align: "right",
                    render: (v: number) => <strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</strong>,
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          {selected ? (
            <Card
              title={
                <Space>
                  <Wallet size={16} color="#F26B1F" />
                  Detalhes — {selected.id}
                </Space>
              }
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Row justify="space-between">
                  <Text type="secondary"><LockOpen size={12} /> Aberto em</Text>
                  <Text>{new Date(selected.openedAt).toLocaleString("pt-BR")}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary"><Lock size={12} /> Fechado em</Text>
                  <Text>{new Date(selected.closedAt).toLocaleString("pt-BR")}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">Operador</Text>
                  <Text strong>{selected.operatorName}</Text>
                </Row>
              </Space>

              <div style={{ marginTop: 12, padding: 12, background: "#FFF7ED", borderRadius: 8 }}>
                <Row justify="space-between"><Text>Valor inicial</Text><Text>R$ {selected.initialValue.toFixed(2)}</Text></Row>
                <Row justify="space-between"><Text>+ Vendas</Text><Text style={{ color: "#16A34A" }}>R$ {selected.totals.vendas.toFixed(2)}</Text></Row>
                <Row justify="space-between"><Text>+ Entradas</Text><Text style={{ color: "#2563EB" }}>R$ {selected.totals.entradas.toFixed(2)}</Text></Row>
                <Row justify="space-between"><Text>+ Reposições</Text><Text style={{ color: "#7C3AED" }}>R$ {selected.totals.reposicoes.toFixed(2)}</Text></Row>
                <Row justify="space-between"><Text>- Sangrias</Text><Text style={{ color: "#DC2626" }}>R$ {selected.totals.sangrias.toFixed(2)}</Text></Row>
                <div style={{ borderTop: "1px dashed #FED7AA", margin: "8px 0" }} />
                <Row justify="space-between">
                  <Title level={5} style={{ margin: 0 }}>Saldo esperado</Title>
                  <Title level={5} style={{ margin: 0, color: "#F26B1F" }}>R$ {selected.totals.saldo.toFixed(2)}</Title>
                </Row>
                {selected.declaredValue != null && (
                  <>
                    <Row justify="space-between" style={{ marginTop: 4 }}>
                      <Text>Valor informado</Text>
                      <Text strong>R$ {selected.declaredValue.toFixed(2)}</Text>
                    </Row>
                    <Row justify="space-between">
                      <Text>Diferença</Text>
                      <Text strong style={{ color: (diff ?? 0) < 0 ? "#DC2626" : "#16A34A" }}>
                        R$ {(diff ?? 0).toFixed(2)}
                      </Text>
                    </Row>
                  </>
                )}
              </div>

              <Tabs
                size="small"
                style={{ marginTop: 8 }}
                items={[
                  {
                    key: "mov",
                    label: `Movimentações (${selected.movements.length})`,
                    children: selected.movements.length === 0 ? (
                      <Empty description="Sem movimentações" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <Table
                        rowKey="id"
                        size="small"
                        dataSource={selected.movements}
                        pagination={{ pageSize: 5, size: "small" }}
                        columns={[
                          {
                            title: "Horário",
                            dataIndex: "at",
                            render: (v: string) => new Date(v).toLocaleTimeString("pt-BR"),
                          },
                          {
                            title: "Tipo",
                            dataIndex: "type",
                            render: (t: CashMovementType) => <Tag color={movementColors[t]}>{movementLabels[t]}</Tag>,
                          },
                          { title: "Obs.", dataIndex: "note", render: (v?: string) => v || "—" },
                          {
                            title: "Valor",
                            dataIndex: "value",
                            align: "right",
                            render: (v: number, r) => (
                              <Text strong style={{ color: r.type === "sangria" ? "#DC2626" : "#16A34A" }}>
                                {r.type === "sangria" ? "-" : "+"} R$ {v.toFixed(2)}
                              </Text>
                            ),
                          },
                        ]}
                      />
                    ),
                  },
                  {
                    key: "sales",
                    label: `Vendas (${selected.saleIds.length})`,
                    children: relatedSales.length === 0 ? (
                      <Empty description="Nenhuma venda vinculada" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <Table
                        rowKey="id"
                        size="small"
                        dataSource={relatedSales}
                        pagination={{ pageSize: 5, size: "small" }}
                        columns={[
                          { title: "ID", dataIndex: "id" },
                          {
                            title: "Tipo",
                            dataIndex: "type",
                            render: (t: string) => (
                              <Tag color={t === "balcao" ? "orange" : "blue"}>{t === "balcao" ? "Balcão" : "Serviço"}</Tag>
                            ),
                          },
                          { title: "Itens", dataIndex: "items", width: 60 },
                          {
                            title: "Total",
                            dataIndex: "total",
                            align: "right",
                            render: (v: number) => <strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</strong>,
                          },
                        ]}
                      />
                    ),
                  },
                ]}
              />
            </Card>
          ) : (
            <Card><Empty description="Selecione um caixa para ver detalhes" /></Card>
          )}
        </Col>
      </Row>
    </>
  );
}

