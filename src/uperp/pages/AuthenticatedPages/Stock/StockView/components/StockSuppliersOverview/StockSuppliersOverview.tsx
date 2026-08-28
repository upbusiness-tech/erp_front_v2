import { Button, Input, Popconfirm, Space, Table, Typography } from "antd";

import { ProductSupplierModel } from "@/model/productSupplier.model";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useStockSuppliersOverviewController } from "./useStockSuppliersOverview.controller";
import { EditSupplierModal } from "./components/EditSupplierModal/EditSupplierModal";

const { Text } = Typography;

export const StockSupplierOverview = () => {
  const {
    suppliers,
    refreshSuppliers,
    setSupplierName,
    supplierName,
    submiting,
    editingSupplier,
    setEditingSupplier,
    handleDelete,
    submitSupplier,
  } = useStockSuppliersOverviewController();

  return (
    <>
      <Space.Compact style={{ width: "100%", maxWidth: 560, marginBottom: 16 }}>
        <Input
          placeholder="Nome do novo fornecedor"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          onPressEnter={submitSupplier}
        />
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={submitSupplier}
          loading={submiting}
        >
          Adicionar
        </Button>
      </Space.Compact>
      <Table
        rowKey="id"
        dataSource={suppliers?.data ?? []}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 480 }}
        locale={{ emptyText: "Nenhum fornecedor cadastrados" }}
        columns={[
          {
            title: "Fornecedor",
            dataIndex: "name",
            render: (n: string, r: ProductSupplierModel) => (
              <Space>
                <Text strong>{n}</Text>
              </Space>
            ),
          },
          {
            title: "Ações",
            width: 150,
            render: (_, c: ProductSupplierModel) => (
              <Space>
                <Button
                  size="small"
                  icon={<Pencil size={14} />}
                  onClick={() => setEditingSupplier(c)}
                />
                <Popconfirm title="Remover categoria?" onConfirm={() => handleDelete(c.id)}>
                  <Button size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <EditSupplierModal
        editingSupplier={editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onSuccess={refreshSuppliers}
      />
    </>
  );
};
