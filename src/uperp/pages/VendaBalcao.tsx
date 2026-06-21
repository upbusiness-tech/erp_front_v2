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
  message,
} from "antd";
import { Lock, LockOpen, ShoppingCart, Trash2, Search } from "lucide-react";
import { useStore } from "../store";
import type { Sale } from "../types";

const { Title, Text } = Typography;

export function VendaBalcao() {
  const {
    products,
    cashOpen,
    toggleCash,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    addSale,
  } = useStore();
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percent" | "value">("percent");

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

  const finalize = () => {
    if (!cashOpen) return message.warning("Abra o caixa antes de finalizar uma venda.");
    if (cart.length === 0) return message.warning("Carrinho vazio.");
    const sale: Sale = {
      id: `V${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().slice(0, 10),
      total,
      items: cart.reduce((s, i) => s + i.qty, 0),
      type: "balcao",
    };
    addSale(sale);
    clearCart();
    setDiscount(0);
    message.success(`Venda ${sale.id} finalizada! Total R$ ${total.toFixed(2)}`);
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={16}>
        <Card
          style={{ marginBottom: 16, borderLeft: `4px solid ${cashOpen ? "#16A34A" : "#DC2626"}` }}
          styles={{ body: { padding: 16 } }}
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
              <Button type={cashOpen ? "default" : "primary"} danger={cashOpen} onClick={toggleCash}>
                {cashOpen ? "Fechar Caixa" : "Abrir Caixa"}
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
                  onClick={() => {
                    if (p.stock <= 0) return message.error("Produto sem estoque");
                    addToCart(p);
                    message.success(`${p.name} adicionado`);
                  }}
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
                      onClick={() => removeFromCart(item.product.id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.product.name}
                    description={
                      <Space>
                        <InputNumber
                          size="small"
                          min={1}
                          value={item.qty}
                          onChange={(v) => updateCartQty(item.product.id, v || 1)}
                          style={{ width: 60 }}
                        />
                        <Text type="secondary">
                          R$ {(item.product.price * item.qty).toFixed(2)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}

          <Divider style={{ margin: "12px 0" }} />
          <Text type="secondary">Desconto</Text>
          <Space.Compact style={{ width: "100%", marginTop: 4, marginBottom: 12 }}>
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
    </Row>
  );
}
