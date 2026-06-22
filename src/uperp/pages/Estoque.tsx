import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Tag,
  Statistic,
  Space,
  Popconfirm,
  Progress,
  Typography,
  message,
} from "antd";
import {
  Package,
  AlertTriangle,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Layers,
  TrendingDown,
  Boxes,
  Archive,
} from "lucide-react";
import { useStore } from "../store";
import type { Product } from "../types";

const { Text } = Typography;

export function Estoque() {
  const { products, setProducts } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const totalItems = products.reduce((s, p) => s + p.stock, 0);
  const totalSkus = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const avgPrice = totalSkus > 0 ? products.reduce((s, p) => s + p.price, 0) / totalSkus : 0;

  const categories = Array.from(
    products.reduce((map, p) => {
      const cur = map.get(p.category) || { items: 0, value: 0 };
      map.set(p.category, { items: cur.items + p.stock, value: cur.value + p.stock * p.price });
      return map;
    }, new Map<string, { items: number; value: number }>())
  );

  const onSave = (v: Omit<Product, "id">) => {
    if (editing) {
      setProducts(products.map((p) => (p.id === editing.id ? { ...editing, ...v } : p)));
      message.success("Produto atualizado");
    } else {
      setProducts([...products, { ...v, id: Math.random().toString(36).slice(2) }]);
      message.success("Produto cadastrado");
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    form.setFieldsValue(p);
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const healthScore = totalSkus
    ? Math.round(((totalSkus - outOfStock - lowStock) / totalSkus) * 100)
    : 100;

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="SKUs cadastrados" value={totalSkus} prefix={<Boxes size={18} />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Total de itens" value={totalItems} prefix={<Package size={18} />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Itens em falta"
              value={outOfStock}
              valueStyle={{ color: outOfStock > 0 ? "#DC2626" : undefined }}
              prefix={<AlertTriangle size={18} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Estoque baixo"
              value={lowStock}
              valueStyle={{ color: lowStock > 0 ? "#F26B1F" : undefined }}
              prefix={<TrendingDown size={18} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="Valor total em estoque"
              value={totalValue}
              precision={2}
              prefix={<DollarSign size={18} />}
              valueStyle={{ color: "#F26B1F" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="Ticket médio (preço)"
              value={avgPrice}
              precision={2}
              prefix="R$"
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Text type="secondary" style={{ fontSize: 13 }}>Saúde do estoque</Text>
            <Progress
              percent={healthScore}
              strokeColor={healthScore > 70 ? "#16A34A" : healthScore > 40 ? "#F26B1F" : "#DC2626"}
              style={{ marginTop: 4 }}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {totalSkus - outOfStock - lowStock} de {totalSkus} SKUs com estoque saudável
            </Text>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <Layers size={16} /> Distribuição por categoria
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          {categories.map(([name, info]) => {
            const pct = totalItems > 0 ? Math.round((info.items / totalItems) * 100) : 0;
            return (
              <Col key={name} xs={24} sm={12} md={8}>
                <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                  <Text strong>{name}</Text>
                  <Text type="secondary">{info.items} un.</Text>
                </div>
                <Progress percent={pct} strokeColor="#F26B1F" showInfo={false} />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  R$ {info.value.toFixed(2)} · {pct}% do estoque
                </Text>
              </Col>
            );
          })}
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <Archive size={16} /> Produtos
          </Space>
        }
        extra={
          <Button type="primary" icon={<Plus size={14} />} onClick={openNew}>
            Novo Produto
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={products}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: "SKU", dataIndex: "sku", width: 100 },
            { title: "Produto", dataIndex: "name" },
            { title: "Categoria", dataIndex: "category" },
            {
              title: "Preço",
              dataIndex: "price",
              render: (v: number) => `R$ ${v.toFixed(2)}`,
            },
            {
              title: "Estoque",
              dataIndex: "stock",
              render: (v: number) => (
                <Tag color={v > 5 ? "green" : v > 0 ? "orange" : "red"}>{v} un.</Tag>
              ),
            },
            {
              title: "Ações",
              width: 120,
              render: (_, p) => (
                <Space>
                  <Button size="small" icon={<Pencil size={14} />} onClick={() => openEdit(p)} />
                  <Popconfirm
                    title="Remover produto?"
                    onConfirm={() => {
                      setProducts(products.filter((x) => x.id !== p.id));
                      message.success("Produto removido");
                    }}
                  >
                    <Button size="small" danger icon={<Trash2 size={14} />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={open}
        title={editing ? "Editar Produto" : "Novo Produto"}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form} onFinish={onSave}>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="price" label="Preço (R$)" rules={[{ required: true }]}>
                <InputNumber min={0} step={0.5} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stock" label="Estoque" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}
