import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { ProductModel } from "@/model/product.model";
import { ProductEspecificationModel } from "@/model/productEspecification.model";
import { Checkbox, Modal, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";

const { Text } = Typography;

export interface IVariationSelection {
  product: ProductModel;
  productEspecification: ProductEspecificationModel;
  specialPrice: number;
}

type SpecialPriceVariationModalProps = {
  isOpen: boolean;
  products: ProductModel[];
  defaultPrice: number;
  onClose: VoidFunction;
  onConfirm: (selections: IVariationSelection[]) => void;
};

export const SpecialPriceVariationModal = ({
  isOpen,
  products,
  defaultPrice,
  onClose,
  onConfirm,
}: SpecialPriceVariationModalProps) => {
  const [selected, setSelected] = useState<Record<number, number>>({});

  useEffect(() => {
    if (isOpen) setSelected({});
  }, [isOpen]);

  const toggleVariation = (id: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        delete next[id];
      } else {
        next[id] = defaultPrice;
      }
      return next;
    });
  };

  const setPrice = (id: number, price: number) => {
    setSelected((prev) => ({ ...prev, [id]: price }));
  };

  const toggleAllForProduct = (product: ProductModel, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      product.productEspecifications.forEach((pe) => {
        if (checked) {
          if (next[pe.id] === undefined) next[pe.id] = defaultPrice;
        } else {
          delete next[pe.id];
        }
      });
      return next;
    });
  };

  const handleConfirm = () => {
    const selections: IVariationSelection[] = [];
    products.forEach((product) => {
      product.productEspecifications.forEach((pe) => {
        if (selected[pe.id] !== undefined) {
          selections.push({
            product,
            productEspecification: pe,
            specialPrice: selected[pe.id],
          });
        }
      });
    });
    onConfirm(selections);
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <Modal
      open={isOpen}
      title="Selecionar variações"
      onCancel={onClose}
      onOk={handleConfirm}
      okText={`Vincular${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
      cancelText="Cancelar"
      okButtonProps={{ disabled: selectedCount === 0 }}
      width={680}
    >
      {products.map((product) => {
        const allChecked =
          product.productEspecifications.length > 0 &&
          product.productEspecifications.every((pe) => selected[pe.id] !== undefined);
        const someChecked = product.productEspecifications.some(
          (pe) => selected[pe.id] !== undefined,
        );

        return (
          <div
            key={product.id}
            style={{
              marginBottom: 16,
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text strong>{product.name}</Text>
              <Checkbox
                checked={allChecked}
                indeterminate={someChecked && !allChecked}
                onChange={(e) => toggleAllForProduct(product, e.target.checked)}
              >
                Todas as variações
              </Checkbox>
            </div>

            {product.productEspecifications.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Produto sem variações.
              </Text>
            ) : (
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                {product.productEspecifications.map((pe) => {
                  const isChecked = selected[pe.id] !== undefined;
                  return (
                    <div
                      key={pe.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                      }}
                    >
                      <Checkbox checked={isChecked} onChange={() => toggleVariation(pe.id)}>
                        <Space size={4}>
                          {pe.code && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {pe.code}
                            </Text>
                          )}
                          {pe.size && (
                            <Tag style={{ margin: 0 }} color="orange">
                              {pe.size}
                            </Tag>
                          )}
                          {pe.color && <Tag style={{ margin: 0 }}>{pe.color}</Tag>}
                          {pe.brand && <Tag style={{ margin: 0 }}>{pe.brand}</Tag>}
                        </Space>
                      </Checkbox>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        R$ {Number(pe.salePrice).toFixed(2)}
                      </Text>
                      <InputNumberFormatted
                        min={0}
                        step={1}
                        disabled={!isChecked}
                        value={isChecked ? selected[pe.id] : defaultPrice}
                        onChange={(v) => setPrice(pe.id, v || 0)}
                        style={{ width: 130, marginLeft: "auto" }}
                        prefix="R$"
                      />
                    </div>
                  );
                })}
              </Space>
            )}
          </div>
        );
      })}
    </Modal>
  );
};
