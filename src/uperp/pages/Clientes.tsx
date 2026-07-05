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
} from "antd";
import { Plus, Pencil, Trash2, Star, Package, Trash } from "lucide-react";
import { useStore } from "../store";
import type { Customer, CustomerSpecialPrice, Product } from "../types";

const { Text } = Typography;

export function Clientes() {
  const { customers, setCustomers, products } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const [specialPrices, setSpecialPrices] = useState<CustomerSpecialPrice[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<React.Key[]>([]);
  const [defaultPrice, setDefaultPrice] = useState<number>(0);

  const openModal = (c: Customer | null) => {
    setEditing(c);
    if (c) {
      form.setFieldsValue(c);
      setSpecialPrices(c.specialPrices || []);
    } else {
      form.resetFields();
      setSpecialPrices([]);
    }
    setSelectedProductIds([]);
    setDefaultPrice(0);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    form.resetFields();
    setSpecialPrices([]);
  };

  const onSave = (v: Omit<Customer, "id" | "loyalty" | "specialPrices">) => {
    const loyalty = specialPrices.length > 0;
    const payload: Omit<Customer, "id"> = { ...v, loyalty, specialPrices };
    if (editing) {
      setCustomers(customers.map((c) => (c.id === editing.id ? { ...editing, ...payload } : c)));
      message.success("Cliente atualizado");
    } else {
      setCustomers([...customers, { ...payload, id: Math.random().toString(36).slice(2) }]);
      message.success("Cliente cadastrado");
    }
    closeModal();
  };

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

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])) as Record<string, Product>,
    [products],
  );

  return (
    <Card
      title="Clientes"
      extra={
        <Button type="primary" icon={<Plus size={14} />} onClick={() => openModal(null)}>
          Novo Cliente
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={customers}
        pagination={{ pageSize: 8 }}
        columns={[
          {
            title: "Nome",
            dataIndex: "name",
            render: (n, c: Customer) => (
              <Space>
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
            width: 120,
            render: (_, c: Customer) => (
              <Space>
                <Button size="small" icon={<Pencil size={14} />} onClick={() => openModal(c)} />
                <Popconfirm
                  title="Remover cliente?"
                  onConfirm={() => {
                    setCustomers(customers.filter((x) => x.id !== c.id));
                    message.success("Cliente removido");
                  }}
                >
                  <Button size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        title={editing ? "Editar Cliente" : "Novo Cliente"}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={editing ? 860 : 560}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={onSave}>
          <Tabs
            defaultActiveKey="dados"
            items={[
              {
                key: "dados",
                label: "Dados",
                children: (
                  <>
                    <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="email" label="E-mail">
                      <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Telefone">
                      <Input />
                    </Form.Item>
                    <Form.Item name="document" label="CPF/CNPJ">
                      <Input />
                    </Form.Item>
                  </>
                ),
              },
              ...(editing
                ? [
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
                            pagination={{ pageSize: 5, size: "small" }}
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
                            <Text strong>
                              <Package size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
                              Produtos vinculados ({specialPrices.length})
                            </Text>
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
                                style={{ marginTop: 8 }}
                                dataSource={specialPrices}
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
                  ]
                : []),
            ]}
          />
        </Form>
      </Modal>
    </Card>
  );
}
