import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Typography,
  Upload,
} from "antd";

import { ArrowLeft, Camera, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProductUnitOfMeasure } from "./types";
import { useStockProductController } from "./useStockProduct.controller";
import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { useCompanySettingsStore } from "@/stores/companySettings.store";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";

const { Text, Title } = Typography;

type StockProductFormProps = {
  isEdit?: boolean;
};

export const StockProductForm = ({ isEdit = false }: StockProductFormProps) => {
  const {
    form,
    categories,
    isLoadingCategories,
    submitProduct,
    handleGoBack,
    setfile,
    handleDeleteProduct,
    loading,
    isLoadingSuppliers,
    suppliers,
  } = useStockProductController({ isEdit });

  const { hasSettingActive } = useCompanySettingsStore();

  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  return (
    <Card
      title={
        <Space>
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={handleGoBack} />
          <Title level={5} style={{ margin: 0 }}>
            {isEdit ? "Editar Produto" : "Cadastrar Produto"}
          </Title>
        </Space>
      }
      extra={
        isEdit && (
          <Popconfirm
            title="Remover produto?"
            description="Esta ação não pode ser desfeita."
            onConfirm={handleDeleteProduct}
          >
            <Button type="text" size="small" danger icon={<Trash2 size={14} />}>
              Excluir
            </Button>
          </Popconfirm>
        )
      }
    >
      <Form layout="vertical" form={form} onFinish={submitProduct}>
        <Row gutter={12}>
          <Col xs={24} md={4}>
            <div style={{ textAlign: "center" }}>
              <Form.Item name="productPicture" label="Foto">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const localUrl = URL.createObjectURL(file);
                    setPreviewUrl(localUrl);
                    setfile(file);
                    return false;
                  }}
                >
                  <Spin spinning={false}>
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        border: "2px dashed #d9d9d9",
                        borderRadius: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        background: previewUrl
                          ? `url(${previewUrl}) center/cover no-repeat`
                          : undefined,
                        overflow: "hidden",
                      }}
                    >
                      {!previewUrl && <Camera size={28} color="#bbb" />}
                      {!previewUrl && (
                        <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                          Adicionar foto
                        </Text>
                      )}
                    </div>
                  </Spin>
                </Upload>
              </Form.Item>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="name" label="Nome do produto" rules={[{ required: true }]}>
              <Input placeholder="Ex: Camiseta Básica" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name="productCategoryId" label="Categoria">
              <Select
                allowClear
                placeholder="Selecione"
                fieldNames={{ value: "id", label: "name" }}
                options={categories?.data}
                loading={isLoadingCategories}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={3}>
            <Form.Item name="unitOfMeasure" label="Medida" rules={[{ required: true }]}>
              <Select
                allowClear
                placeholder="Uni."
                options={Object.values(ProductUnitOfMeasure).map((u) => ({
                  value: u,
                  label: u,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 8 }}>
          Variações
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          Cada variação tem código, preço e estoque próprios. Nome, categoria, unidade e fornecedor
          são compartilhados.
        </Text>

        <Form.List
          name="variants"
          initialValue={[
            {
              code: "",
              salePrice: 0,
              costPrice: 0,
              isStockControlled: true,
              stockQuantity: 0,
              size: "",
              color: "",
              brand: "",
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div
                  key={field.key}
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Row gutter={8} align="middle">
                    <Col xs={12} md={3}>
                      <Form.Item name={[field.name, "code"]} label="Código">
                        <Input placeholder="Código" />
                      </Form.Item>
                    </Col>
                    {hasSettingActive(SettingsRef.Product.ScanProductByCode) && (
                      <Col xs={12} md={3}>
                        <Form.Item name={[field.name, "barcode"]} label="Código de barras">
                          <Input placeholder="Código de barras" />
                        </Form.Item>
                      </Col>
                    )}
                    <Col xs={12} md={3}>
                      <Form.Item name={[field.name, "productSupplierId"]} label="Fornecedor">
                        <Select
                          allowClear
                          placeholder="Selecione"
                          fieldNames={{ value: "id", label: "name" }}
                          options={suppliers?.data}
                          loading={isLoadingSuppliers}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item name={[field.name, "size"]} label="Tamanho">
                        <Input placeholder="Tam." />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item name={[field.name, "color"]} label="Cor">
                        <Input placeholder="Cor" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item name={[field.name, "brand"]} label="Marca">
                        <Input placeholder="Marca" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item
                        name={[field.name, "salePrice"]}
                        label="Preço venda"
                        rules={[{ required: true, message: "Preço" }]}
                      >
                        <InputNumberFormatted
                          min={0}
                          step={0.5}
                          placeholder="0,00"
                          style={{ width: "100%" }}
                          prefix="R$"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item name={[field.name, "costPrice"]} label="Preço custo">
                        <InputNumberFormatted
                          min={0}
                          step={0.5}
                          placeholder="0,00"
                          style={{ width: "100%" }}
                          prefix="R$"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item
                        name={[field.name, "stockQuantity"]}
                        label="Estoque"
                        rules={[{ required: true, message: "Estoque" }]}
                      >
                        <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item
                        name={[field.name, "isStockControlled"]}
                        label="Controlar estoque"
                        valuePropName="checked"
                      >
                        <Switch defaultChecked />
                      </Form.Item>
                    </Col>
                    <Col
                      xs={2}
                      md={2}
                      style={{ display: "flex", alignItems: "flex-end", paddingBottom: 24 }}
                    >
                      <Button
                        danger
                        type="text"
                        icon={<Trash2 size={14} />}
                        disabled={fields.length === 1}
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                block
                type="dashed"
                icon={<Plus size={14} />}
                onClick={() =>
                  add({
                    code: "",
                    salePrice: 0,
                    costPrice: 0,
                    isStockControlled: true,
                    stockQuantity: 0,
                    size: "",
                    color: "",
                    brand: "",
                  })
                }
              >
                Adicionar variação
              </Button>
            </>
          )}
        </Form.List>

        <Space style={{ marginTop: 20 }}>
          <Button onClick={handleGoBack}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "Atualizar produto" : "Cadastrar produto"}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};
