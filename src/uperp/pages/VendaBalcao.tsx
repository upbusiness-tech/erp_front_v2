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
  Star,
} from "lucide-react";
import { useStore } from "../store";
import type { Sale, Product } from "../types";

const { Title, Text } = Typography;

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
  } = useStore();
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percent" | "value">("percent");
  const [discountReason, setDiscountReason] = useState("");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [addForm] = Form.useForm<AddForm>();

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const discountValue = discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const total = Math.max(0, subtotal - discountValue);

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

  const finalize = () => {
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

    const sale: Sale = {
      id: `V${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().slice(0, 10),
      total,
      items: cart.reduce((s, i) => s + i.qty, 0),
      type: "balcao",
      customerId: selectedCustomerId || undefined,
    };
    addSale(sale);
    clearCart();
    setDiscount(0);
    setDiscountReason("");
    message.success(
      `Venda ${sale.id} finalizada! Total R$ ${total.toFixed(2)}${
        settings.printReceipt ? " — Cupom enviado para impressão." : ""
      }`
    );
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <Row gutter={16}>
      <Col xs={24} lg={16}>
        <Card
          style={{ marginBottom: 16, borderLeft: `4px solid ${cashOpen ? "#16A34A" : "#DC2626"}` }}
          styles={{ body: { padding: 16 } }}
          hoverable
          onClick={onGoToCaixa}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                {cashOpen ? <LockOpen color="#16A34A" /> : <Lock color="#DC2626" />}
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Status do Caixa
                  </Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {cashOpen ? "Caixa Aberto" : "Caixa Fechado"}
                  </Title>
                </div>
              </Space>
            </Col>
            <Col>
              <Button
                type={cashOpen ? "default" : "primary"}
                danger={cashOpen}
                icon={<ArrowRight size={14} />}
                iconPosition="end"
                onClick={(e) => {
                  e.stopPropagation();
                  onGoToCaixa?.();
                }}
              >
                {cashOpen ? "Gerenciar Caixa" : "Abrir Caixa"}
              </Button>
            </Col>
          </Row>
        </Card>

        <Card>
          <Input
            size="large"
            placeholder="Buscar produto por nome ou SKU..."
            prefix={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Row gutter={[12, 12]}>
            {filtered.map((p) => (
              <Col key={p.id} xs={12} sm={8} md={6}>
                <Card
                  hoverable={p.stock > 0}
                  styles={{ body: { padding: 12 } }}
                  onClick={() => openProductModal(p)}
                  style={{ opacity: p.stock > 0 ? 1 : 0.5 }}
                >
                  <div
                    style={{
                      height: 60,
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #fff3e8, #ffe0c2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                      fontWeight: 700,
                      color: "#F26B1F",
                    }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <Text strong style={{ display: "block", fontSize: 13 }}>
                    {p.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {p.sku}
                  </Text>
                  <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text strong style={{ color: "#F26B1F" }}>
                      R$ {p.price.toFixed(2)}
                    </Text>
                    <Tag color={p.stock > 5 ? "green" : p.stock > 0 ? "orange" : "red"} style={{ margin: 0 }}>
                      {p.stock}
                    </Tag>
                  </div>
                  {(p.variations?.sizes?.length || p.variations?.colors?.length) ? (
                    <Tag color="orange" style={{ marginTop: 6, fontSize: 10 }}>
                      variações
                    </Tag>
                  ) : null}
                </Card>
              </Col>
            ))}
            {filtered.length === 0 && <Empty style={{ width: "100%", padding: 32 }} />}
          </Row>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <ShoppingCart size={18} /> Comanda
            </Space>
          }
          extra={cart.length > 0 && <Button size="small" type="link" onClick={clearCart}>Limpar</Button>}
        >
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
              options={customers.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
            {selectedCustomer && (
              <div
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 6,
                  background: "#FFF7ED",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Avatar size="small" style={{ background: "#F26B1F" }}>
                  {selectedCustomer.name.charAt(0)}
                </Avatar>
                <div style={{ flex: 1, lineHeight: 1.2 }}>
                  <Text strong style={{ fontSize: 12, display: "block" }}>
                    {selectedCustomer.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {selectedCustomer.phone}
                  </Text>
                </div>
                {selectedCustomer.loyalty && (
                  <Tag color="gold" icon={<Star size={10} />} style={{ margin: 0 }}>
                    Fidelidade
                  </Tag>
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
                    <Button
                      key="r"
                      size="small"
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => removeFromCart(item.id)}
                    />,
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
                          <Text type="secondary" italic style={{ fontSize: 11 }}>
                            "{item.observation}"
                          </Text>
                        )}
                        <Space>
                          <InputNumber
                            size="small"
                            min={1}
                            value={item.qty}
                            onChange={(v) => updateCartQty(item.id, v || 1)}
                            style={{ width: 60 }}
                          />
                          <Text type="secondary">
                            R$ {(item.product.price * item.qty).toFixed(2)}
                          </Text>
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
              options={[
                { value: "percent", label: "%" },
                { value: "value", label: "R$" },
              ]}
              style={{ width: 80 }}
            />
            <InputNumber
              min={0}
              value={discount}
              onChange={(v) => setDiscount(v || 0)}
              style={{ width: "100%" }}
            />
          </Space.Compact>
          {settings.askDiscountReason && discountValue > 0 && (
            <Input
              placeholder="Motivo do desconto"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              style={{ marginBottom: 12 }}
            />
          )}

          <Row justify="space-between">
            <Text>Subtotal</Text>
            <Text>R$ {subtotal.toFixed(2)}</Text>
          </Row>
          <Row justify="space-between">
            <Text type="secondary">Desconto</Text>
            <Text type="secondary">- R$ {discountValue.toFixed(2)}</Text>
          </Row>
          <Row justify="space-between" style={{ marginTop: 8 }}>
            <Title level={4} style={{ margin: 0 }}>Total</Title>
            <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>
              R$ {total.toFixed(2)}
            </Title>
          </Row>

          <Button type="primary" block size="large" style={{ marginTop: 12 }} onClick={finalize}>
            Finalizar Venda
          </Button>
        </Card>
      </Col>

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
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #fff3e8, #ffe0c2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#F26B1F",
                    fontSize: 24,
                  }}
                >
                  {modalProduct.name.charAt(0)}
                </div>
              </Col>
              <Col flex="auto">
                <Text strong style={{ display: "block" }}>{modalProduct.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{modalProduct.sku} · {modalProduct.category}</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong style={{ color: "#F26B1F", fontSize: 18 }}>
                    R$ {modalProduct.price.toFixed(2)}
                  </Text>
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
                  <Select
                    placeholder="Selecione a cor"
                    options={modalProduct.variations.colors.map((c) => ({ value: c, label: c }))}
                  />
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
    </Row>
  );
}
