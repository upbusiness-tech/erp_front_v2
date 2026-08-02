import { InternCustomerModel } from "@/model/internCustomer.model";
import { InternCustomerSpecialPriceModel } from "@/model/internCustomerPrice.model";
import { Button, Descriptions, Empty, Modal, Space, Table, Tabs, Tag, Typography } from "antd";
import { Pencil } from "lucide-react";
const { Text } = Typography;

type CustomerViewModalProps = {
  isOpen: boolean;
  customer: InternCustomerModel | undefined;
  onClose: () => void;
  onEdit: (id: number) => void;
};

export const CustomerViewModal = ({
  isOpen,
  customer,
  onClose,
  onEdit,
}: CustomerViewModalProps) => {
  return (
    <Modal
      open={isOpen}
      title={customer ? `Cliente: ${customer.name}` : ""}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Fechar</Button>
          <Button
            type="primary"
            icon={<Pencil size={14} />}
            onClick={() => onEdit(customer?.id || 0)}
          >
            Editar
          </Button>
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
                  <Descriptions.Item label="Telefone">
                    {customer.phoneNumber || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tipo">{customer.type || "—"}</Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: "prices",
              label: `Preços Especiais (${customer.internCustomerPrices?.length || 0})`,
              children: !customer.internCustomerPrices?.length ? (
                <Empty
                  description="Nenhum preço especial cadastrado"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Table
                  rowKey="productId"
                  size="small"
                  dataSource={customer.internCustomerPrices}
                  pagination={false}
                  columns={[
                    {
                      title: "Produto",
                      render: (_, v: InternCustomerSpecialPriceModel) =>
                        v.productEspecification.product.name,
                    },
                    {
                      title: "Variação",
                      dataIndex: "variation",
                      render: (_, v: InternCustomerSpecialPriceModel) => (
                        <Space size={4}>
                          {v.productEspecification.code && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {v.productEspecification.code}
                            </Text>
                          )}
                          {v.productEspecification.size && (
                            <Tag style={{ margin: 0 }} color="orange">
                              {v.productEspecification.size}
                            </Tag>
                          )}
                          {v.productEspecification.color && (
                            <Tag color="green" style={{ margin: 0 }}>
                              {v.productEspecification.color}
                            </Tag>
                          )}
                          {v.productEspecification.brand && (
                            <Tag color="purple" style={{ margin: 0 }}>
                              {v.productEspecification.brand}
                            </Tag>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: "Preço original",
                      width: 130,
                      render: (_, v: InternCustomerSpecialPriceModel) => (
                        <Text delete type="secondary">
                          R$ {Number(v.productEspecification.salePrice).toFixed(2)}
                        </Text>
                      ),
                    },
                    {
                      title: "Preço especial",
                      width: 130,
                      render: (_, v: InternCustomerSpecialPriceModel) => (
                        <Text strong style={{ color: "#F26B1F" }}>
                          R$ {Number(v.specialPrice).toFixed(2)}
                        </Text>
                      ),
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
};
