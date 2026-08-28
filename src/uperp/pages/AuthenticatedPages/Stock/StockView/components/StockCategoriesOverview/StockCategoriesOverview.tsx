import { Button, ColorPicker, Input, Popconfirm, Space, Table, Typography } from "antd";

import { ProductCategoryModel } from "@/model/productCategory.model";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EditCategoryModal } from "./components/EditCategoryModal/EditCategoryModal";
import { useStockCategoriesOverviewController } from "./useStockCategoriesOverview.controller";
import { StockCategoryStats } from "../StockCategoryStats/StockCategoryStats";

const { Text } = Typography;

export const StockCategoriesOverview = () => {
  const {
    category,
    setCategory,
    color,
    setColor,
    submitCategory,
    categories,
    submiting,
    refreshCategories,
    editingCat,
    setEditingCat,
    handleDelete,
  } = useStockCategoriesOverviewController();

  return (
    <>
      <StockCategoryStats />

      <Space.Compact style={{ width: "100%", maxWidth: 560, marginBottom: 16 }}>
        <ColorPicker
          value={color}
          onChange={(c) => setColor(c.toHexString())}
          style={{ width: 40, padding: 2 }}
        />
        <Input
          placeholder="Nome da nova categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onPressEnter={submitCategory}
        />
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={submitCategory}
          loading={submiting}
        >
          Adicionar
        </Button>
      </Space.Compact>
      <Table
        rowKey="id"
        dataSource={categories?.data ?? []}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 480 }}
        locale={{ emptyText: "Nenhuma categoria cadastrada" }}
        columns={[
          {
            title: "Categoria",
            dataIndex: "name",
            render: (n: string, r: ProductCategoryModel) => (
              <Space>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: r.color ?? "#F26B1F",
                  }}
                />
                <Text strong>{n}</Text>
              </Space>
            ),
          },
          {
            title: "Ações",
            width: 150,
            render: (_, c: ProductCategoryModel) => (
              <Space>
                <Button size="small" icon={<Pencil size={14} />} onClick={() => setEditingCat(c)} />
                <Popconfirm title="Remover categoria?" onConfirm={() => handleDelete(c.id)}>
                  <Button size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <EditCategoryModal
        editingCat={editingCat}
        onClose={() => setEditingCat(null)}
        onSuccess={refreshCategories}
      />
    </>
  );
};
