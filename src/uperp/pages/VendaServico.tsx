import { useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  List,
  Typography,
  Empty,
  Divider,
  Tag,
  Steps,
  Space,
  Table,
  message,
} from "antd";
import {
  Briefcase,
  Trash2,
  Package,
  Plus,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Search,
} from "lucide-react";
import { useStore } from "../store";
import { PAYMENT_LABEL, type Payment, type PaymentMethod, type Product, type Sale } from "../types";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ServiceLine {
  id: string;
  kind: "servico" | "produto";
  description: string;
  employeeName?: string;
  productId?: string;
  qty: number;
  price: number;
}

export function VendaServico() {
  const { employees, products, addSale, customers } = useStore();
  const [items, setItems] = useState<ServiceLine[]>([]);
  const [form] = Form.useForm();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [step, setStep] = useState<"items" | "payment">("items");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pMethod, setPMethod] = useState<PaymentMethod>("pix");
  const [pValue, setPValue] = useState<number>(0);

  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<React.Key[]>([]);
  const [productQtys, setProductQtys] = useState<Record<string, number>>({});

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const paid = payments.reduce((s, p) => s + p.value, 0);
  const remaining = Math.max(0, total - paid);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => {
      if (p.stock <= 0) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [products, productSearch]);

  const onAddService = (v: { description: string; employeeId: string; price: number }) => {
    const emp = employees.find((e) => e.id === v.employeeId);
    setItems((arr) => [
      ...arr,
      {
        id: Math.random().toString(36).slice(2),
        kind: "servico",
        description: v.description,
        employeeName: emp?.name || "—",
        qty: 1,
        price: v.price,
      },
    ]);
    form.resetFields();
    message.success("Serviço adicionado");
  };

  const confirmSelectedProducts = () => {
    if (selectedProductIds.length === 0) return message.warning("Selecione ao menos um produto.");
    const additions: ServiceLine[] = [];
    for (const key of selectedProductIds) {
      const p = products.find((x) => x.id === String(key));
      if (!p) continue;
      const qty = productQtys[p.id] || 1;
      if (p.stock < qty) {
        message.error(`Estoque insuficiente para ${p.name}`);
        return;
      }
      additions.push({
        id: Math.random().toString(36).slice(2),
        kind: "produto",
        description: p.name,
        productId: p.id,
        qty,
        price: p.price,
      });
    }
    setItems((arr) => [...arr, ...additions]);
    setSelectedProductIds([]);
    setProductQtys({});
    message.success(`${additions.length} produto(s) adicionado(s) à OS`);
  };

  const goToPayment = () => {
    if (items.length === 0) return message.warning("Adicione ao menos um item.");
    setPValue(total);
    setStep("payment");
  };

  const addPayment = () => {
    if (pValue <= 0) return message.warning("Informe um valor válido.");
    setPayments((arr) => [...arr, { method: pMethod, value: pValue }]);
    setPValue(Math.max(0, remaining - pValue));
  };
  const removePayment = (i: number) => setPayments((a) => a.filter((_, x) => x !== i));

  const finalize = () => {
    if (paid < total - 0.001) return message.warning("Pagamento incompleto.");
    const sale: Sale = {
      id: `S${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().slice(0, 10),
      total,
      items: items.reduce((s, i) => s + i.qty, 0),
      type: "servico",
      customerId: customerId || undefined,
      payments,
    };
    addSale(sale);
    setItems([]);
    setPayments([]);
    setCustomerId(null);
    setStep("items");
    message.success(`OS ${sale.id} finalizada! Total R$ ${total.toFixed(2)}`);
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={14}>
        <Card title={<Space><Briefcase size={18} /> Novo Serviço</Space>} style={{ marginBottom: 16 }}>
          <Form layout="vertical" form={form} onFinish={onAddService}>
            <Form.Item name="description" label="Descrição do serviço" rules={[{ required: true }]}>
              <TextArea rows={3} placeholder="Ex: Ajuste de barra de calça, reparo, instalação..." />
            </Form.Item>
            <Row gutter={12}>
              <Col span={14}>
                <Form.Item name="employeeId" label="Funcionário responsável" rules={[{ required: true }]}>
                  <Select
                    placeholder="Selecione"
                    options={employees.filter((e) => e.active).map((e) => ({ value: e.id, label: `${e.name} (${e.role})` }))}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name="price" label="Valor (R$)" rules={[{ required: true }]}>
                  <InputNumber min={0} step={10} style={{ width: "100%" }} placeholder="0,00" />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" block icon={<Plus size={14} />}>
              Adicionar Serviço
            </Button>
          </Form>
        </Card>

        <Card
          title={<Space><Package size={18} /> Produtos do Estoque</Space>}
          extra={
            <Button
              type="primary"
              icon={<Plus size={14} />}
              onClick={confirmSelectedProducts}
              disabled={selectedProductIds.length === 0}
            >
              Confirmar {selectedProductIds.length > 0 ? `(${selectedProductIds.length})` : ""}
            </Button>
          }
        >
          <Input
            placeholder="Buscar produto por nome ou SKU..."
            prefix={<Search size={14} />}
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            allowClear
            style={{ marginBottom: 12 }}
          />
          <Table
            rowKey="id"
            size="small"
            dataSource={filteredProducts}
            pagination={{ pageSize: 6, size: "small" }}
            rowSelection={{
              selectedRowKeys: selectedProductIds,
              onChange: setSelectedProductIds,
            }}
            columns={[
              { title: "Produto", dataIndex: "name" },
              { title: "SKU", dataIndex: "sku", width: 90 },
              {
                title: "Preço",
                dataIndex: "price",
                width: 100,
                render: (v: number) => `R$ ${v.toFixed(2)}`,
              },
              {
                title: "Estoque",
                dataIndex: "stock",
                width: 90,
                render: (v: number) => <Tag color={v > 5 ? "green" : "orange"}>{v} un.</Tag>,
              },
              {
                title: "Qtd.",
                width: 100,
                render: (_, p: Product) => (
                  <InputNumber
                    size="small"
                    min={1}
                    max={p.stock}
                    value={productQtys[p.id] || 1}
                    onChange={(v) => setProductQtys((q) => ({ ...q, [p.id]: v || 1 }))}
                    style={{ width: "100%" }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card title="Comanda de Serviço">
          <Steps
            size="small"
            current={step === "items" ? 0 : 1}
            items={[{ title: "Itens" }, { title: "Pagamento" }]}
            style={{ marginBottom: 12 }}
          />

          {step === "items" && (
            <>
              <Text type="secondary" style={{ fontSize: 12 }}>Cliente</Text>
              <Select
                showSearch
                allowClear
                placeholder="Selecionar cliente (opcional)"
                value={customerId || undefined}
                onChange={(v) => setCustomerId(v || null)}
                style={{ width: "100%", marginTop: 4, marginBottom: 12 }}
                optionFilterProp="label"
                options={customers.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Divider style={{ margin: "8px 0 12px" }} />
            </>
          )}

          {step === "items" ? (
            <>
              {items.length === 0 ? (
                <Empty description="Nenhum item" />
              ) : (
                <List
                  dataSource={items}
                  renderItem={(it) => (
                    <List.Item
                      actions={[
                        <Button key="d" size="small" type="text" danger icon={<Trash2 size={14} />} onClick={() => setItems((a) => a.filter((x) => x.id !== it.id))} />,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            {it.description}
                            <Tag color={it.kind === "servico" ? "orange" : "blue"}>
                              {it.kind === "servico" ? "Serviço" : "Produto"}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {it.kind === "servico"
                              ? `Resp.: ${it.employeeName}`
                              : `Qtd.: ${it.qty}`} • R$ {(it.price * it.qty).toFixed(2)}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
              <Divider style={{ margin: "12px 0" }} />
              <Row justify="space-between">
                <Title level={4} style={{ margin: 0 }}>Total</Title>
                <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>R$ {total.toFixed(2)}</Title>
              </Row>
              <Button type="primary" block size="large" style={{ marginTop: 12 }} icon={<ArrowRight size={14} />} iconPosition="end" onClick={goToPayment}>
                Ir para pagamento
              </Button>
            </>
          ) : (
            <>
              <div style={{ background: "#FFF7ED", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <Row justify="space-between"><Text>Total</Text><Text strong>R$ {total.toFixed(2)}</Text></Row>
                <Row justify="space-between"><Text type="secondary">Pago</Text><Text type="secondary">R$ {paid.toFixed(2)}</Text></Row>
                <Row justify="space-between">
                  <Text strong style={{ color: remaining > 0 ? "#DC2626" : "#16A34A" }}>Restante</Text>
                  <Text strong style={{ color: remaining > 0 ? "#DC2626" : "#16A34A" }}>R$ {remaining.toFixed(2)}</Text>
                </Row>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>Adicionar pagamento</Text>
              <Space.Compact style={{ width: "100%", marginTop: 4 }}>
                <Select
                  value={pMethod}
                  onChange={setPMethod}
                  style={{ width: 130 }}
                  options={(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => ({ value: m, label: PAYMENT_LABEL[m] }))}
                />
                <InputNumber min={0} step={0.5} value={pValue} onChange={(v) => setPValue(v || 0)} prefix="R$" style={{ width: "100%" }} />
                <Button type="primary" icon={<Plus size={14} />} onClick={addPayment}>Add</Button>
              </Space.Compact>

              {payments.length > 0 && (
                <List
                  size="small"
                  style={{ marginTop: 12 }}
                  dataSource={payments}
                  renderItem={(p, idx) => (
                    <List.Item
                      actions={[
                        <Button key="x" size="small" type="text" danger icon={<Trash2 size={14} />} onClick={() => removePayment(idx)} />,
                      ]}
                    >
                      <Space><CreditCard size={14} color="#F26B1F" /><Text>{PAYMENT_LABEL[p.method]}</Text></Space>
                      <Text strong>R$ {p.value.toFixed(2)}</Text>
                    </List.Item>
                  )}
                />
              )}

              <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
                <Button type="primary" block size="large" icon={<CheckCircle2 size={16} />} disabled={paid < total - 0.001} onClick={finalize}>
                  Finalizar Serviço
                </Button>
                <Button block icon={<ArrowLeft size={14} />} onClick={() => setStep("items")}>Voltar</Button>
              </Space>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
}
