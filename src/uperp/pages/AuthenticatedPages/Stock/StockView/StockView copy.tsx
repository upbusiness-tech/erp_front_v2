import {
  Card,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

import {
  AlertTriangle,
  Boxes,
  DollarSign,
  Layers,
  Package,
  Tag as TagIcon,
  TrendingDown,
} from "lucide-react";
import { useStore } from "../../../../store";
import type { Category, Product } from "../../../../types";
import { StockTab } from "./components/StockTab/StockTab";
import { useStockViewController } from "./useStockView.controller";

const { Text } = Typography;

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

type View = "list" | "form";

type StockViewProps = {
  a?: string;
};

export const StockView = ({ a }: StockViewProps) => {
  const { handleGoToCreateProduct } = useStockViewController();

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
    }, new Map<string, { items: number; value: number }>()),
  );

  const openNew = () => {
    setEditing(null);
    setEditingGroup([]);
    setView("form");
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setEditingGroup(
      p.variantGroupId ? products.filter((x) => x.variantGroupId === p.variantGroupId) : [],
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

  const openEditCat = (c: Category) => {
    setEditingCat(c);
    catForm.setFieldsValue({ name: c.name });
  };

  const renameCategory = ({ name }: { name: string }) => {
    if (!editingCat) return;
    const trimmed = name.trim();
    if (!trimmed) return message.warning("Informe um nome");
    if (
      categories.some(
        (c) => c.id !== editingCat.id && c.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      return message.warning("Já existe uma categoria com esse nome");
    }
    const oldName = editingCat.name;
    setCategories(categories.map((c) => (c.id === editingCat.id ? { ...c, name: trimmed } : c)));
    if (trimmed !== oldName) {
      setProducts(products.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)));
    }
    message.success("Categoria atualizada");
    setEditingCat(null);
  };

  const healthScore = totalSkus
    ? Math.round(((totalSkus - outOfStock - lowStock) / totalSkus) * 100)
    : 100;

  const productCountByCategory = (name: string) =>
    products.filter((p) => p.category === name).length;

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
            <Statistic title="Ticket médio (preço)" value={avgPrice} precision={2} prefix="R$" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Saúde do estoque
            </Text>
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
        <StockTab onNewProduct={handleGoToCreateProduct} />
      </Card>
    </>
  );
};
