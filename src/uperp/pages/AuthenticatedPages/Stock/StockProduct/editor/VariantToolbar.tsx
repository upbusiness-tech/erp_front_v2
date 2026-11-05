import { Button, Input, Select, Space, Tag, Typography } from "antd";
import { Plus, Search } from "lucide-react";
import type { VariantFilter, VariantSort } from "./types";

const { Text } = Typography;

type VariantToolbarProps = {
  search: string;
  setSearch: (value: string) => void;
  filter: VariantFilter;
  setFilter: (value: VariantFilter) => void;
  sort: VariantSort;
  setSort: (value: VariantSort) => void;
  filteredCount: number;
  focusVariantId: number | null;
  onClearFocus: () => void;
  onAdd: () => void;
};

const filterOptions: { value: VariantFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "invalid", label: "Inválidas" },
  { value: "with_stock", label: "Com estoque" },
  { value: "without_stock", label: "Sem estoque" },
  { value: "no_price", label: "Sem preço" },
];

const sortOptions: { value: string; label: string }[] = [
  { value: "code_asc", label: "Código (A→Z)" },
  { value: "code_desc", label: "Código (Z→A)" },
  { value: "salePrice_asc", label: "Venda (↑)" },
  { value: "salePrice_desc", label: "Venda (↓)" },
  { value: "costPrice_asc", label: "Custo (↑)" },
  { value: "costPrice_desc", label: "Custo (↓)" },
  { value: "stockQuantity_asc", label: "Estoque (↑)" },
  { value: "stockQuantity_desc", label: "Estoque (↓)" },
];

export function VariantToolbar({
  search,
  setSearch,
  filter,
  setFilter,
  sort,
  setSort,
  filteredCount,
  focusVariantId,
  onClearFocus,
  onAdd,
}: VariantToolbarProps) {
  const sortValue = `${sort.field}_${sort.order}`;

  const handleSortChange = (value: string) => {
    const lastUnderscore = value.lastIndexOf("_");
    const field = value.slice(0, lastUnderscore) as VariantSort["field"];
    const order = value.slice(lastUnderscore + 1) as VariantSort["order"];
    setSort({ field, order });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Input
          prefix={<Search size={14} style={{ color: "#bbb" }} />}
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por código, barras, tamanho, cor ou marca"
          style={{ maxWidth: 360, flex: "1 1 220px" }}
        />
        <Select
          value={filter}
          onChange={setFilter}
          options={filterOptions}
          style={{ width: 150 }}
          placeholder="Filtrar"
        />
        <Select
          value={sortValue}
          onChange={handleSortChange}
          options={sortOptions}
          style={{ width: 160 }}
          placeholder="Ordenar"
        />
        <Button icon={<Plus size={14} />} onClick={onAdd} style={{ marginLeft: "auto" }}>
          Adicionar variação
        </Button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {focusVariantId !== null && (
          <Tag closable color="blue" onClose={onClearFocus} style={{ margin: 0 }}>
            Variação #{focusVariantId}
          </Tag>
        )}
        <Text type="secondary" style={{ fontSize: 12 }}>
          {filteredCount} {filteredCount === 1 ? "variação" : "variações"}
        </Text>
      </div>
    </div>
  );
}
