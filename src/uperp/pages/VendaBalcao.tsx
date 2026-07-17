import { useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Tag,
  List,
  InputNumber,
  Select,
  Empty,
  Typography,
  Space,
  Divider,
  Modal,
  Form,
  Radio,
  Avatar,
  Pagination,
  Segmented,
  Table,
  Steps,
  Drawer,
  Badge,
  Grid,
  message,
} from "antd";
import {
  Lock,
  LockOpen,
  ShoppingCart,
  Trash2,
  Search,
  User,
  ArrowRight,
  ArrowLeft,
  Star,
  LayoutGrid,
  List as ListIcon,
  CreditCard,
  Plus,
  CheckCircle2,
  History,
  Printer,
  Receipt,
} from "lucide-react";
import { useStore } from "../store";
import { PAYMENT_LABEL, type PaymentMethod, type Payment, type Sale, type Product, type SaleLine } from "../types";


const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface Props {
  onGoToCaixa?: () => void;
}

interface AddForm {
  qty: number;
  size?: string;
  color?: string;
  observation?: string;
}

export function VendaBalcao({ onGoToCaixa }: Props) {
  const {
    products,
    cashOpen,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    addSale,
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    settings,
    sales,
  } = useStore();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percent" | "value">("percent");
  const [discountReason, setDiscountReason] = useState("");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [addForm] = Form.useForm<AddForm>();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [step, setStep] = useState<"items" | "payment">("items");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pMethod, setPMethod] = useState<PaymentMethod>("pix");
  const [pValue, setPValue] = useState<number>(0);
  const [recentOpen, setRecentOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);


  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discountValue = discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const total = Math.max(0, subtotal - discountValue);
  const paid = payments.reduce((s, p) => s + p.value, 0);
  const remaining = Math.max(0, total - paid);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const openProductModal = (p: Product) => {
    if (p.stock <= 0) return message.error("Produto sem estoque");
    setModalProduct(p);
    addForm.resetFields();
    addForm.setFieldsValue({ qty: 1 });
  };

  const confirmAdd = (v: AddForm) => {
    if (!modalProduct) return;
    const needsSize = !!modalProduct.variations?.sizes?.length;
    const needsColor = !!modalProduct.variations?.colors?.length;
    if (needsSize && !v.size) return message.warning("Selecione o tamanho");
    if (needsColor && !v.color) return message.warning("Selecione a cor");

    addToCart(modalProduct, {
      qty: v.qty || 1,
      size: v.size,
      color: v.color,
      observation: settings.productObservations ? v.observation : undefined,
    });
    message.success(`${modalProduct.name} adicionado`);
    setModalProduct(null);
  };

  const goToPayment = () => {
    if (!cashOpen) {
      message.warning("Abra o caixa antes de finalizar uma venda.");
      onGoToCaixa?.();
      return;
    }
    if (cart.length === 0) return message.warning("Carrinho vazio.");
    if (settings.requireCustomerOnSale && !selectedCustomerId)
      return message.warning("Selecione um cliente para esta venda.");
    if (settings.askDiscountReason && discountValue > 0 && !discountReason.trim())
      return message.warning("Informe o motivo do desconto.");
    setPValue(total);
    setStep("payment");
  };

  const addPayment = () => {
    if (pValue <= 0) return message.warning("Informe um valor válido.");
    setPayments((arr) => [...arr, { method: pMethod, value: pValue }]);
    setPValue(Math.max(0, remaining - pValue));
  };
  const removePayment = (idx: number) =>
    setPayments((arr) => arr.filter((_, i) => i !== idx));

  const finalize = () => {
    if (paid < total - 0.001) return message.warning("Pagamento incompleto.");
    const lines: SaleLine[] = cart.map((i) => ({
      name: i.product.name,
      sku: i.product.sku,
      qty: i.qty,
      unitPrice: i.customPrice ?? i.product.price,
      size: i.size,
      color: i.color,
      observation: i.observation,
    }));
    const sale: Sale = {
      id: `V${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().slice(0, 10),
      total,
      items: cart.reduce((s, i) => s + i.qty, 0),
      type: "balcao",
      customerId: selectedCustomerId || undefined,
      payments,
      lines,
      discount: discountValue,
    };
    addSale(sale);
    clearCart();
    setDiscount(0);
    setDiscountReason("");
    setPayments([]);
    setStep("items");
    setCartOpen(false);
    setReceiptSale(sale);
    message.success(`Venda ${sale.id} finalizada!`);
  };


  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const renderProductCard = (p: Product) => (
    <Card
      hoverable={p.stock > 0}
      styles={{ body: { padding: 12 } }}
      onClick={() => openProductModal(p)}
      style={{ opacity: p.stock > 0 ? 1 : 0.5 }}
    >
      <div
        style={{
          aspectRatio: "1 / 1",
          width: "100%",
          borderRadius: 8,
          background: "linear-gradient(135deg, #fff3e8, #ffe0c2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          fontWeight: 700,
          color: "#F26B1F",
          fontSize: 32,
        }}
      >
        {p.name.charAt(0)}
      </div>
      <Text strong style={{ display: "block", fontSize: 13 }}>{p.name}</Text>
      <Text type="secondary" style={{ fontSize: 11 }}>{p.sku}</Text>
      <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong style={{ color: "#F26B1F" }}>R$ {p.price.toFixed(2)}</Text>
        <Tag color={p.stock > 5 ? "green" : p.stock > 0 ? "orange" : "red"} style={{ margin: 0 }}>
          {p.stock}
        </Tag>
      </div>
    </Card>
  );

  const comandaContent = (
    <>
      <Steps
        size="small"
        current={step === "items" ? 0 : 1}
        items={[{ title: "Itens" }, { title: "Pagamento" }]}
        style={{ marginBottom: 12 }}
      />

      {step === "items" ? (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cliente {settings.requireCustomerOnSale && <Text type="danger">*</Text>}
            </Text>
            <Select
              showSearch
              allowClear
              placeholder="Selecionar cliente (opcional)"
              value={selectedCustomerId || undefined}
              onChange={(v) => setSelectedCustomerId(v || null)}
              style={{ width: "100%", marginTop: 4 }}
              optionFilterProp="label"
              suffixIcon={<User size={14} />}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
            />
            {selectedCustomer && (
              <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: "#FFF7ED", display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar size="small" style={{ background: "#F26B1F" }}>
                  {selectedCustomer.name.charAt(0)}
                </Avatar>
                <div style={{ flex: 1, lineHeight: 1.2 }}>
                  <Text strong style={{ fontSize: 12, display: "block" }}>{selectedCustomer.name}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{selectedCustomer.phone}</Text>
                </div>
                {selectedCustomer.loyalty && (
                  <Tag color="gold" icon={<Star size={10} />} style={{ margin: 0 }}>Fidelidade</Tag>
                )}
              </div>
            )}
          </div>

          <Divider style={{ margin: "8px 0 12px" }} />

          {cart.length === 0 ? (
            <Empty description="Carrinho vazio" />
          ) : (
            <List
              dataSource={cart}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="r" size="small" type="text" danger icon={<Trash2 size={14} />} onClick={() => removeFromCart(item.id)} />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.product.name}
                    description={
                      <Space direction="vertical" size={2} style={{ width: "100%" }}>
                        {(item.size || item.color) && (
                          <Space size={4} wrap>
                            {item.size && <Tag color="orange" style={{ margin: 0 }}>Tam. {item.size}</Tag>}
                            {item.color && <Tag color="default" style={{ margin: 0 }}>{item.color}</Tag>}
                          </Space>
                        )}
                        {item.observation && (
                          <Text type="secondary" italic style={{ fontSize: 11 }}>"{item.observation}"</Text>
                        )}
                        <Space>
                          <InputNumber size="small" min={1} value={item.qty} onChange={(v) => updateCartQty(item.id, v || 1)} style={{ width: 60 }} />
                          <Text type="secondary">R$ {(item.product.price * item.qty).toFixed(2)}</Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}

          <Divider style={{ margin: "12px 0" }} />
          <Text type="secondary">Desconto</Text>
          <Space.Compact style={{ width: "100%", marginTop: 4, marginBottom: 8 }}>
            <Select
              value={discountType}
              onChange={setDiscountType}
              options={[{ value: "percent", label: "%" }, { value: "value", label: "R$" }]}
              style={{ width: 80 }}
            />
            <InputNumber min={0} value={discount} onChange={(v) => setDiscount(v || 0)} style={{ width: "100%" }} />
          </Space.Compact>
          {settings.askDiscountReason && discountValue > 0 && (
            <Input placeholder="Motivo do desconto" value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} style={{ marginBottom: 12 }} />
          )}

          <Row justify="space-between"><Text>Subtotal</Text><Text>R$ {subtotal.toFixed(2)}</Text></Row>
          <Row justify="space-between"><Text type="secondary">Desconto</Text><Text type="secondary">- R$ {discountValue.toFixed(2)}</Text></Row>
          <Row justify="space-between" style={{ marginTop: 8 }}>
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
            <Row justify="space-between">
              <Text>Total da venda</Text>
              <Text strong>R$ {total.toFixed(2)}</Text>
            </Row>
            <Row justify="space-between">
              <Text type="secondary">Pago</Text>
              <Text type="secondary">R$ {paid.toFixed(2)}</Text>
            </Row>
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
                  <Space>
                    <CreditCard size={14} color="#F26B1F" />
                    <Text>{PAYMENT_LABEL[p.method]}</Text>
                  </Space>
                  <Text strong>R$ {p.value.toFixed(2)}</Text>
                </List.Item>
              )}
            />
          )}

          <Space style={{ width: "100%", marginTop: 16 }} direction="vertical">
            <Button
              type="primary"
              block
              size="large"
              icon={<CheckCircle2 size={16} />}
              disabled={paid < total - 0.001}
              onClick={finalize}
            >
              Finalizar Venda
            </Button>
            <Button block icon={<ArrowLeft size={14} />} onClick={() => setStep("items")}>
              Voltar para itens
            </Button>
          </Space>
        </>
      )}
    </>
  );

  const recentSales = [...sales].slice(-20).reverse();

  return (
    <>
      <Row gutter={16} style={{ minHeight: "calc(100vh - 112px)" }} align="stretch">
        <Col xs={24} lg={16} style={{ display: "flex", flexDirection: "column" }}>
          <Card
            style={{ marginBottom: 16, borderLeft: `4px solid ${cashOpen ? "#16A34A" : "#DC2626"}` }}
            styles={{ body: { padding: 16 } }}
          >
            <Row align="middle" justify="space-between" gutter={[12, 12]}>
              <Col>
                <Space>
                  {cashOpen ? <LockOpen color="#16A34A" /> : <Lock color="#DC2626" />}
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Status do Caixa</Text>
                    <Title level={4} style={{ margin: 0 }}>
                      {cashOpen ? "Caixa Aberto" : "Caixa Fechado"}
                    </Title>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space wrap>
                  <Button icon={<History size={14} />} onClick={() => setRecentOpen(true)}>
                    Ver vendas recentes
                  </Button>
                  <Button
                    type={cashOpen ? "default" : "primary"}
                    danger={cashOpen}
                    icon={<ArrowRight size={14} />}
                    iconPosition="end"
                    onClick={onGoToCaixa}
                  >
                    {cashOpen ? "Gerenciar Caixa" : "Abrir Caixa"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          <Card style={{ flex: 1, display: "flex", flexDirection: "column" }} styles={{ body: { flex: 1, display: "flex", flexDirection: "column" } }}>
            <Row gutter={12} style={{ marginBottom: 16 }} align="middle">
              <Col flex="auto">
                <Input
                  size="large"
                  placeholder="Buscar produto por nome ou SKU..."
                  prefix={<Search size={16} />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </Col>
              <Col>
                <Segmented
                  value={view}
                  onChange={(v) => setView(v as "cards" | "table")}
                  options={[
                    { value: "cards", icon: <LayoutGrid size={14} /> },
                    { value: "table", icon: <ListIcon size={14} /> },
                  ]}
                />
              </Col>
            </Row>

            {view === "cards" ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ flex: 1 }}>
                  <Row gutter={[12, 12]}>
                    {pageData.map((p) => (
                      <Col key={p.id} xs={12} sm={8} md={6}>
                        {renderProductCard(p)}
                      </Col>
                    ))}
                    {pageData.length === 0 && <Empty style={{ width: "100%", padding: 32 }} />}
                  </Row>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={filtered.length}
                    showSizeChanger
                    pageSizeOptions={[8, 12, 16, 24]}
                    onChange={(p, ps) => {
                      setPage(p);
                      setPageSize(ps);
                    }}
                  />
                </div>
              </div>
            ) : (
              <Table
                rowKey="id"
                size="small"
                style={{ flex: 1 }}
                dataSource={filtered}
                pagination={{ pageSize, current: page, onChange: (p, ps) => { setPage(p); setPageSize(ps); }, pageSizeOptions: [8, 12, 16, 24], showSizeChanger: true }}
                onRow={(r) => ({ onClick: () => openProductModal(r), style: { cursor: "pointer" } })}
                columns={[
                  { title: "SKU", dataIndex: "sku", width: 100 },
                  { title: "Produto", dataIndex: "name" },
                  { title: "Categoria", dataIndex: "category" },
                  { title: "Preço", dataIndex: "price", render: (v: number) => `R$ ${v.toFixed(2)}` },
                  {
                    title: "Estoque",
                    dataIndex: "stock",
                    render: (v: number) => (
                      <Tag color={v > 5 ? "green" : v > 0 ? "orange" : "red"}>{v}</Tag>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {!isMobile && (
          <Col xs={0} lg={8} style={{ display: "flex", flexDirection: "column" }}>
            <Card
              title={
                <Space>
                  <ShoppingCart size={18} /> Comanda
                </Space>
              }
              extra={cart.length > 0 && step === "items" && (
                <Button size="small" type="link" onClick={clearCart}>Limpar</Button>
              )}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, overflowY: "auto" } }}
            >
              {comandaContent}
            </Card>
          </Col>
        )}
      </Row>

      {/* Mobile floating cart */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 1000,
          }}
        >
          <Badge count={cartCount} offset={[-6, 6]} color="#DC2626">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<ShoppingCart size={22} />}
              onClick={() => setCartOpen(true)}
              style={{
                width: 60,
                height: 60,
                boxShadow: "0 6px 20px rgba(242, 107, 31, 0.45)",
              }}
            />
          </Badge>
        </div>
      )}

      <Drawer
        title={
          <Space>
            <ShoppingCart size={18} /> Comanda
            {cart.length > 0 && step === "items" && (
              <Button size="small" type="link" onClick={clearCart}>Limpar</Button>
            )}
          </Space>
        }
        placement="right"
        open={cartOpen && isMobile}
        onClose={() => setCartOpen(false)}
        width={Math.min(420, typeof window !== "undefined" ? window.innerWidth - 24 : 360)}
      >
        {comandaContent}
      </Drawer>

      <Modal
        open={recentOpen}
        title="Vendas recentes"
        onCancel={() => setRecentOpen(false)}
        footer={null}
        width={720}
      >
        <Table
          rowKey="id"
          size="small"
          dataSource={recentSales}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "Nenhuma venda registrada" }}
          columns={[
            { title: "Código", dataIndex: "id", width: 90 },
            { title: "Data", dataIndex: "date", width: 110 },
            {
              title: "Tipo",
              dataIndex: "type",
              width: 100,
              render: (t: string) => (
                <Tag color={t === "balcao" ? "orange" : "blue"}>{t === "balcao" ? "Balcão" : "Serviço"}</Tag>
              ),
            },
            { title: "Itens", dataIndex: "items", width: 70, align: "center" as const },
            {
              title: "Cliente",
              dataIndex: "customerId",
              render: (id?: string) => customers.find((c) => c.id === id)?.name || <Text type="secondary">—</Text>,
            },
            {
              title: "Total",
              dataIndex: "total",
              width: 110,
              align: "right" as const,
              render: (v: number) => <Text strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</Text>,
            },
          ]}
        />
      </Modal>

      <Modal
        open={modalProduct !== null}
        title={modalProduct ? `Adicionar: ${modalProduct.name}` : ""}
        onCancel={() => setModalProduct(null)}
        onOk={() => addForm.submit()}
        okText="Adicionar à comanda"
        cancelText="Cancelar"
        destroyOnHidden
      >
        {modalProduct && (
          <>
            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col>
                <div style={{ width: 64, height: 64, borderRadius: 8, background: "linear-gradient(135deg, #fff3e8, #ffe0c2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#F26B1F", fontSize: 24 }}>
                  {modalProduct.name.charAt(0)}
                </div>
              </Col>
              <Col flex="auto">
                <Text strong style={{ display: "block" }}>{modalProduct.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{modalProduct.sku} · {modalProduct.category}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong style={{ color: "#F26B1F", fontSize: 18 }}>R$ {modalProduct.price.toFixed(2)}</Text>
                  <Tag style={{ marginLeft: 8 }} color={modalProduct.stock > 5 ? "green" : "orange"}>
                    {modalProduct.stock} em estoque
                  </Tag>
                </div>
              </Col>
            </Row>

            <Form layout="vertical" form={addForm} onFinish={confirmAdd}>
              <Form.Item label="Quantidade" name="qty" rules={[{ required: true }]}>
                <InputNumber min={1} max={modalProduct.stock} style={{ width: "100%" }} />
              </Form.Item>

              {modalProduct.variations?.sizes?.length ? (
                <Form.Item label="Tamanho" name="size" rules={[{ required: true, message: "Selecione o tamanho" }]}>
                  <Radio.Group buttonStyle="solid">
                    {modalProduct.variations.sizes.map((s) => (
                      <Radio.Button key={s} value={s}>{s}</Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>
              ) : null}

              {modalProduct.variations?.colors?.length ? (
                <Form.Item label="Cor" name="color" rules={[{ required: true, message: "Selecione a cor" }]}>
                  <Select placeholder="Selecione a cor" options={modalProduct.variations.colors.map((c) => ({ value: c, label: c }))} />
                </Form.Item>
              ) : null}

              {settings.productObservations && (
                <Form.Item label="Observação" name="observation">
                  <Input.TextArea rows={2} placeholder="Ex: Embalagem para presente" maxLength={140} showCount />
                </Form.Item>
              )}
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}
