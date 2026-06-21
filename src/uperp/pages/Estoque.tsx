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
  message,
} from "antd";
import { Package, AlertTriangle, DollarSign, Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../store";
import type { Product } from "../types";

export function Estoque() {
  const { products, setProducts } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const totalItems = products.reduce((s, p) => s + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);

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

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total de itens" value={totalItems} prefix={<Package size={18} />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Itens em falta"
              value={outOfStock}
              valueStyle={{ color: outOfStock > 0 ? "#DC2626" : undefined }}
              prefix={<AlertTriangle size={18} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Valor total"
              value={totalValue}
              precision={2}
              prefix={<DollarSign size={18} />}
              valueStyle={{ color: "#F26B1F" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Produtos"
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
