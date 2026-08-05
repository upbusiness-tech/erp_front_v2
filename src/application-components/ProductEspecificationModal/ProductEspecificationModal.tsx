import { InternCustomerModel } from "@/model/internCustomer.model";
import { ProductModel } from "@/model/product.model";
import { ProductEspecificationModel } from "@/model/productEspecification.model";
import { useSalesStore } from "@/stores/sales.store";
import {
  calculeSalePriceRange,
  calculeStockTotalByProductEspecification,
  formatPrice,
} from "@/uperp/common/productFormulas";
import { CartSaleItem, ICreateSaleForm } from "@/uperp/pages/AuthenticatedPages/CommonSale/types";
import {
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  const stock = calculeStockTotalByProductEspecification(product?.productEspecifications || []);

  const sizes = Array.from(
    new Set(product?.productEspecifications?.filter((pe) => pe.size).map((pe) => pe.size) ?? []),
  );

  const colorOptions =
    product?.productEspecifications?.filter((pe) =>
      sizes.length > 0 ? pe.size === selectedSize : !!pe.color,
    ) ?? [];

  const colors = Array.from(
    new Set(colorOptions.map((pe) => pe.color).filter(Boolean)),
  ) as string[];

  const findSpecification = (): ProductEspecificationModel | undefined => {
    return product?.productEspecifications.find(
      (pe) =>
        (sizes.length === 0 || pe.size === selectedSize) &&
        (colors.length === 0 || pe.color === selectedColor),
    );
  };

  const specialPriceForSpec = useMemo(() => {
    const spec = product?.productEspecifications.find(
      (pe) =>
        (sizes.length === 0 || pe.size === selectedSize) &&
        (colors.length === 0 || pe.color === selectedColor),
    );
    if (!spec || !selectedCustomer?.internCustomerPrices) return null;
    return selectedCustomer.internCustomerPrices.find(
      (sp) => sp.productEspecificationId === spec.id,
    );
  }, [selectedSize, selectedColor, selectedCustomer, product, sizes, colors]);

  const { saleItems, setSaleItems } = useSalesStore();

  const handleAddToComanda = () => {
    if (!product) return;
    if (sizes.length > 0 && !selectedSize) return message.error("Selecione o tamanho");
    if (colors.length > 0 && !selectedColor) return message.error("Selecione a cor");

    const specification = findSpecification();
    if (specification) {
      const specificationSelected: CartSaleItem = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        isEspecialPrice: false,
        note,
        productEspecificationId: specification?.id,
        productId: product.id,
        quantitySold: qty,
        product,
        productEspecification: specification,
      };
      setSaleItems([...saleItems, specificationSelected]);
    }
    onClose();
  };

  useEffect(() => {
    if (openProductEspecificationModal) {
      setQty(1);
      setSelectedSize(undefined);
      setSelectedColor(undefined);
    }
  }, [openProductEspecificationModal, product?.id]);

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
                <Tag style={{ marginLeft: 8 }} color={stock > 5 ? "green" : "orange"}>
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
            <Form.Item label="Quantidade" required>
              <InputNumber
                min={1}
                max={stock}
                value={qty}
                onChange={(v) => setQty(v || 1)}
                style={{ width: "100%" }}
              />
            </Form.Item>

            {sizes.length > 0 ? (
              <Form.Item label="Tamanho" required>
                <Radio.Group
                  buttonStyle="solid"
                  value={selectedSize}
                  onChange={(e) => {
                    setSelectedSize(e.target.value);
                    setSelectedColor(undefined);
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
                  onChange={setSelectedColor}
                  options={colors.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>
            ) : null}
            <Input.TextArea
              rows={2}
              placeholder="Ex: Embalagem para presente"
              maxLength={140}
              showCount
              onChange={(e) => setNote(e.target.value)}
            />
          </Form>
        </>
      )}
    </Modal>
  );
};
