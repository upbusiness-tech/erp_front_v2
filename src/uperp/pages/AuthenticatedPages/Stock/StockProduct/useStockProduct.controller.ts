import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { useGetOneWithParams } from "@/hooks/useGetOneWithParams";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ProductModel } from "@/model/product.model";
import { ProductCategoryModel } from "@/model/productCategory.model";
import { ProductSupplierModel } from "@/model/productSupplier.model";
import { ProductService } from "@/services/product.service";
import { ProductCategoryService } from "@/services/productCategory.service";
import { ProductSupplierService } from "@/services/productSupplier.service";
import { PaginatedResponse } from "@/types/crud.types";
import { Form, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IProductCreateFields, ProductUnitOfMeasure } from "./types";
import type { VariantDiff } from "./editor/types";
import { CsosnEnum, OriginEnum, PisCofinsCstEnum } from "@/enums/productFiscal.enum";
import { useAuthStore } from "@/stores/auth.store";

const formatEnumKey = (key: string) =>
  key
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");

export const originOptions = Object.entries(OriginEnum)
  .filter(([key]) => Number.isNaN(Number(key)))
  .map(([key, value]) => ({
    value,
    label: `${value} - ${formatEnumKey(key)}`,
  }));

export const csosnOptions = Object.entries(CsosnEnum)
  .filter(([key]) => Number.isNaN(Number(key)))
  .map(([key, value]) => ({
    value,
    label: `${value} - ${formatEnumKey(key)}`,
  }));

export const pisCofinsOptions = Object.entries(PisCofinsCstEnum)
  .filter(([key]) => Number.isNaN(Number(key)))
  .map(([key, value]) => ({
    value,
    label: `${value} - ${formatEnumKey(key)}`,
  }));

const productCategoryService = new ProductCategoryService();
const productSupplierService = new ProductSupplierService();
const productService = new ProductService();

export function useStockProductController({ isEdit }: { isEdit?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<IProductCreateFields>();

  const { data: categories, isLoading: isLoadingCategories } =
    useGetAllWithParams<PaginatedResponse<ProductCategoryModel>>(productCategoryService);

  const { data: suppliers, isLoading: isLoadingSuppliers } =
    useGetAllWithParams<PaginatedResponse<ProductSupplierModel>>(productSupplierService);

  const { invalidateQuery } = useCacheManager();

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    try {
      await productService.delete(id);
      message.success("Produto removido com sucesso");
      invalidateQuery(productService);
      navigate(-1);
    } catch {
      message.error("Erro ao remover produto.");
    }
  };

  const [pendingFile, setPendingFile] = useState<File | undefined>(undefined);
  const [selectedPictureUrl, setSelectedPictureUrl] = useState<string | undefined>(undefined);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | undefined>(undefined);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const pendingPreviewUrlRef = useRef<string | undefined>(undefined);
  const initializedPictureProductIdRef = useRef<number | null>(null);

  const revokePendingPreview = () => {
    if (pendingPreviewUrlRef.current) {
      URL.revokeObjectURL(pendingPreviewUrlRef.current);
      pendingPreviewUrlRef.current = undefined;
    }
  };

  const handleFileSelect = (file: File) => {
    revokePendingPreview();
    const previewUrl = URL.createObjectURL(file);
    pendingPreviewUrlRef.current = previewUrl;
    setPendingFile(file);
    setPendingPreviewUrl(previewUrl);
  };

  const handleSelectGalleryPhoto = (url: string) => {
    revokePendingPreview();
    setPendingFile(undefined);
    setPendingPreviewUrl(undefined);
    setSelectedPictureUrl(url);
    setIsGalleryOpen(false);
  };

  const handleRemovePhoto = () => {
    revokePendingPreview();
    setPendingFile(undefined);
    setPendingPreviewUrl(undefined);
    setSelectedPictureUrl(undefined);
  };

  const openGallery = () => setIsGalleryOpen(true);
  const closeGallery = () => setIsGalleryOpen(false);
  const previewSrc = pendingPreviewUrl ?? selectedPictureUrl;

  useEffect(() => {
    return () => {
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current);
      }
    };
  }, []);

  const [loading, setloading] = useState(false);

  const saveProduct = async ({
    productFields,
    variantDiff,
  }: {
    productFields: IProductCreateFields;
    variantDiff: VariantDiff;
  }): Promise<{ ok: boolean; product?: ProductModel }> => {
    try {
      setloading(true);
      const { variants: _variants, ...productFieldsWithoutVariants } = productFields;
      const values: Record<string, unknown> = { ...productFieldsWithoutVariants };

      const fiscal = values.productFiscalClassification as
        IProductCreateFields["productFiscalClassification"] | undefined;
      const hasFiscalValue = fiscal
        ? Object.values(fiscal).some(
            (value) => value !== null && value !== undefined && value !== "",
          )
        : false;
      if (fiscal && !hasFiscalValue) {
        delete values.productFiscalClassification;
      }

      if (pendingFile) {
        const url = await uploadToCloudinary(pendingFile);
        values.productPicture = url;
      } else {
        values.productPicture = selectedPictureUrl ?? null;
      }

      const payload = {
        ...values,
        variants: variantDiff.variants,
        ...(isEdit ? { idsToDelete: variantDiff.idsToDelete } : {}),
      };

      const saved =
        isEdit && id
          ? await productService.update<ProductModel>(id, payload)
          : await productService.create<ProductModel>(payload);

      invalidateQuery(productService);
      message.success(`Produto ${isEdit ? "atualizado" : "cadastrado"} com sucesso`);
      return { ok: true, product: saved ?? undefined };
    } catch (error) {
      message.error(`Erro ao ${isEdit ? "atualizar" : "cadastrar"} produto.`);
      return { ok: false };
    } finally {
      setloading(false);
    }
  };

  const { data: productToEdit } = useGetOneWithParams<ProductModel>(productService, {
    id: id!,
    enabled: !!id && isEdit,
  });

  const { currentCompany } = useAuthStore();

  useEffect(() => {
    if (isEdit && productToEdit) {
      const fiscalFromClassification = productToEdit.productFiscalClassification;

      const fiscalClassificationValues = {
        cest: fiscalFromClassification?.cest,
        cfop: fiscalFromClassification?.cfop,
        cofins: fiscalFromClassification?.cofins,
        csosn: fiscalFromClassification?.csosn,
        ncm: fiscalFromClassification?.ncm,
        origin: fiscalFromClassification?.origin,
        pis: fiscalFromClassification?.pis,
      };

      const hasFiscalClassification = Object.values(fiscalClassificationValues).some(
        (value) => value !== null && value !== undefined && value !== "",
      );

      form.setFieldsValue({
        name: productToEdit.name,
        productCategoryId: productToEdit.productCategoryId,
        unitOfMeasure: productToEdit.unitOfMeasure as ProductUnitOfMeasure,
        ...(hasFiscalClassification
          ? { productFiscalClassification: fiscalClassificationValues }
          : {}),
      });
    }
  }, [isEdit, productToEdit, form]);

  useEffect(() => {
    if (isEdit && productToEdit && initializedPictureProductIdRef.current !== productToEdit.id) {
      initializedPictureProductIdRef.current = productToEdit.id;
      setSelectedPictureUrl(productToEdit.productPicture || undefined);
    }
  }, [isEdit, productToEdit]);

  return {
    form,
    categories,
    isLoadingCategories,
    saveProduct,
    productToEdit,
    handleGoBack,
    pendingFile,
    selectedPictureUrl,
    pendingPreviewUrl,
    previewSrc,
    handleFileSelect,
    handleSelectGalleryPhoto,
    handleRemovePhoto,
    isGalleryOpen,
    openGallery,
    closeGallery,
    handleDeleteProduct,
    isEdit: !!isEdit,
    id,
    loading,
    suppliers,
    isLoadingSuppliers,
    currentCompany,
  };
}
