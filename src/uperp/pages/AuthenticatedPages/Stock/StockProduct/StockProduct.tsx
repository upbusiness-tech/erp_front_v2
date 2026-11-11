import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";

import { ProductGalleryModal } from "@/application-components/ProductGalleryModal/ProductGalleryModal";
import { PlanNames } from "@/enums/plan.enum";
import { ArrowLeft, Camera, Images, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BRAND } from "@/theme";
import { IProductCreateFields, ProductUnitOfMeasure } from "./types";
import {
  csosnOptions,
  originOptions,
  pisCofinsOptions,
  useStockProductController,
} from "./useStockProduct.controller";
import { StickyFooter } from "./editor/StickyFooter";
import { VariantDrawer } from "./editor/VariantDrawer";
import { VariantTable } from "./editor/VariantTable";
import { VariantToolbar } from "./editor/VariantToolbar";
import type { ProductDraft, VariantDraft } from "./editor/types";
import { isEditorDirty, isProductDraftDirty } from "./editor/variantDiff";
import { useProductVariantEditor, VARIANT_PAGE_SIZE } from "./editor/useProductVariantEditor";
import { AxiosError } from "axios";

const { Text, Title } = Typography;

type StockProductFormProps = {
  isEdit?: boolean;
};

export const StockProductForm = ({ isEdit = false }: StockProductFormProps) => {
  const {
    form,
    categories,
    isLoadingCategories,
    saveProduct,
    productToEdit,
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
    suppliers,
    currentCompany,
  } = useStockProductController({ isEdit });

  const navigate = useNavigate();

  const editor = useProductVariantEditor({
    initialVariants: productToEdit?.productEspecifications,
    productId: productToEdit?.id,
  });

  const unitOfMeasure = Form.useWatch("unitOfMeasure", form);
  const unitOfMeasureValue = String(unitOfMeasure ?? "");

  const unitOfMeasureOptions = useMemo(
    () =>
      Object.values(ProductUnitOfMeasure).map((unit) => ({
        value: unit,
        label: unit,
      })),
    [],
  );

  const [productBaseline, setProductBaseline] = useState<ProductDraft>({
    name: "",
    unitOfMeasure: "",
  });
  const [drawerKey, setDrawerKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!productToEdit) return;

    const fiscal = productToEdit.productFiscalClassification;
    const fiscalValues = fiscal
      ? {
          cest: fiscal.cest,
          cfop: fiscal.cfop,
          cofins: fiscal.cofins,
          csosn: fiscal.csosn,
          ncm: fiscal.ncm,
          origin: fiscal.origin,
          pis: fiscal.pis,
        }
      : undefined;
    const hasFiscalValue = fiscalValues
      ? Object.values(fiscalValues).some(
          (value) => value !== null && value !== undefined && value !== "",
        )
      : false;

    setProductBaseline({
      name: productToEdit.name,
      productCategoryId: productToEdit.productCategoryId,
      unitOfMeasure: productToEdit.unitOfMeasure,
      productPicture: productToEdit.productPicture ?? null,
      productFiscalClassification: hasFiscalValue ? fiscalValues : undefined,
    });
  }, [productToEdit]);

  const watchedName = Form.useWatch("name", form);
  const watchedCategory = Form.useWatch("productCategoryId", form);
  const watchedUnit = Form.useWatch("unitOfMeasure", form);
  const watchedFiscal = Form.useWatch("productFiscalClassification", form);

  const currentProductDraft = useMemo<ProductDraft>(
    () => ({
      name: watchedName ?? "",
      productCategoryId: watchedCategory,
      unitOfMeasure: watchedUnit ?? "",
      productPicture: previewSrc ?? null,
      productFiscalClassification: watchedFiscal,
    }),
    [previewSrc, watchedCategory, watchedFiscal, watchedName, watchedUnit],
  );

  const productDirty = isProductDraftDirty(productBaseline, currentProductDraft);
  const isDirty = isEditorDirty(productDirty, editor.diff);

  const [searchParams] = useSearchParams();
  const especificacaoIdParam = Number(searchParams.get("especificacaoId"));
  const appliedFocusRef = useRef<string | null>(null);
  const { draft: editorDraft, setFocusVariantId } = editor;

  useEffect(() => {
    if (!productToEdit) return;
    if (!Number.isFinite(especificacaoIdParam) || especificacaoIdParam <= 0) return;

    const focusKey = `${productToEdit.id}:${especificacaoIdParam}`;
    if (appliedFocusRef.current === focusKey) return;
    if (!editorDraft.some((variant) => variant.id === especificacaoIdParam)) return;

    appliedFocusRef.current = focusKey;
    setFocusVariantId(especificacaoIdParam);
  }, [editorDraft, especificacaoIdParam, productToEdit, setFocusVariantId]);

  const selectedVariant = drawerKey
    ? (editor.draft.find((variant) => variant.key === drawerKey) ?? null)
    : null;

  useEffect(() => {
    if (drawerOpen && !selectedVariant) setDrawerOpen(false);
  }, [drawerOpen, selectedVariant]);

  useEffect(() => {
    if (!isDirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (!isDirty) {
      handleGoBack();
      return;
    }

    Modal.confirm({
      title: "Descartar alterações?",
      content: "As alterações não salvas serão perdidas.",
      okText: "Descartar",
      cancelText: "Continuar editando",
      okButtonProps: { danger: true },
      onOk: handleGoBack,
    });
  }, [handleGoBack, isDirty]);

  const openVariant = useCallback((variant: VariantDraft) => {
    setDrawerKey(variant.key);
    setDrawerOpen(true);
  }, []);

  const handleAddVariant = useCallback(() => {
    const variant = editor.addVariant();
    setDrawerKey(variant.key);
    setDrawerOpen(true);
  }, [editor]);

  const handleDuplicateVariant = useCallback(
    (variant: VariantDraft) => {
      const key = editor.duplicateVariant(variant.key);
      setDrawerKey(key);
      setDrawerOpen(true);
    },
    [editor],
  );

  const handleRemoveVariant = useCallback(
    (variant: VariantDraft) => {
      editor.removeVariants([variant.key]);
    },
    [editor],
  );

  const handleSave = useCallback(async () => {
    try {
      await form.validateFields();
    } catch {
      message.error("Preencha os campos obrigatórios do produto.");
      return;
    }

    if (editor.validation.invalidCount > 0) {
      message.warning("Corrija as variações inválidas antes de salvar.");
      editor.setFilter("invalid");
      return;
    }

    if (!isDirty) return;

    const productFields = form.getFieldsValue(true) as IProductCreateFields;
    const result = await saveProduct({ productFields, variantDiff: editor.diff });

    if (!result.ok) {
      return;
    }

    if (isEdit) {
      if (result.product) {
        editor.markSaved(result.product);
        setProductBaseline({
          name: result.product.name,
          productCategoryId: result.product.productCategoryId,
          unitOfMeasure: result.product.unitOfMeasure,
          productPicture: result.product.productPicture ?? null,
          productFiscalClassification: result.product.productFiscalClassification,
        });
        return;
      }

      navigate(-1);
      return;
    }

    navigate(-1);
  }, [editor, form, isDirty, isEdit, navigate, saveProduct]);

  return (
    <Card
      title={
        <Space>
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={handleBack} />
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
      <Form layout="vertical" form={form} onFinish={handleSave}>
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
              <Select allowClear placeholder="Uni." options={unitOfMeasureOptions} />
            </Form.Item>
          </Col>
        </Row>

        {currentCompany?.planName === PlanNames.FISCAL && (
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
          Edite cada variação no painel lateral. O salvamento envia apenas o que foi alterado.
        </Text>

        <VariantToolbar
          search={editor.search}
          setSearch={editor.setSearch}
          filter={editor.filter}
          setFilter={editor.setFilter}
          sort={editor.sort}
          setSort={editor.setSort}
          filteredCount={editor.filtered.length}
          focusVariantId={editor.focusVariantId}
          onClearFocus={() => editor.setFocusVariantId(null)}
          onAdd={handleAddVariant}
        />

        <VariantTable
          rows={editor.paged}
          total={editor.filtered.length}
          page={editor.page}
          pageSize={VARIANT_PAGE_SIZE}
          onPageChange={editor.setPage}
          validation={editor.validation}
          diff={editor.diff}
          suppliers={suppliers}
          unitOfMeasure={unitOfMeasureValue}
          isEmpty={editor.draft.length === 0}
          onEdit={openVariant}
          onDuplicate={handleDuplicateVariant}
          onRemove={handleRemoveVariant}
          onAdd={handleAddVariant}
        />

        <StickyFooter
          createdCount={editor.diff.createdCount}
          updatedCount={editor.diff.updatedCount}
          deletedCount={editor.diff.deletedCount}
          invalidCount={editor.validation.invalidCount}
          isDirty={isDirty}
          saving={loading}
          onSave={handleSave}
        />
      </Form>

      <VariantDrawer
        open={drawerOpen}
        variant={selectedVariant}
        variants={editor.filtered}
        suppliers={suppliers}
        unitOfMeasure={unitOfMeasureValue}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(key) => setDrawerKey(key)}
        onSave={(key, variant) => editor.updateVariant(key, variant)}
      />

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
