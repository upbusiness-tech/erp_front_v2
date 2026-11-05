import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import type { ProductSupplierModel } from "@/model/productSupplier.model";
import { stockFormatMap } from "@/uperp/common/util/productForm.util";
import { ProductUnitOfMeasure } from "../types";
import type { VariantDraft } from "./types";
import { areVariantsEqual } from "./variantDiff";
import { validateVariant } from "./variantValidation";

const { Text } = Typography;

type VariantDrawerProps = {
  open: boolean;
  variant: VariantDraft | null;
  variants: VariantDraft[];
  suppliers?: { data: ProductSupplierModel[] };
  unitOfMeasure: string;
  onClose: () => void;
  onNavigate: (key: string) => void;
  onSave: (key: string, variant: VariantDraft) => void;
};

export function VariantDrawer({
  open,
  variant,
  variants,
  suppliers,
  unitOfMeasure,
  onClose,
  onNavigate,
  onSave,
}: VariantDrawerProps) {
  const [local, setLocal] = useState<VariantDraft | null>(variant);

  useEffect(() => {
    setLocal(variant);
  }, [variant]);

  const errors = useMemo(() => (local ? validateVariant(local) : {}), [local]);
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty = !!local && !!variant && !areVariantsEqual(variant, local);

  const stockFormat = stockFormatMap[unitOfMeasure as ProductUnitOfMeasure] ?? null;

  const update = (patch: Partial<VariantDraft>) => {
    setLocal((previous) => (previous ? { ...previous, ...patch } : previous));
  };

  const handleClose = () => {
    if (isDirty) {
      Modal.confirm({
        title: "Descartar alterações?",
        content: "As alterações desta variação serão perdidas.",
        okText: "Descartar",
        cancelText: "Continuar editando",
        okButtonProps: { danger: true },
        onOk: onClose,
      });
      return;
    }

    onClose();
  };

  const handleSave = () => {
    if (!local || hasErrors) return;
    onSave(local.key, local);
    onClose();
  };

  const index = local ? variants.findIndex((item) => item.key === local.key) : -1;
  const previous = index > 0 ? variants[index - 1] : null;
  const next = index >= 0 && index < variants.length - 1 ? variants[index + 1] : null;

  const navigateTo = (target: VariantDraft) => {
    if (isDirty) {
      Modal.confirm({
        title: "Descartar alterações?",
        content: "As alterações desta variação serão perdidas.",
        okText: "Descartar",
        cancelText: "Continuar editando",
        okButtonProps: { danger: true },
        onOk: () => onNavigate(target.key),
      });
      return;
    }

    onNavigate(target.key);
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      width={440}
      destroyOnHidden
      title={
        local ? `Editar variação ${local.code || `#${local.id ?? "nova"}`}` : "Editar variação"
      }
      extra={
        <Space size={4}>
          <Button
            size="small"
            icon={<ChevronLeft size={14} />}
            disabled={!previous}
            onClick={() => previous && navigateTo(previous)}
          />
          <Button
            size="small"
            icon={<ChevronRight size={14} />}
            disabled={!next}
            onClick={() => next && navigateTo(next)}
          />
        </Space>
      }
      footer={
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={handleClose}>Descartar</Button>
          <Button type="primary" onClick={handleSave} disabled={hasErrors}>
            Salvar variação
          </Button>
        </Space>
      }
    >
      {local && (
        <Form layout="vertical">
          <Form.Item label="Código">
            <Input value={local.code} onChange={(event) => update({ code: event.target.value })} />
          </Form.Item>

          <Form.Item label="Código de barras">
            <Input
              value={local.barcode ?? ""}
              onChange={(event) => update({ barcode: event.target.value || null })}
            />
          </Form.Item>

          <Form.Item label="Fornecedor">
            <Select
              allowClear
              placeholder="Selecione"
              fieldNames={{ value: "id", label: "name" }}
              options={suppliers?.data}
              value={local.productSupplierId ?? undefined}
              onChange={(value) => update({ productSupplierId: value ?? null })}
            />
          </Form.Item>

          <Form.Item label="Tamanho/Especificação">
            <Input
              value={local.size ?? ""}
              onChange={(event) => update({ size: event.target.value || null })}
            />
          </Form.Item>

          <Form.Item label="Cor">
            <Input
              value={local.color ?? ""}
              onChange={(event) => update({ color: event.target.value || null })}
            />
          </Form.Item>

          <Form.Item label="Marca">
            <Input
              value={local.brand ?? ""}
              onChange={(event) => update({ brand: event.target.value || null })}
            />
          </Form.Item>

          <Form.Item label="Preço de venda" validateStatus={errors.salePrice ? "error" : undefined}>
            <InputNumberFormatted
              prefix="R$"
              value={local.salePrice}
              onChange={(value) => update({ salePrice: value })}
            />
            {errors.salePrice && (
              <Text type="danger" style={{ fontSize: 12 }}>
                {errors.salePrice}
              </Text>
            )}
          </Form.Item>

          <Form.Item label="Preço de custo">
            <InputNumberFormatted
              prefix="R$"
              value={local.costPrice}
              onChange={(value) => update({ costPrice: value })}
            />
          </Form.Item>

          <Form.Item label="Estoque" validateStatus={errors.stockQuantity ? "error" : undefined}>
            {stockFormat ? (
              <InputNumberFormatted
                value={local.stockQuantity}
                precision={stockFormat.precision}
                suffix={stockFormat.suffix}
                placeholder={stockFormat.placeholder}
                onChange={(value) => update({ stockQuantity: value })}
              />
            ) : (
              <InputNumber
                min={0}
                value={local.stockQuantity}
                onChange={(value) => update({ stockQuantity: Number(value) || 0 })}
                style={{ width: "100%" }}
              />
            )}
            {errors.stockQuantity && (
              <Text type="danger" style={{ fontSize: 12 }}>
                {errors.stockQuantity}
              </Text>
            )}
          </Form.Item>

          <Form.Item label="Controlar estoque">
            <Switch
              checked={local.isStockControlled}
              onChange={(checked) => update({ isStockControlled: checked })}
            />
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
