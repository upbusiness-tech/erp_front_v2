import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { InternCustomerModel } from "@/model/internCustomer.model";
import { ProductModel } from "@/model/product.model";
import { useCompanySettingsStore } from "@/stores/companySettings.store";
import { calculeSalePriceRange, formatPrice } from "@/uperp/common/formulas/productFormulas";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";
import { productUnitFormat } from "@/uperp/common/util/productForm";
import { ICreateSaleForm } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";
import {
  Col,
  Form,
  FormInstance,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { Star } from "lucide-react";
import { useProductEspecificationModalController } from "./useProductEspecificationModal.controller";

const { Text } = Typography;

type ProductEspecificationModalProps = {
  openProductEspecificationModal: boolean;
  product: ProductModel | undefined;
  onClose: () => void;
  form: FormInstance<ICreateSaleForm>;
  selectedCustomer?: InternCustomerModel;
};

export const ProductEspecificationModal = ({
  openProductEspecificationModal,
  product,
  onClose,
  form,
  selectedCustomer,
}: ProductEspecificationModalProps) => {
  const {
    handleAddToComanda,
    findSpecification,
    stock,
    specialPriceForSpec,
    qty,
    setQty,
    unitSold,
    setUnitSold,
    isNotStandardUnitOfMeasurement,
    sizes,
    selectedSize,
    selectedColor,
    setSelectedSize,
    setSelectedColor,
    colors,
    brands,
    selectedBrand,
    setSelectedBrand,
    setNote,
    note,
  } = useProductEspecificationModalController({
    openProductEspecificationModal,
    product,
    onClose,
    selectedCustomer,
  });

  const { hasSettingActive } = useCompanySettingsStore();

  return (
    <Modal
      open={openProductEspecificationModal}
      title={product ? `Adicionar: ${product.name}` : ""}
      onCancel={onClose}
      onOk={handleAddToComanda}
      okText="Adicionar à comanda"
      cancelText="Cancelar"
      destroyOnHidden
    >
      {product && (
        <>
          <Row gutter={12} style={{ marginBottom: 16 }}>
            <Col>
              {product.productPicture ? (
                <Image
                  style={{
                    height: 64,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  src={product.productPicture}
                />
              ) : (
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #fff3e8, #ffe0c2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "#F26B1F",
                    fontSize: 24,
                  }}
                >
                  {product?.name.charAt(0)}
                </div>
              )}
            </Col>
            <Col flex="auto">
              <Text strong style={{ display: "block" }}>
                {product?.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {product?.id} · {product?.productCategory?.name}
              </Text>
              <div style={{ marginTop: 4 }}>
                <Text strong style={{ color: "#F26B1F", fontSize: 18 }}>
                  {findSpecification()
                    ? `${formatPrice(findSpecification()?.salePrice || 0)}`
                    : calculeSalePriceRange(product?.productEspecifications || [])}
                </Text>
                <Tag style={{ marginLeft: 8 }} color={(stock ?? 0 > 5) ? "green" : "orange"}>
                  {stock} em estoque
                </Tag>
              </div>
              {specialPriceForSpec && (
                <Space size={4} style={{ marginTop: 4 }}>
                  <Star size={12} style={{ color: "#F59E0B" }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Preço especial:{" "}
                    <Text strong style={{ color: "#F26B1F" }}>
                      {formatPrice(specialPriceForSpec.specialPrice)}
                    </Text>
                  </Text>
                </Space>
              )}
            </Col>
          </Row>

          <Form layout="vertical" style={{ paddingBottom: 15 }}>
            {isNotStandardUnitOfMeasurement ? (
              <Form.Item label="Peso/medida do produto" required>
                <InputNumberFormatted
                  min={0}
                  precision={
                    productUnitFormat(product.unitOfMeasure as ProductUnitOfMeasure)?.precision
                  }
                  suffix={productUnitFormat(product.unitOfMeasure as ProductUnitOfMeasure)?.suffix}
                  placeholder={
                    productUnitFormat(product.unitOfMeasure as ProductUnitOfMeasure)?.placeholder
                  }
                  value={unitSold}
                  onChange={(v) => setUnitSold(v)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            ) : (
              <Form.Item label="Quantidade" required>
                <InputNumber
                  min={1}
                  max={stock}
                  value={qty}
                  onChange={(v) => setQty(v || 1)}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            )}

            {sizes.length > 0 ? (
              <Form.Item label="Tamanho" required>
                <Radio.Group
                  buttonStyle="solid"
                  value={selectedSize}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setSelectedColor(undefined);
                    setSelectedBrand(undefined);
                  }}
                >
                  {sizes.map((s) => (
                    <Radio.Button key={s} value={s}>
                      {s}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            ) : null}

            {colors.length > 0 ? (
              <Form.Item label="Cor" required>
                <Select
                  placeholder="Selecione a cor"
                  value={selectedColor}
                  onChange={(c) => {
                    setSelectedColor(c);
                    setSelectedBrand(undefined);
                  }}
                  options={colors.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>
            ) : null}

            {brands.length > 0 ? (
              <Form.Item label="Marca" required>
                <Select
                  placeholder="Selecione a marca"
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  options={brands.map((b) => ({ value: b, label: b }))}
                />
              </Form.Item>
            ) : null}
            {hasSettingActive(SettingsRef.Product.NoteOnProduct) && (
              <Input.TextArea
                rows={2}
                value={note ?? ""}
                placeholder="Ex: Embalagem para presente"
                maxLength={140}
                showCount
                onChange={(e) => setNote(e.target.value)}
              />
            )}
          </Form>
        </>
      )}
    </Modal>
  );
};
