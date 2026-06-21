import { Card, Row, Col, Table, Tag, Button, Typography, Space, message } from "antd";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useStore } from "../store";

const { Title, Text } = Typography;

const plans = [
  { name: "Básico", price: 99.9, features: ["1 caixa", "Até 2 funcionários", "Relatórios básicos"] },
  { name: "Profissional", price: 299.9, features: ["3 caixas", "Até 10 funcionários", "Relatórios completos", "Suporte prioritário"], current: true },
  { name: "Empresarial", price: 599.9, features: ["Caixas ilimitados", "Funcionários ilimitados", "API + Integrações", "Gerente de conta"] },
];

export function Planos() {
  const { invoices, company } = useStore();

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {plans.map((p) => {
          const current = p.name === company.plan;
          return (
            <Col xs={24} md={8} key={p.name}>
              <Card
                style={{
                  border: current ? "2px solid #F26B1F" : undefined,
                  height: "100%",
                }}
              >
                {current && (
                  <Tag color="orange" style={{ marginBottom: 8 }}>
                    Plano atual
                  </Tag>
                )}
                <Title level={4} style={{ margin: 0 }}>
                  <Sparkles size={16} style={{ marginRight: 6, verticalAlign: -2, color: "#F26B1F" }} />
                  {p.name}
                </Title>
                <div style={{ margin: "12px 0" }}>
                  <Text style={{ fontSize: 28, fontWeight: 700, color: "#F26B1F" }}>
                    R$ {p.price.toFixed(2)}
                  </Text>
                  <Text type="secondary"> /mês</Text>
                </div>
                {p.features.map((f) => (
                  <div key={f} style={{ marginBottom: 6 }}>
                    <Space>
                      <CheckCircle2 size={14} color="#16A34A" />
                      <Text>{f}</Text>
                    </Space>
                  </div>
                ))}
                <Button
                  type={current ? "default" : "primary"}
                  block
                  style={{ marginTop: 16 }}
                  disabled={current}
                  onClick={() => message.info(`Para mudar de plano, contate o suporte.`)}
                >
                  {current ? "Plano Atual" : "Selecionar"}
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card title="Faturas e Mensalidades">
        <Table
          rowKey="id"
          dataSource={invoices}
          pagination={{ pageSize: 5 }}
          columns={[
            { title: "Fatura", dataIndex: "id" },
            { title: "Período", dataIndex: "period" },
            { title: "Vencimento", dataIndex: "dueDate" },
            {
              title: "Valor",
              dataIndex: "amount",
              render: (v: number) => `R$ ${v.toFixed(2)}`,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (s) => {
                const map: Record<string, { color: string; label: string }> = {
                  paga: { color: "green", label: "Paga" },
                  aberta: { color: "orange", label: "Em aberto" },
                  atrasada: { color: "red", label: "Atrasada" },
                };
                const m = map[s];
                return <Tag color={m.color}>{m.label}</Tag>;
              },
            },
            {
              title: "Ações",
              render: (_, r) =>
                r.status !== "paga" && (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => message.success(`Pagamento da fatura ${r.id} iniciado!`)}
                  >
                    Pagar
                  </Button>
                ),
            },
          ]}
        />
      </Card>
    </>
  );
}
