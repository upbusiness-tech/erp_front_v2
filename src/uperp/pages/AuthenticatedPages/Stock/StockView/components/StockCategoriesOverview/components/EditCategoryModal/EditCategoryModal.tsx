import { ProductCategoryModel } from "@/model/productCategory.model";
import { ColorPicker, Form, Input, Modal, Space, Typography } from "antd";
import { useEditCategoryModal } from "./useEditCategoryModal.controller";

type EditCategoryModalProps = {
  editingCat: ProductCategoryModel | null;
  onClose: () => void;
  onSuccess: () => void;
};

export const EditCategoryModal = ({ editingCat, onClose, onSuccess }: EditCategoryModalProps) => {
  const { form, color, setColor, loading, handleSave } = useEditCategoryModal({
    editingCat,
    onClose,
    onSuccess,
  });

  return (
    <Modal
      open={editingCat !== null}
      title={
        editingCat ? (
          <Space>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: color,
              }}
            />
            Categoria: {editingCat.name}
          </Space>
        ) : (
          ""
        )
      }
      onCancel={onClose}
      onOk={handleSave}
      okText="Salvar"
      confirmLoading={loading}
      cancelText="Fechar"
      width={720}
      destroyOnHidden
    >
      {editingCat && (
        <>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Space.Compact style={{ width: "100%" }}>
              <ColorPicker
                value={color}
                onChange={(c) => setColor(c.toHexString())}
                style={{ width: 40, padding: 2 }}
              />
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
