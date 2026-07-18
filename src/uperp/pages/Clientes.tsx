import { useMemo, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Tag,
  Space,
  message,
  Popconfirm,
  Tabs,
  InputNumber,
  Typography,
  Empty,
  Row,
  Col,
  Avatar,
  Descriptions,
} from "antd";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Package,
  Trash,
  Eye,
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { useStore } from "../store";
import type { Customer, CustomerSpecialPrice, Product } from "../types";

const { Text, Title } = Typography;

type Mode = "list" | "form";

export function Clientes() {
  const { customers, setCustomers, products } = useStore();
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Customer | null>(null);

  const [viewing, setViewing] = useState<Customer | null>(null);

  const openNew = () => {
    setEditing(null);
    setMode("form");
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setMode("form");
  };
  const openView = (c: Customer) => setViewing(c);

  const removeCustomer = (c: Customer) => {
    setCustomers(customers.filter((x) => x.id !== c.id));
    message.success("Cliente removido");
  };

  const handleSave = (payload: Omit<Customer, "id">) => {
    if (editing) {
      setCustomers(customers.map((c) => (c.id === editing.id ? { ...editing, ...payload } : c)));
      message.success("Cliente atualizado");
    } else {
      setCustomers([...customers, { ...payload, id: Math.random().toString(36).slice(2) }]);
      message.success("Cliente cadastrado");
    }
    setMode("list");
    setEditing(null);
  };

  if (mode === "form") {
    return (
      <CustomerFormView
        editing={editing}
        onCancel={() => {
          setMode("list");
          setEditing(null);
        }}
        onSave={handleSave}
        products={products}
      />
    );
  }

  return (
    <>
      <Card
        title="Clientes"
        extra={
          <Button type="primary" icon={<Plus size={14} />} onClick={openNew}>
            Novo Cliente
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={customers}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 700 }}
          columns={[
            {
              title: "Nome",
              dataIndex: "name",
              render: (n, c: Customer) => (
                <Space>
                  <Avatar size="small" style={{ background: "#F26B1F" }}>{n.charAt(0)}</Avatar>
                  {n}
                  {(c.specialPrices?.length || 0) > 0 && (
                    <Tag color="orange" icon={<Star size={11} style={{ marginRight: 2 }} />}>
                      Fidelidade ({c.specialPrices?.length})
                    </Tag>
                  )}
                </Space>
              ),
            },
            { title: "E-mail", dataIndex: "email" },
            { title: "Telefone", dataIndex: "phone" },
            { title: "Documento", dataIndex: "document" },
            {
              title: "Ações",
              width: 160,
              render: (_, c: Customer) => (
                <Space>
                  <Button size="small" icon={<Eye size={14} />} onClick={() => openView(c)} />
                  <Button size="small" icon={<Pencil size={14} />} onClick={() => openEdit(c)} />
                  <Popconfirm title="Remover cliente?" onConfirm={() => removeCustomer(c)}>
                    <Button size="small" danger icon={<Trash2 size={14} />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <CustomerViewModal
        customer={viewing}
        onClose={() => setViewing(null)}
        products={products}
        onEdit={() => {
          if (viewing) {
            openEdit(viewing);
            setViewing(null);
          }
        }}
      />
    </>
  );
}

/* ---------- View-only modal ---------- */

function CustomerViewModal({
  customer,
  onClose,
  products,
  onEdit,
}: {
  customer: Customer | null;
  onClose: () => void;
  products: Product[];
  onEdit: () => void;
}) {
  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])) as Record<string, Product>,
    [products],
  );

  return (
    <Modal
      open={customer !== null}
      title={customer ? `Cliente: ${customer.name}` : ""}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Fechar</Button>
          <Button type="primary" icon={<Pencil size={14} />} onClick={onEdit}>Editar</Button>
        </Space>
      }
      width={720}
      destroyOnHidden
    >
      {customer && (
        <Tabs
          defaultActiveKey="dados"
          items={[
            {
              key: "dados",
              label: "Dados gerais",
              children: (
                <Descriptions bordered column={1} size="small">
                  <Descriptions.Item label="Nome">{customer.name}</Descriptions.Item>
                  <Descriptions.Item label="E-mail">{customer.email || "—"}</Descriptions.Item>
                  <Descriptions.Item label="Telefone">{customer.phone || "—"}</Descriptions.Item>
                  <Descriptions.Item label="CPF/CNPJ">{customer.document || "—"}</Descriptions.Item>
                  <Descriptions.Item label="Fidelidade">
                    {(customer.specialPrices?.length || 0) > 0 ? (
                      <Tag color="orange" icon={<Star size={11} />}>
                        {customer.specialPrices!.length} produto(s)
                      </Tag>
                    ) : (
                      <Text type="secondary">Nenhum preço especial</Text>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: "prices",
              label: `Preços Especiais (${customer.specialPrices?.length || 0})`,
              children:
                !customer.specialPrices?.length ? (
                  <Empty description="Nenhum preço especial cadastrado" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Table
                    rowKey="productId"
                    size="small"
                    dataSource={customer.specialPrices}
                    pagination={false}
                    columns={[
                      {
                        title: "Produto",
                        dataIndex: "productId",
                        render: (id: string) => productById[id]?.name || id,
                      },
                      {
                        title: "Preço original",
                        dataIndex: "productId",
                        width: 130,
                        render: (id: string) => (
                          <Text delete type="secondary">R$ {(productById[id]?.price || 0).toFixed(2)}</Text>
                        ),
                      },
                      {
                        title: "Preço especial",
                        dataIndex: "price",
                        width: 130,
                        render: (v: number) => <Text strong style={{ color: "#F26B1F" }}>R$ {v.toFixed(2)}</Text>,
                      },
                    ]}
                  />
                ),
            },
          ]}
        />
      )}
    </Modal>
  );
}

/* ---------- Dedicated Form View ---------- */

interface CustomerFormViewProps {
  editing: Customer | null;
  onCancel: () => void;
  onSave: (payload: Omit<Customer, "id">) => void;
  products: Product[];
}

function CustomerFormView({ editing, onCancel, onSave, products }: CustomerFormViewProps) {
  const [form] = Form.useForm();
  const [specialPrices, setSpecialPrices] = useState<CustomerSpecialPrice[]>(editing?.specialPrices || []);
  const [selectedProductIds, setSelectedProductIds] = useState<React.Key[]>([]);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])) as Record<string, Product>,
    [products],
  );

  const initialValues = editing
    ? {
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        document: editing.document,
      }
    : {};

  const linkSelected = () => {
    if (selectedProductIds.length === 0) return message.warning("Selecione produtos.");
    if (!defaultPrice || defaultPrice <= 0) return message.warning("Informe um preço especial.");
    setSpecialPrices((prev) => {
      const map = new Map(prev.map((s) => [s.productId, s]));
      selectedProductIds.forEach((id) => map.set(String(id), { productId: String(id), price: defaultPrice }));
      return Array.from(map.values());
    });
    setSelectedProductIds([]);
    message.success("Preço especial vinculado");
  };

  const removeSpecial = (productId: string) =>
    setSpecialPrices((arr) => arr.filter((s) => s.productId !== productId));

  const updateSpecialPrice = (productId: string, price: number) =>
    setSpecialPrices((arr) => arr.map((s) => (s.productId === productId ? { ...s, price } : s)));

  const onFinish = (v: { name: string; email?: string; phone?: string; document?: string }) => {
    const loyalty = specialPrices.length > 0;
    onSave({
      name: v.name,
      email: v.email || "",
      phone: v.phone || "",
      document: v.document || "",
      loyalty,
      specialPrices,
    });
  };

  return (
    <Card
      title={
        <Space>
          <Button icon={<ArrowLeft size={14} />} onClick={onCancel} type="text" />
          {editing ? `Editar Cliente: ${editing.name}` : "Novo Cliente"}
        </Space>
      }
      extra={
        <Space>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Salvar Cliente
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
        <Tabs
          defaultActiveKey="dados"
          items={[
            {
              key: "dados",
              label: "Dados",
              children: (
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="name" label={<Space><User size={12} />Nome</Space>} rules={[{ required: true }]}>
                      <Input placeholder="Nome do cliente" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label={<Space><Mail size={12} />E-mail</Space>}>
                      <Input placeholder="email@dominio.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="phone" label={<Space><Phone size={12} />Telefone</Space>}>
                      <Input placeholder="(00) 00000-0000" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="document" label={<Space><FileText size={12} />CPF/CNPJ</Space>}>
                      <Input placeholder="000.000.000-00" />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: "prices",
              label: `Preços Especiais (${specialPrices.length})`,
              children: (
                <>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Selecione produtos e defina um preço especial para este cliente.
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      margin: "12px 0",
                      padding: 12,
                      background: "#FFF7ED",
                      borderRadius: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>Preço especial (R$)</Text>
                    <InputNumber
                      min={0}
                      step={1}
                      value={defaultPrice}
                      onChange={(v) => setDefaultPrice(v || 0)}
                      style={{ width: 140 }}
                    />
                    <Button
                      type="primary"
                      icon={<Plus size={14} />}
                      onClick={linkSelected}
                      disabled={selectedProductIds.length === 0}
                    >
                      Vincular {selectedProductIds.length > 0 ? `(${selectedProductIds.length})` : ""}
                    </Button>
                  </div>

                  <Table
                    rowKey="id"
                    size="small"
                    dataSource={products}
                    pagination={{ pageSize: 6, size: "small" }}
                    scroll={{ x: 520 }}
                    rowSelection={{
                      selectedRowKeys: selectedProductIds,
                      onChange: setSelectedProductIds,
                    }}
                    columns={[
                      { title: "Produto", dataIndex: "name" },
                      { title: "SKU", dataIndex: "sku", width: 100 },
                      {
                        title: "Preço",
                        dataIndex: "price",
                        width: 100,
                        render: (v: number) => `R$ ${v.toFixed(2)}`,
                      },
                      {
                        title: "Especial",
                        width: 110,
                        render: (_, p: Product) => {
                          const sp = specialPrices.find((s) => s.productId === p.id);
                          return sp ? (
                            <Tag color="orange">R$ {sp.price.toFixed(2)}</Tag>
                          ) : (
                            <Text type="secondary">—</Text>
                          );
                        },
                      },
                    ]}
                  />

                  <div style={{ marginTop: 16 }}>
                    <Title level={5} style={{ margin: "0 0 8px" }}>
                      <Package size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
                      Produtos vinculados ({specialPrices.length})
                    </Title>
                    {specialPrices.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Nenhum preço especial"
                        style={{ margin: "12px 0" }}
                      />
                    ) : (
                      <Table
                        rowKey="productId"
                        size="small"
                        dataSource={specialPrices}
                        pagination={false}
                        scroll={{ x: 520 }}
                        columns={[
                          {
                            title: "Produto",
                            dataIndex: "productId",
                            render: (id: string) => productById[id]?.name || id,
                          },
                          {
                            title: "Preço original",
                            dataIndex: "productId",
                            width: 130,
                            render: (id: string) => `R$ ${(productById[id]?.price || 0).toFixed(2)}`,
                          },
                          {
                            title: "Preço especial",
                            dataIndex: "price",
                            width: 160,
                            render: (v: number, r) => (
                              <InputNumber
                                min={0}
                                step={1}
                                value={v}
                                onChange={(val) => updateSpecialPrice(r.productId, val || 0)}
                                size="small"
                                prefix="R$"
                                style={{ width: "100%" }}
                              />
                            ),
                          },
                          {
                            title: "",
                            width: 40,
                            render: (_, r) => (
                              <Button
                                size="small"
                                type="text"
                                danger
                                icon={<Trash size={14} />}
                                onClick={() => removeSpecial(r.productId)}
                              />
                            ),
                          },
                        ]}
                      />
                    )}
                  </div>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Card>
  );
}
