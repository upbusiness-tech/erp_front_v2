import { Button, Empty, Popconfirm, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { VariationTags } from "@/application-components/VariationTags/VariationTags";
import type { ProductSupplierModel } from "@/model/productSupplier.model";
import { extractStockFormatByUnit, formatPrice } from "@/uperp/common/formulas/productFormulas";
import type { DraftValidation, VariantDiff, VariantDraft } from "./types";

const { Text } = Typography;

type VariantTableProps = {
  rows: VariantDraft[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  validation: DraftValidation;
  diff: VariantDiff;
  suppliers?: { data: ProductSupplierModel[] };
  unitOfMeasure: string;
  isEmpty: boolean;
  onEdit: (variant: VariantDraft) => void;
  onDuplicate: (variant: VariantDraft) => void;
  onRemove: (variant: VariantDraft) => void;
  onAdd: () => void;
};

export function VariantTable({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  validation,
  diff,
  suppliers,
  unitOfMeasure,
  isEmpty,
  onEdit,
  onDuplicate,
  onRemove,
  onAdd,
}: VariantTableProps) {
  const columns = useMemo<ColumnsType<VariantDraft>>(
    () => [
      {
        title: "Código",
        dataIndex: "code",
        width: 120,
        render: (code: string, row) => code || `#${row.id ?? "novo"}`,
      },
      {
        title: "Variação",
        key: "variation",
        render: (_, row) => <VariationTags specification={row} fallback />,
      },
      {
        title: "Fornecedor",
        key: "supplier",
        width: 160,
        render: (_, row) =>
          suppliers?.data.find((supplier) => supplier.id === row.productSupplierId)?.name ?? "—",
      },
      {
        title: "Venda",
        dataIndex: "salePrice",
        width: 110,
        render: (salePrice: number) => formatPrice(salePrice),
      },
      {
        title: "Custo",
        dataIndex: "costPrice",
        width: 110,
        render: (costPrice: number) => formatPrice(costPrice),
      },
      {
        title: "Estoque",
        dataIndex: "stockQuantity",
        width: 110,
        render: (stockQuantity: number) => extractStockFormatByUnit(unitOfMeasure, stockQuantity),
      },
      {
        title: "Status",
        key: "status",
        width: 110,
        render: (_, row) => {
          if (validation.byKey.has(row.key)) return <Tag color="red">Inválida</Tag>;
          if (row.isNew) return <Tag color="blue">Nova</Tag>;
          if (row.id !== undefined && diff.variants.some((variant) => variant.id === row.id)) {
            return <Tag color="gold">Atualizada</Tag>;
          }
          return <Text type="secondary">—</Text>;
        },
      },
      {
        title: "Ações",
        key: "actions",
        width: 130,
        render: (_, row) => (
          <Space size={2} onClick={(event) => event.stopPropagation()}>
            <Button
              size="small"
              type="text"
              title="Editar"
              icon={<Pencil size={14} />}
              onClick={() => onEdit(row)}
            />
            <Button
              size="small"
              type="text"
              title="Duplicar"
              icon={<Copy size={14} />}
              onClick={() => onDuplicate(row)}
            />
            <Popconfirm
              title="Remover variação?"
              description="A remoção será aplicada ao salvar o produto."
              okText="Remover"
              cancelText="Cancelar"
              onConfirm={() => onRemove(row)}
            >
              <Button
                size="small"
                type="text"
                danger
                title="Remover"
                icon={<Trash2 size={14} />}
                onClick={(event) => event.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [diff.variants, onDuplicate, onEdit, onRemove, suppliers, unitOfMeasure, validation],
  );

  if (isEmpty) {
    return (
      <Empty
        description="Nenhuma variação cadastrada"
        style={{ padding: "32px 0" }}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button icon={<Plus size={14} />} onClick={onAdd}>
          Adicionar variação
        </Button>
      </Empty>
    );
  }

  return (
    <Table<VariantDraft>
      rowKey="key"
      size="middle"
      columns={columns}
      dataSource={rows}
      scroll={{ x: 980 }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
        showTotal: (totalCount, range) => `${range[0]}-${range[1]} de ${totalCount} variações`,
      }}
      onRow={(record) => ({
        onClick: () => onEdit(record),
        style: validation.byKey.has(record.key)
          ? { background: "#fff1f0", cursor: "pointer" }
          : { cursor: "pointer" },
      })}
    />
  );
}
