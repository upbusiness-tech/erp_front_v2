import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Tag,
  Statistic,
  Space,
  Popconfirm,
  Progress,
  Typography,
  Select,
  Tabs,
  Modal,
  Empty,
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
  Tag as TagIcon,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "../store";
import type { Product, Category } from "../types";

const { Text, Title } = Typography;

interface VariantRow {
  size?: string;
  color?: string;
  sku: string;
  price: number;
  stock: number;
}

interface ProductFormValues {
  name: string;
  unit?: string;
  supplier?: string;
  category: string;
  variants: VariantRow[];
}

interface ProductFormViewProps {
  editing: Product | null;
  editingGroup: Product[];
  onCancel: () => void;
  onSaved: () => void;
}

function ProductFormView({ editing, editingGroup, onCancel, onSaved }: ProductFormViewProps) {
  const { products, setProducts, categories } = useStore();
  const [form] = Form.useForm<ProductFormValues>();

  const initialValues: ProductFormValues = editing
    ? {
        name: editing.name,
        unit: editing.unit,
        supplier: editing.supplier,
        category: editing.category,
        variants:
          editingGroup.length > 0
            ? editingGroup.map((p) => ({
                size: p.size,
                color: p.color,
                sku: p.sku,
                price: p.price,
                stock: p.stock,
              }))
            : [
                {
                  size: editing.size,
                  color: editing.color,
                  sku: editing.sku,
                  price: editing.price,
                  stock: editing.stock,
                },
              ],
      }
    : {
        name: "",
        category: categories[0]?.name || "",
        variants: [{ sku: "", price: 0, stock: 0 }],
      };

  const onFinish = (v: ProductFormValues) => {
    const list = v.variants || [];
    if (list.length === 0) {
      return message.warning("Adicione pelo menos uma variação");
    }
    if (editing) {
      const idsInGroup = new Set(
        editingGroup.length > 0 ? editingGroup.map((p) => p.id) : [editing.id]
      );
      const groupId =
        editing.variantGroupId || Math.random().toString(36).slice(2);
      const kept = products.filter((p) => !idsInGroup.has(p.id));
      const rebuilt: Product[] = list.map((vr, idx) => {
        const original =
          editingGroup[idx] ||
          (idx === 0 && editingGroup.length === 0 ? editing : null);
        return {
          id: original?.id || Math.random().toString(36).slice(2),
          name: v.name,
          sku: vr.sku,
          price: vr.price,
          stock: vr.stock,
          category: v.category,
          unit: v.unit,
          supplier: v.supplier,
          variantGroupId: list.length > 1 ? groupId : undefined,
          size: vr.size,
          color: vr.color,
        };
      });
      setProducts([...kept, ...rebuilt]);
      message.success("Produto atualizado");
    } else {
      const groupId =
        list.length > 1 ? Math.random().toString(36).slice(2) : undefined;
      const newOnes: Product[] = list.map((vr) => ({
        id: Math.random().toString(36).slice(2),
        name: v.name,
        sku: vr.sku,
        price: vr.price,
        stock: vr.stock,
        category: v.category,
        unit: v.unit,
        supplier: v.supplier,
        variantGroupId: groupId,
        size: vr.size,
        color: vr.color,
      }));
      setProducts([...products, ...newOnes]);
      message.success(
        list.length > 1
          ? `${list.length} variações cadastradas`
          : "Produto cadastrado"
      );
    }
    onSaved();
  };

  return (
    <Card
      title={
        <Space>
          <Button
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={onCancel}
          />
          <Title level={5} style={{ margin: 0 }}>
            {editing ? "Editar Produto" : "Cadastrar Produto"}
          </Title>
        </Space>
      }
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
      >
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="name" label="Nome do produto" rules={[{ required: true }]}>
              <Input placeholder="Ex: Camiseta Básica" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="category" label="Categoria" rules={[{ required: true }]}>
              <Select
                placeholder="Selecione"
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={3}>
            <Form.Item name="unit" label="Unidade">
              <Select
                allowClear
                placeholder="UN"
                options={["UN", "KG", "G", "L", "ML", "M", "CM", "PC", "CX"].map((u) => ({
                  value: u,
                  label: u,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={3}>
            <Form.Item name="supplier" label="Fornecedor">
              <Input placeholder="Opcional" />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 8 }}>
          Variações
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          Cada variação tem SKU, preço e estoque próprios. Nome, categoria, unidade e fornecedor são compartilhados.
        </Text>

        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Row key={field.key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                  <Col xs={12} md={4}>
                    <Form.Item name={[field.name, "size"]} style={{ marginBottom: 0 }}>
                      <Input placeholder="Tamanho" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={5}>
                    <Form.Item name={[field.name, "color"]} style={{ marginBottom: 0 }}>
                      <Input placeholder="Cor" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={5}>
                    <Form.Item
                      name={[field.name, "sku"]}
                      rules={[{ required: true, message: "SKU" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="SKU" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Item
                      name={[field.name, "price"]}
                      rules={[{ required: true, message: "Preço" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber
                        min={0}
                        step={0.5}
                        placeholder="Preço"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={10} md={4}>
                    <Form.Item
                      name={[field.name, "stock"]}
                      rules={[{ required: true, message: "Estoque" }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber min={0} placeholder="Estoque" style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={2} md={2}>
                    <Button
                      danger
                      type="text"
                      icon={<Trash2 size={14} />}
                      disabled={fields.length === 1}
                      onClick={() => remove(field.name)}
                    />
                  </Col>
                </Row>
              ))}
              <Button
                block
                type="dashed"
                icon={<Plus size={14} />}
                onClick={() => add({ sku: "", price: 0, stock: 0 })}
              >
                Adicionar variação
              </Button>
            </>
          )}
        </Form.List>

        <Space style={{ marginTop: 20 }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" htmlType="submit">
            Salvar Produto
          </Button>
        </Space>
      </Form>
    </Card>
  );
}

type View = "list" | "form";

export function Estoque() {
  const { products, setProducts, categories, setCategories } = useStore();
  const [view, setView] = useState<View>("list");
  const [editing, setEditing] = useState<Product | null>(null);
  const [editingGroup, setEditingGroup] = useState<Product[]>([]);
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm] = Form.useForm<{ name: string }>();


  const totalItems = products.reduce((s, p) => s + p.stock, 0);
  const totalSkus = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const avgPrice = totalSkus > 0 ? products.reduce((s, p) => s + p.price, 0) / totalSkus : 0;

  const categoriesAgg = Array.from(
    products.reduce((map, p) => {
      const cur = map.get(p.category) || { items: 0, value: 0 };
      map.set(p.category, { items: cur.items + p.stock, value: cur.value + p.stock * p.price });
      return map;
    }, new Map<string, { items: number; value: number }>())
  );

  const openNew = () => {
    setEditing(null);
    setEditingGroup([]);
    setView("form");
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setEditingGroup(
      p.variantGroupId
        ? products.filter((x) => x.variantGroupId === p.variantGroupId)
        : []
    );
    setView("form");
  };

  const removeProduct = (p: Product) => {
    if (p.variantGroupId) {
      setProducts(products.filter((x) => x.variantGroupId !== p.variantGroupId));
    } else {
      setProducts(products.filter((x) => x.id !== p.id));
    }
    message.success("Produto removido");
  };

  const addCategory = () => {
    const name = newCat.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase()))
      return message.warning("Categoria já existe");
    setCategories([...categories, { id: Math.random().toString(36).slice(2), name }]);
    setNewCat("");
    message.success("Categoria adicionada");
  };

  const removeCategory = (c: Category) => {
    if (products.some((p) => p.category === c.name)) {
      return message.warning("Existem produtos usando esta categoria");
    }
    setCategories(categories.filter((x) => x.id !== c.id));
    message.success("Categoria removida");
  };

  const healthScore = totalSkus
    ? Math.round(((totalSkus - outOfStock - lowStock) / totalSkus) * 100)
    : 100;

  if (view === "form") {
    return (
      <ProductFormView
        editing={editing}
        editingGroup={editingGroup}
        onCancel={() => setView("list")}
        onSaved={() => {
          setView("list");
          setEditing(null);
          setEditingGroup([]);
        }}
      />
    );
  }

  const productCountByCategory = (name: string) =>
    products.filter((p) => p.category === name).length;

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><Card><Statistic title="SKUs cadastrados" value={totalSkus} prefix={<Boxes size={18} />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Total de itens" value={totalItems} prefix={<Package size={18} />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Itens em falta" value={outOfStock} valueStyle={{ color: outOfStock > 0 ? "#DC2626" : undefined }} prefix={<AlertTriangle size={18} />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Estoque baixo" value={lowStock} valueStyle={{ color: lowStock > 0 ? "#F26B1F" : undefined }} prefix={<TrendingDown size={18} />} /></Card></Col>
        <Col xs={12} md={8}><Card><Statistic title="Valor total em estoque" value={totalValue} precision={2} prefix={<DollarSign size={18} />} valueStyle={{ color: "#F26B1F" }} /></Card></Col>
        <Col xs={12} md={8}><Card><Statistic title="Ticket médio (preço)" value={avgPrice} precision={2} prefix="R$" /></Card></Col>
        <Col xs={24} md={8}>
          <Card>
            <Text type="secondary" style={{ fontSize: 13 }}>Saúde do estoque</Text>
            <Progress percent={healthScore} strokeColor={healthScore > 70 ? "#16A34A" : healthScore > 40 ? "#F26B1F" : "#DC2626"} style={{ marginTop: 4 }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {totalSkus - outOfStock - lowStock} de {totalSkus} SKUs com estoque saudável
            </Text>
          </Card>
        </Col>
      </Row>

      <Card title={<Space><Layers size={16} /> Distribuição por categoria</Space>} style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {categoriesAgg.map(([name, info]) => {
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

      <Card>
        <Tabs
          defaultActiveKey="produtos"
          tabBarExtraContent={
            <Button type="primary" icon={<Plus size={14} />} onClick={openNew}>
              Novo Produto
            </Button>
          }
          items={[
            {
              key: "produtos",
              label: (
                <Space size={4}>
                  <Archive size={14} /> Produtos
                </Space>
              ),
              children: (
                <Table
                  rowKey="id"
                  dataSource={products}
                  pagination={{ pageSize: 8 }}
                  scroll={{ x: 900 }}
                  columns={[
                    { title: "SKU", dataIndex: "sku", width: 110 },
                    {
                      title: "Produto",
                      dataIndex: "name",
                      render: (n: string, p: Product) => (
                        <Space direction="vertical" size={0}>
                          <Text strong>{n}</Text>
                          {(p.size || p.color) && (
                            <Space size={4}>
                              {p.size && <Tag style={{ margin: 0 }} color="orange">{p.size}</Tag>}
                              {p.color && <Tag style={{ margin: 0 }}>{p.color}</Tag>}
                            </Space>
                          )}
                        </Space>
                      ),
                    },
                    { title: "Categoria", dataIndex: "category" },
                    { title: "Un.", dataIndex: "unit", width: 70, render: (u: string) => u || "—" },
                    { title: "Fornecedor", dataIndex: "supplier", render: (u: string) => u || "—" },
                    { title: "Preço", dataIndex: "price", render: (v: number) => `R$ ${v.toFixed(2)}` },
                    {
                      title: "Estoque",
                      dataIndex: "stock",
                      render: (v: number) => (
                        <Tag color={v > 5 ? "green" : v > 0 ? "orange" : "red"}>{v} un.</Tag>
                      ),
                    },
                    {
                      title: "Ações",
                      width: 110,
                      render: (_, p) => (
                        <Space>
                          <Button size="small" icon={<Pencil size={14} />} onClick={() => openEdit(p)} />
                          <Popconfirm title="Remover produto?" onConfirm={() => removeProduct(p)}>
                            <Button size="small" danger icon={<Trash2 size={14} />} />
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              ),
            },
            {
              key: "categorias",
              label: (
                <Space size={4}>
                  <TagIcon size={14} /> Categorias
                </Space>
              ),
              children: (
                <>
                  <Space.Compact style={{ width: "100%", maxWidth: 480, marginBottom: 16 }}>
                    <Input
                      placeholder="Nome da nova categoria"
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      onPressEnter={addCategory}
                    />
                    <Button type="primary" icon={<Plus size={14} />} onClick={addCategory}>
                      Adicionar
                    </Button>
                  </Space.Compact>
                  <List
                    dataSource={categories}
                    locale={{ emptyText: "Nenhuma categoria cadastrada" }}
                    renderItem={(c) => {
                      const count = productCountByCategory(c.name);
                      return (
                        <List.Item
                          actions={[
                            <Tag key="c" color="orange">{count} produto{count === 1 ? "" : "s"}</Tag>,
                            <Popconfirm
                              key="del"
                              title="Remover categoria?"
                              onConfirm={() => removeCategory(c)}
                            >
                              <Button size="small" danger type="text" icon={<Trash2 size={14} />} />
                            </Popconfirm>,
                          ]}
                        >
                          <Space>
                            <TagIcon size={14} color="#F26B1F" />
                            {c.name}
                          </Space>
                        </List.Item>
                      );
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
