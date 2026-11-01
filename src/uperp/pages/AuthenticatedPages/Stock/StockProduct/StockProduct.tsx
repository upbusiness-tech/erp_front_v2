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
  Switch,
  Typography,
  Upload,
} from "antd";

import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { ProductGalleryModal } from "@/application-components/ProductGalleryModal/ProductGalleryModal";
import { PlanIds } from "@/enums/plan.enum";
import { useCompanySettingsStore } from "@/stores/companySettings.store";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";
import { ArrowLeft, Camera, Images, Plus, Trash2, X } from "lucide-react";
import { ProductUnitOfMeasure } from "./types";
import {
  csosnOptions,
  originOptions,
  pisCofinsOptions,
  useStockProductController,
} from "./useStockProduct.controller";
import { priceSuffixMap, stockFormatMap } from "@/uperp/common/util/productForm.util";

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
    previewSrc,
    handleFileSelect,
    handleRemovePhoto,
    isGalleryOpen,
    openGallery,
    closeGallery,
    handleSelectGalleryPhoto,
    selectedPictureUrl,
    handleDeleteProduct,
    loading,
    isLoadingSuppliers,
    suppliers,
    currentPlan,
  } = useStockProductController({ isEdit });

  const { hasSettingActive } = useCompanySettingsStore();

  const unitOfMeasure = Form.useWatch("unitOfMeasure", form);

  const priceSuffix = (unitOfMeasure && priceSuffixMap[unitOfMeasure]) || "Unidade";

  const stockFormat = (unitOfMeasure && stockFormatMap[unitOfMeasure]) || null;

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
              <Form.Item label="Foto">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleFileSelect(file);
                    return false;
                  }}
                >
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
                      background: previewSrc
                        ? `url(${previewSrc}) center/cover no-repeat`
                        : undefined,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {!previewSrc && <Camera size={28} color="#bbb" />}
                    {!previewSrc && (
                      <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
                        Adicionar foto
                      </Text>
                    )}
                    {previewSrc && (
                      <Button
                        type="text"
                        size="small"
                        icon={<X size={14} />}
                        aria-label="Remover foto"
                        title="Remover foto"
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          handleRemovePhoto();
                        }}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          background: "rgba(255, 255, 255, 0.85)",
                        }}
                      />
                    )}
                  </div>
                </Upload>
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="link"
                    size="small"
                    icon={<Images size={14} />}
                    onClick={openGallery}
                  >
                    Ver galeria
                  </Button>
                </div>
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

        {currentPlan?.id === PlanIds.FISCAL && (
          <>
            <Title level={5} style={{ marginTop: 8 }}>
              Classificação Fiscal
            </Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
              Dados fiscais aplicados a todas as variações deste produto.
            </Text>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                background: "#fafafa",
              }}
            >
              <Row gutter={8}>
                <Col xs={12} md={6}>
                  <Form.Item name={["productFiscalClassification", "ncm"]} label="NCM">
                    <Input maxLength={8} placeholder="Ex: 22030000" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={["productFiscalClassification", "cfop"]} label="CFOP">
                    <Input maxLength={4} placeholder="Ex: 5102" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={["productFiscalClassification", "cest"]} label="CEST">
                    <Input maxLength={7} placeholder="Ex: 0300100" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={["productFiscalClassification", "origin"]} label="Origem">
                    <Select
                      allowClear
                      placeholder="Selecione"
                      options={originOptions}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name={["productFiscalClassification", "csosn"]} label="CSOSN">
                    <Select
                      allowClear
                      placeholder="Selecione"
                      options={csosnOptions}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={["productFiscalClassification", "pis"]} label="PIS">
                    <Select
                      allowClear
                      placeholder="Selecione"
                      options={pisCofinsOptions}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item name={["productFiscalClassification", "cofins"]} label="COFINS">
                    <Select
                      allowClear
                      placeholder="Selecione"
                      options={pisCofinsOptions}
                      showSearch
                      optionFilterProp="label"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </>
        )}

        <Title level={5} style={{ marginTop: 8 }}>
          Variações
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          Cada variação tem código, preço e estoque próprios. Nome, categoria, unidade são
          compartilhados.
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
                  <Row gutter={8} align="top">
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
                        label={`Preço venda (${priceSuffix})`}
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
                      <Form.Item
                        name={[field.name, "costPrice"]}
                        label={`Preço custo (${priceSuffix})`}
                        help={
                          "O preço de custo do produto é necessário para cálculos de faturamento líquido."
                        }
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
                      <Form.Item
                        name={[field.name, "stockQuantity"]}
                        label="Estoque"
                        rules={[{ required: true, message: "Estoque" }]}
                      >
                        {stockFormat ? (
                          <InputNumberFormatted
                            min={0}
                            precision={stockFormat.precision}
                            suffix={stockFormat.suffix}
                            placeholder={stockFormat.placeholder}
                            style={{ width: "100%" }}
                          />
                        ) : (
                          <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
                        )}
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={3}>
                      <Form.Item
                        name={[field.name, "isStockControlled"]}
                        label="Controlar estoque"
                        valuePropName="checked"
                        help={
                          "Ao desativar essa opção, as vendas não refletirão no estoque dessa variação do produto."
                        }
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
      <ProductGalleryModal
        open={isGalleryOpen}
        currentPicture={selectedPictureUrl}
        onClose={closeGallery}
        onSelect={handleSelectGalleryPhoto}
        onRequestUpload={closeGallery}
      />
    </Card>
  );
};
