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
  Segmented,
  Avatar,
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
  User,
  UserPlus,
  Star,
} from "lucide-react";
import { useStore } from "../store";
import {
  PAYMENT_LABEL,
  type Payment,
  type PaymentMethod,
  type Product,
  type Sale,
  type SaleLine,
} from "../types";

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
  originalPrice?: number;
}

interface WalkInCustomer {
  name: string;
  phone?: string;
  document?: string;
}

export function VendaServico() {
  const { employees, products, addSale, customers } = useStore();
  const [items, setItems] = useState<ServiceLine[]>([]);
  const [form] = Form.useForm();
  const [customerMode, setCustomerMode] = useState<"cadastrado" | "avulso">("cadastrado");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [walkIn, setWalkIn] = useState<WalkInCustomer>({ name: "" });
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

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const specialMap = useMemo(() => {
    const m = new Map<string, number>();
    selectedCustomer?.specialPrices?.forEach((s) => m.set(s.productId, s.price));
    return m;
  }, [selectedCustomer]);

  const eligibleSpecials = useMemo(() => {
    if (!selectedCustomer) return [] as ServiceLine[];
    return items.filter(
      (i) =>
        i.kind === "produto" &&
        i.productId &&
        specialMap.has(i.productId) &&
        i.price !== specialMap.get(i.productId),
    );
  }, [items, specialMap, selectedCustomer]);

  const applySpecialPrices = () => {
    setItems((arr) =>
      arr.map((i) => {
        if (i.kind !== "produto" || !i.productId) return i;
        const sp = specialMap.get(i.productId);
        if (sp == null || sp === i.price) return i;
        return { ...i, originalPrice: i.originalPrice ?? i.price, price: sp };
      }),
    );
    message.success(`${eligibleSpecials.length} produto(s) atualizado(s) com preço especial`);
  };

  const resetPrices = () =>
    setItems((arr) =>
      arr.map((i) =>
        i.originalPrice != null ? { ...i, price: i.originalPrice, originalPrice: undefined } : i,
      ),
    );

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
    if (customerMode === "avulso" && !walkIn.name.trim())
      return message.warning("Informe o nome do cliente avulso.");
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
    const lines: SaleLine[] = items.map((i) => ({
      name: i.description,
      qty: i.qty,
      unitPrice: i.price,
      observation: i.kind === "servico" ? `Serviço - ${i.employeeName}` : undefined,
    }));
    const sale: Sale = {
      id: `S${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().slice(0, 10),
      total,
      items: items.reduce((s, i) => s + i.qty, 0),
      type: "servico",
      customerId: customerMode === "cadastrado" ? customerId || undefined : undefined,
      payments,
      lines,
    };
    addSale(sale);
    setItems([]);
    setPayments([]);
    setCustomerId(null);
    setWalkIn({ name: "" });
    setStep("items");
    message.success(`OS ${sale.id} finalizada! Total R$ ${total.toFixed(2)}`);
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={14}>
        <Card
          title={
            <Space>
              <User size={18} /> Dados do Cliente
            </Space>
          }
          style={{ marginBottom: 16 }}
          extra={
            <Segmented
              value={customerMode}
              onChange={(v) => {
                setCustomerMode(v as "cadastrado" | "avulso");
                setCustomerId(null);
              }}
              options={[
                { value: "cadastrado", label: "Cadastrado", icon: <User size={12} /> },
                { value: "avulso", label: "Avulso", icon: <UserPlus size={12} /> },
              ]}
            />
          }
        >
          {customerMode === "cadastrado" ? (
            <>
              <Select
                showSearch
                allowClear
                placeholder="Buscar e selecionar cliente cadastrado..."
                value={customerId || undefined}
                onChange={(v) => setCustomerId(v || null)}
                style={{ width: "100%" }}
                optionFilterProp="label"
                suffixIcon={<Search size={14} />}
                options={customers.map((c) => ({ value: c.id, label: `${c.name} · ${c.phone}` }))}
              />
              {selectedCustomer && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 8,
                    background: "#FFF7ED",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Avatar size={40} style={{ background: "#F26B1F" }}>
                    {selectedCustomer.name.charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: "block" }}>
                      {selectedCustomer.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {selectedCustomer.email} · {selectedCustomer.phone}
                    </Text>
                  </div>
                  {(selectedCustomer.specialPrices?.length || 0) > 0 && (
                    <Tag color="gold" icon={<Star size={11} />}>
                      {selectedCustomer.specialPrices!.length} preço(s) especial(is)
                    </Tag>
                  )}
                </div>
              )}
            </>
          ) : (
            <Row gutter={12}>
              <Col xs={24} md={10}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Nome *
                </Text>
                <Input
                  placeholder="Nome do cliente"
                  value={walkIn.name}
                  onChange={(e) => setWalkIn((w) => ({ ...w, name: e.target.value }))}
                />
              </Col>
              <Col xs={12} md={7}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Telefone
                </Text>
                <Input
                  placeholder="(00) 00000-0000"
                  value={walkIn.phone || ""}
                  onChange={(e) => setWalkIn((w) => ({ ...w, phone: e.target.value }))}
                />
              </Col>
              <Col xs={12} md={7}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  CPF/CNPJ
                </Text>
                <Input
                  placeholder="Documento"
                  value={walkIn.document || ""}
                  onChange={(e) => setWalkIn((w) => ({ ...w, document: e.target.value }))}
                />
              </Col>
            </Row>
          )}
        </Card>

        <Card
          title={
            <Space>
              <Briefcase size={18} /> Novo Serviço
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Form layout="vertical" form={form} onFinish={onAddService}>
            <Form.Item name="description" label="Descrição do serviço" rules={[{ required: true }]}>
              <TextArea
                rows={3}
                placeholder="Ex: Ajuste de barra de calça, reparo, instalação..."
              />
            </Form.Item>
            <Row gutter={12}>
              <Col span={14}>
                <Form.Item
                  name="employeeId"
                  label="Funcionário responsável"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Selecione"
                    options={employees
                      .filter((e) => e.active)
                      .map((e) => ({ value: e.id, label: `${e.name} (${e.role})` }))}
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
          title={
            <Space>
              <Package size={18} /> Produtos do Estoque
            </Space>
          }
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
                render: (v: number, p: Product) => {
                  const sp = specialMap.get(p.id);
                  if (sp != null && sp !== v) {
                    return (
                      <Space direction="vertical" size={0}>
                        <Text delete style={{ fontSize: 11 }}>
                          R$ {v.toFixed(2)}
                        </Text>
                        <Text strong style={{ color: "#F26B1F", fontSize: 12 }}>
                          R$ {sp.toFixed(2)}
                        </Text>
                      </Space>
                    );
                  }
                  return `R$ ${v.toFixed(2)}`;
                },
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
              <div style={{ padding: 8, background: "#F8FAFC", borderRadius: 6, marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Cliente da OS
                </Text>
                <div>
                  <Text strong>
                    {customerMode === "cadastrado"
                      ? selectedCustomer?.name || "Nenhum selecionado"
                      : walkIn.name || "Cliente avulso"}
                  </Text>{" "}
                  <Tag
                    color={customerMode === "cadastrado" ? "blue" : "default"}
                    style={{ margin: 0 }}
                  >
                    {customerMode === "cadastrado" ? "Cadastrado" : "Avulso"}
                  </Tag>
                </div>
              </div>

              {eligibleSpecials.length > 0 && (
                <div
                  style={{
                    background: "#FEF3C7",
                    border: "1px solid #FCD34D",
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 12, display: "block" }}>
                        <Star size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
                        {eligibleSpecials.length} produto(s) com preço especial
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Aplicar preço especial deste cliente.
                      </Text>
                    </div>
                    <Space direction="vertical" size={4}>
                      <Button size="small" type="primary" onClick={applySpecialPrices}>
                        Aplicar
                      </Button>
                      {items.some((i) => i.originalPrice != null) && (
                        <Button size="small" type="link" onClick={resetPrices}>
                          Restaurar
                        </Button>
                      )}
                    </Space>
                  </Space>
                </div>
              )}

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
                  renderItem={(it) => {
                    const hasSpecial = it.originalPrice != null && it.originalPrice !== it.price;
                    return (
                      <List.Item
                        actions={[
                          <Button
                            key="d"
                            size="small"
                            type="text"
                            danger
                            icon={<Trash2 size={14} />}
                            onClick={() => setItems((a) => a.filter((x) => x.id !== it.id))}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              {it.description}
                              <Tag
                                color={it.kind === "servico" ? "orange" : "blue"}
                                style={{ margin: 0 }}
                              >
                                {it.kind === "servico" ? "Serviço" : "Produto"}
                              </Tag>
                              {hasSpecial && (
                                <Tag color="gold" icon={<Star size={10} />} style={{ margin: 0 }}>
                                  Especial
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              {hasSpecial && (
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  De{" "}
                                  <Text delete style={{ fontSize: 11 }}>
                                    R$ {it.originalPrice!.toFixed(2)}
                                  </Text>{" "}
                                  por{" "}
                                  <Text strong style={{ color: "#F26B1F", fontSize: 11 }}>
                                    R$ {it.price.toFixed(2)}
                                  </Text>
                                </Text>
                              )}
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {it.kind === "servico"
                                  ? `Resp.: ${it.employeeName}`
                                  : `Qtd.: ${it.qty}`}{" "}
                                • R$ {(it.price * it.qty).toFixed(2)}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
              <Divider style={{ margin: "12px 0" }} />
              <Row justify="space-between">
                <Title level={4} style={{ margin: 0 }}>
                  Total
                </Title>
                <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>
                  R$ {total.toFixed(2)}
                </Title>
              </Row>
              <Button
                type="primary"
                block
                size="large"
                style={{ marginTop: 12 }}
                icon={<ArrowRight size={14} />}
                iconPosition="end"
                onClick={goToPayment}
              >
                Ir para pagamento
              </Button>
            </>
          ) : (
            <>
              <div
                style={{ background: "#FFF7ED", padding: 12, borderRadius: 8, marginBottom: 12 }}
              >
                <Row justify="space-between">
                  <Text>Total</Text>
                  <Text strong>R$ {total.toFixed(2)}</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">Pago</Text>
                  <Text type="secondary">R$ {paid.toFixed(2)}</Text>
                </Row>
                <Row justify="space-between">
                  <Text strong style={{ color: remaining > 0 ? "#DC2626" : "#16A34A" }}>
                    Restante
                  </Text>
                  <Text strong style={{ color: remaining > 0 ? "#DC2626" : "#16A34A" }}>
                    R$ {remaining.toFixed(2)}
                  </Text>
                </Row>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Adicionar pagamento
              </Text>
              <Space.Compact style={{ width: "100%", marginTop: 4 }}>
                <Select
                  value={pMethod}
                  onChange={setPMethod}
                  style={{ width: 130 }}
                  options={(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => ({
                    value: m,
                    label: PAYMENT_LABEL[m],
                  }))}
                />
                <InputNumber
                  min={0}
                  step={0.5}
                  value={pValue}
                  onChange={(v) => setPValue(v || 0)}
                  prefix="R$"
                  style={{ width: "100%" }}
                />
                <Button type="primary" icon={<Plus size={14} />} onClick={addPayment}>
                  Add
                </Button>
              </Space.Compact>

              {payments.length > 0 && (
                <List
                  size="small"
                  style={{ marginTop: 12 }}
                  dataSource={payments}
                  renderItem={(p, idx) => (
                    <List.Item
                      actions={[
                        <Button
                          key="x"
                          size="small"
                          type="text"
                          danger
                          icon={<Trash2 size={14} />}
                          onClick={() => removePayment(idx)}
                        />,
                      ]}
                    >
                      <Space>
                        <CreditCard size={14} color="#F26B1F" />
                        <Text>{PAYMENT_LABEL[p.method]}</Text>
                      </Space>
                      <Text strong>R$ {p.value.toFixed(2)}</Text>
                    </List.Item>
                  )}
                />
              )}

              <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<CheckCircle2 size={16} />}
                  disabled={paid < total - 0.001}
                  onClick={finalize}
                >
                  Finalizar Serviço
                </Button>
                <Button block icon={<ArrowLeft size={14} />} onClick={() => setStep("items")}>
                  Voltar
                </Button>
              </Space>
            </>
          )}
        </Card>
      </Col>
    </Row>
  );
}
