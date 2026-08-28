import { ProductSupplierModel } from "@/model/productSupplier.model";
import { Form, Input, Modal, Space } from "antd";
import { useEditSupplierModal } from "./useEditSupplierModal.controller";

type EditCategoryModalProps = {
  editingSupplier: ProductSupplierModel | null;
  onClose: () => void;
  onSuccess: () => void;
};

export const EditSupplierModal = ({
  editingSupplier,
  onClose,
  onSuccess,
}: EditCategoryModalProps) => {
  const { form, loading, handleSave } = useEditSupplierModal({
    editingSupplier,
    onClose,
    onSuccess,
  });

  return (
    <Modal
      open={editingSupplier !== null}
      title={editingSupplier ? <Space>Fornecedor: {editingSupplier.name}</Space> : ""}
      onCancel={onClose}
      onOk={handleSave}
      okText="Salvar"
      confirmLoading={loading}
      cancelText="Fechar"
      width={720}
      destroyOnHidden
    >
      {editingSupplier && (
        <>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Space.Compact style={{ width: "100%" }}>
              <Form.Item
                name="name"
                noStyle
                rules={[{ required: true, message: "Nome é obrigatório" }]}
              >
                <Input placeholder="Nome da categoria" />
              </Form.Item>
            </Space.Compact>
          </Form>

          {/* <Text strong style={{ display: "block", margin: "16px 0 8px" }}>
            Produtos vinculados
          </Text>
          {(() => {
            const linked: unknown[] = [];
            if (linked.length === 0) {
              return (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Nenhum produto nesta categoria"
                />
              );
            }
            return (
              <Table
                rowKey="id"
                size="small"
                dataSource={linked}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 500 }}
                columns={[
                  { title: "SKU", dataIndex: "sku", width: 110 },
                  { title: "Produto", dataIndex: "name" },
                  {
                    title: "Preço",
                    dataIndex: "price",
                    width: 100,
                    render: (v: number) => `R$ ${v.toFixed(2)}`,
                  },
                  {
                    title: "Estoque",
                    dataIndex: "stock",
                    width: 90,
                    render: (v: number) => (
                      <Tag color={v > 5 ? "green" : v > 0 ? "orange" : "red"}>{v}</Tag>
                    ),
                  },
                ]}
              />
            );
          })()} */}
        </>
      )}
    </Modal>
  );
};
