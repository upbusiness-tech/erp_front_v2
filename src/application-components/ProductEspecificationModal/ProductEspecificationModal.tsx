import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { VariationTags } from "@/application-components/VariationTags/VariationTags";
import { InternCustomerModel } from "@/model/internCustomer.model";
import { ProductModel } from "@/model/product.model";
import {
  calculeSalePriceRange,
  extractStockFormatByProduct,
  formatPrice,
  showStockTotalByProductEspecification,
} from "@/uperp/common/formulas/productFormulas";
import { SettingsRef } from "@/uperp/common/settings/consts/settings.ref";
import { useCompanySettingsStore } from "@/stores/companySettings.store";
import { ProductUnitOfMeasure } from "@/uperp/pages/AuthenticatedPages/Stock/StockProduct/types";
import {
  Alert,
  Col,
  Empty,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { Star } from "lucide-react";
import {
  BRAND,
  BRAND_DARK,
  BRAND_GRADIENT_END,
  BRAND_SOFT,
  BRAND_SOFT_ALT,
  BRAND_TEXT_STRONG,
  WARNING,
} from "@/theme/colors";
import { useProductEspecificationModalController } from "./useProductEspecificationModal.controller";
import { productUnitFormat } from "@/uperp/common/util/productForm.util";
import { isVariationSellable } from "@/uperp/common/util/productVariation";

const { Text } = Typography;

type ProductEspecificationModalProps = {
  openProductEspecificationModal: boolean;
  product: ProductModel | undefined;
  onClose: () => void;
  selectedCustomer?: InternCustomerModel;
};

export const ProductEspecificationModal = ({
  openProductEspecificationModal,
  product,
  onClose,
  selectedCustomer,
}: ProductEspecificationModalProps) => {
  const {
    handleAddToComanda,
    selectedSpecification,
    selectedSpecificationId,
    selectSpecification,
    visibleSpecifications,
    searchTerm,
    setSearchTerm,
    showSearch,
    stock,
    specialPriceForSpec,
    qty,
    setQty,
    unitSold,
    setUnitSold,
    isNotStandardUnitOfMeasurement,
    note,
    setNote,
    canAddToComanda,
    hasSpecifications,
    hasAvailableSpecification,
  } = useProductEspecificationModalController({
    openProductEspecificationModal,
    product,
    onClose,
    selectedCustomer,
  });

  const { hasSettingActive } = useCompanySettingsStore();

  if (!product) return null;

  const selectedSpecStockQty = selectedSpecification?.stockQuantity;
  const currentStock = selectedSpecStockQty ?? stock;

  const stockTagColor =
    (currentStock ?? 0) > 5
      ? "green-inverse"
      : (currentStock ?? 0) > 0
        ? "orange-inverse"
        : "red-inverse";

  const stockLabel =
    selectedSpecStockQty !== undefined
      ? extractStockFormatByProduct(product, selectedSpecStockQty)
      : showStockTotalByProductEspecification(product, product.productEspecifications);

  const priceLabel = selectedSpecification
    ? formatPrice(selectedSpecification.salePrice || 0)
    : calculeSalePriceRange(product.productEspecifications || []);

  const stockMax =
    selectedSpecification?.isStockControlled === true
      ? selectedSpecification.stockQuantity
      : undefined;

  const showNoVariationsAlert = !hasSpecifications;
  const showNoAvailableAlert = hasSpecifications && !hasAvailableSpecification;
  const showEmptySearch =
    searchTerm && visibleSpecifications.length === 0 && !selectedSpecification;

  return (
    <Modal
      open={openProductEspecificationModal}
      title={`Adicionar: ${product.name}`}
      onCancel={onClose}
      onOk={handleAddToComanda}
      okText="Adicionar à comanda"
      cancelText="Cancelar"
      okButtonProps={{ disabled: !canAddToComanda }}
      destroyOnHidden
    >
      {/* HEADER */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col>
          {product.productPicture ? (
            <Image
              style={{
                height: 64,
                width: 64,
                borderRadius: 8,
                objectFit: "cover",
              }}
              src={product.productPicture}
              preview={false}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${BRAND_SOFT_ALT}, ${BRAND_GRADIENT_END})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: BRAND,
                fontSize: 24,
              }}
            >
              {product.name.charAt(0)}
            </div>
          )}
        </Col>
        <Col flex="auto" style={{ minWidth: 0 }}>
          <Text strong style={{ display: "block", fontSize: 14 }}>
            {product.name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {product.id} · {product.productCategory?.name}
          </Text>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Text strong style={{ color: BRAND, fontSize: 18 }}>
              {priceLabel}
            </Text>
            <Tag color={stockTagColor} style={{ margin: 0, fontWeight: "bold" }}>
              {stockLabel} em estoque
            </Tag>
          </div>
          {specialPriceForSpec && (
            <Space size={4} style={{ marginTop: 4 }}>
              <Star size={12} style={{ color: WARNING }} fill={WARNING} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Preço especial:{" "}
                <Text strong style={{ color: BRAND }}>
                  {formatPrice(specialPriceForSpec.specialPrice)}
                </Text>
              </Text>
            </Space>
          )}
        </Col>
      </Row>

      {/* SEARCH */}
      {showSearch && !showNoVariationsAlert && (
        <div style={{ marginBottom: 12 }}>
          <Input
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, tamanho, cor ou marca"
          />
        </div>
      )}

      {/* VARIATION LIST */}
      {showNoVariationsAlert ? (
        <Alert
          type="warning"
          showIcon
          message="Produto sem variações cadastradas"
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          {showNoAvailableAlert && (
            <Alert
              type="error"
              showIcon
              message="Nenhuma variação disponível em estoque"
              style={{ marginBottom: 16 }}
            />
          )}
          {showEmptySearch ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhuma variação encontrada"
              style={{ margin: "16px 0" }}
            />
          ) : (
            <div style={{ marginBottom: 16 }}>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                Variação
              </Text>
              <div
                style={{
                  maxHeight: "min(40vh, 320px)",
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  paddingRight: 8,
                  marginRight: -8,
                  boxShadow:
                    "inset 0 6px 6px -6px rgba(0,0,0,0.08), inset 0 -6px 6px -6px rgba(0,0,0,0.08)",
                }}
              >
                <Radio.Group
                  value={selectedSpecificationId}
                  onChange={(e) => selectSpecification(e.target.value)}
                  style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {visibleSpecifications.map((spec) => {
                    const sellable = isVariationSellable(spec);
                    const isDisabled = spec.isStockControlled && !sellable;
                    const isSelected = spec.id === selectedSpecificationId;

                    return (
                      <Radio
                        key={spec.id}
                        value={spec.id}
                        disabled={isDisabled}
                        style={{ margin: 0, width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 8,
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: `1px solid ${isSelected ? BRAND : "#e5e7eb"}`,
                            background: isSelected ? BRAND_SOFT : "#fff",
                            transition: "all 0.15s ease",
                            width: "100%",
                            opacity: isDisabled ? 0.6 : 1,
                          }}
                        >
                          <Text
                            code
                            style={{
                              fontSize: 13,
                              fontWeight: "bold",
                              color: "#6b7280",
                              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                              margin: 0,
                            }}
                          >
                            {spec.code || `#${spec.id}`}
                          </Text>
                          <div style={{ flex: 1, minWidth: 120 }}>
                            <VariationTags specification={spec} size="default" fallback={false} />
                          </div>
                          <Text
                            strong
                            style={{
                              color: BRAND_DARK,
                              fontSize: 13,
                              fontWeight: "bold",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatPrice(spec.salePrice || 0)}
                          </Text>
                          <Tag
                            color={
                              (spec.stockQuantity ?? 0) > 5
                                ? "green-inverse"
                                : (spec.stockQuantity ?? 0) > 0
                                  ? "orange-inverse"
                                  : "red-inverse"
                            }
                            style={{ margin: 0, fontSize: 13, fontWeight: "bold" }}
                          >
                            {extractStockFormatByProduct(product, spec.stockQuantity)}
                            {isDisabled && " · Sem estoque"}
                          </Tag>
                        </div>
                      </Radio>
                    );
                  })}
                </Radio.Group>
              </div>
            </div>
          )}
        </>
      )}

      {/* QUANTITY */}
      {!showNoVariationsAlert && (
        <>
          {isNotStandardUnitOfMeasurement ? (
            <div style={{ marginBottom: 16 }}>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                Peso/medida do produto
              </Text>
              <InputNumberFormatted
                min={0}
                max={stockMax}
                precision={
                  productUnitFormat(product.unitOfMeasure as ProductUnitOfMeasure)?.precision
                }
                placeholder={
                  productUnitFormat(product.unitOfMeasure as ProductUnitOfMeasure)?.placeholder
                }
                value={unitSold}
                onChange={(v) => setUnitSold(v)}
                style={{ flex: 1 }}
                suffix={productUnitFormat(product.unitOfMeasure as ProductUnitOfMeasure)?.suffix}
              />
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <Text
                strong
                style={{
                  display: "block",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                Quantidade
              </Text>
              <InputNumber
                min={1}
                max={stockMax}
                value={qty}
                onChange={(v) => setQty(v || 1)}
                style={{ width: "100%" }}
              />
            </div>
          )}
        </>
      )}

      {/* NOTE */}
      {!showNoVariationsAlert && hasSettingActive(SettingsRef.Product.NoteOnProduct) && (
        <div>
          <Text
            strong
            style={{
              display: "block",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Observação
          </Text>
          <Input.TextArea
            rows={2}
            value={note ?? ""}
            placeholder="Ex: Embalagem para presente"
            maxLength={140}
            showCount
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      )}
    </Modal>
  );
};
