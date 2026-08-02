import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { InternCustomerType } from "@/enums/internCustomer.enum";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeft,
  FileText,
  MapIcon,
  Package,
  Phone,
  Plus,
  Trash,
  Trash2,
  User,
} from "lucide-react";
import { SpecialPriceVariationModal } from "./components/SpecialPriceVariationModal";
import { ILinkedVariation } from "./types";
import { useCustomerFormController } from "./useCustomerForm.controller";

const { Text, Title } = Typography;

type CustomerFormProps = {
  isEdit?: boolean;
};

export const CustomerForm = ({ isEdit = false }: CustomerFormProps) => {
  const {
    handleGoBack,
    form,
    products,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    productTableColumns,
    rowSelection,
    defaultPrice,
    setDefaultPrice,
    selectedProducts,
    isVariationModalOpen,
    variationModalProducts,
    handleOpenVariationModal,
    handleCloseVariationModal,
    handleConfirmVariationSelection,
    linkedVariations,
    handleRemoveLinkedVariation,
    handleUpdateSpecialPrice,
    handleSubmit,
    isSubmiting,
    handleDeleteCustomer,
  } = useCustomerFormController({ isEdit });

  return (
    <Card
      loading={isSubmiting}
      title={
        <Space>
          <Button icon={<ArrowLeft size={14} />} onClick={handleGoBack} type="text" />
          {isEdit ? `Editar Cliente: ${form.getFieldValue("name")}` : "Novo Cliente"}
        </Space>
      }
      extra={
        isEdit && (
          <Popconfirm
            title="Remover cliente?"
            description="Esta ação não pode ser desfeita."
            onConfirm={handleDeleteCustomer}
          >
            <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
              Excluir
            </Button>
          </Popconfirm>
        )
      }
    >
      <Form form={form} layout="vertical">
        <Tabs
          defaultActiveKey="dados"
          items={[
            {
              key: "dados",
              label: "Dados",
              children: (
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label={
                        <Space>
                          <User size={12} />
                          Nome
                        </Space>
                      }
                      rules={[{ required: true, message: "Nome é obrigatório." }]}
                    >
                      <Input placeholder="Nome do cliente" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="address"
                      label={
                        <Space>
                          <MapIcon size={12} />
                          Endereço
                        </Space>
                      }
                    >
                      <Input placeholder="Rua Imperador Junior, Centro - Quixadá" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phoneNumber"
                      label={
                        <Space>
                          <Phone size={12} />
                          Telefone
                        </Space>
                      }
                    >
                      <Input placeholder="(00) 00000-0000" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="type"
                      label={
                        <Space>
                          <FileText size={12} />
                          Tipo
                        </Space>
                      }
                      rules={[{ required: true, message: "Tipo é obrigatório." }]}
                    >
                      <Select
                        options={Object.values(InternCustomerType).map((v) => ({
                          value: v.toString(),
                          label: v.toString(),
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: "prices",
              label: `Preços Especiais (${linkedVariations.length || 0})`,
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
                      flexWrap: "wrap",
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>Preço especial (R$)</Text>
                    <InputNumberFormatted
                      min={0}
                      step={1}
                      value={defaultPrice}
                      onChange={(v) => setDefaultPrice(v || 0)}
                      style={{ width: 140 }}
                    />
                    <Button
                      type="primary"
                      icon={<Plus size={14} />}
                      onClick={handleOpenVariationModal}
                      disabled={selectedProducts.length === 0}
                    >
                      Vincular {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ""}
                    </Button>
                  </div>

                  <GenericTable
                    key={"id"}
                    columns={productTableColumns}
                    data={products}
                    total={total}
                    isLoading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    rowSelection={{ type: "checkbox", hideSelectAll: true, ...rowSelection }}
                  />

                  <div style={{ marginTop: 16 }}>
                    <Title level={5} style={{ margin: "0 0 8px" }}>
                      <Package size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
                      Produtos vinculados ({linkedVariations.length || 0})
                    </Title>
                    {linkedVariations.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Nenhum preço especial"
                        style={{ margin: "12px 0" }}
                      />
                    ) : (
                      <Table
                        rowKey="productEspecificationId"
                        size="small"
                        dataSource={linkedVariations}
                        pagination={false}
                        scroll={{ x: 520 }}
                        columns={[
                          {
                            title: "Produto",
                            dataIndex: "productName",
                            render: (name: string) => <Text strong>{name}</Text>,
                          },
                          {
                            title: "Variação",
                            dataIndex: "variation",
                            render: (v: ILinkedVariation["variation"]) => (
                              <Space size={4}>
                                {v.code && (
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {v.code}
                                  </Text>
                                )}
                                {v.size && (
                                  <Tag style={{ margin: 0 }} color="orange">
                                    {v.size}
                                  </Tag>
                                )}
                                {v.color && <Tag style={{ margin: 0 }}>{v.color}</Tag>}
                                {v.brand && <Tag style={{ margin: 0 }}>{v.brand}</Tag>}
                              </Space>
                            ),
                          },
                          {
                            title: "Preço original",
                            dataIndex: "variation",
                            width: 130,
                            render: (v: ILinkedVariation["variation"]) =>
                              `R$ ${Number(v.salePrice).toFixed(2)}`,
                          },
                          {
                            title: "Preço especial",
                            dataIndex: "specialPrice",
                            width: 160,
                            render: (price: number, r) => (
                              <InputNumberFormatted
                                min={0}
                                step={1}
                                value={price}
                                onChange={(val) =>
                                  handleUpdateSpecialPrice(r.productEspecificationId, val || 0)
                                }
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
                                onClick={() =>
                                  handleRemoveLinkedVariation(r.productEspecificationId)
                                }
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
          ]}
        />
      </Form>
      <Space style={{ marginTop: 20 }}>
        <Button onClick={handleGoBack}>Cancelar</Button>
        <Button type="primary" onClick={handleSubmit} loading={isSubmiting}>
          {isEdit ? "Atualizar cliente" : "Cadastrar cliente"}
        </Button>
      </Space>
      <SpecialPriceVariationModal
        isOpen={isVariationModalOpen}
        products={variationModalProducts}
        defaultPrice={defaultPrice}
        onClose={handleCloseVariationModal}
        onConfirm={handleConfirmVariationSelection}
      />
    </Card>
  );
};
