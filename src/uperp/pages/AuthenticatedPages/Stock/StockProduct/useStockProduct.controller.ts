import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { useGetOneWithParams } from "@/hooks/useGetOneWithParams";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { PlanModel } from "@/model/plan.model";
import { ProductModel } from "@/model/product.model";
import { ProductCategoryModel } from "@/model/productCategory.model";
import { ProductSupplierModel } from "@/model/productSupplier.model";
import { PlanService } from "@/services/plan.service";
import { ProductService } from "@/services/product.service";
import { ProductCategoryService } from "@/services/productCategory.service";
import { ProductSupplierService } from "@/services/productSupplier.service";
import { PaginatedResponse } from "@/types/crud.types";
import { Form, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IProductCreateFields, IProductVariantField, ProductUnitOfMeasure } from "./types";
import { CsosnEnum, OriginEnum, PisCofinsCstEnum } from "@/enums/productFiscal.enum";

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
const planService = new PlanService();

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

  const submitProduct = async () => {
    try {
      setloading(true);
      const values = form.getFieldsValue(true);
      const fiscal = values.productFiscalClassification;
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
      if (isEdit && id) {
        const variants: IProductVariantField[] = values.variants.map((p: IProductVariantField) => {
          return {
            id: p.id,
            barcode: p.barcode,
            costPrice: Number(p.costPrice),
            salePrice: Number(p.salePrice),
            code: p.code,
            isStockControlled: p.isStockControlled,
            stockQuantity: p.stockQuantity,
            size: p.size,
            color: p.color,
            brand: p.brand,
            productSupplierId: p.productSupplierId,
          };
        });
        values.variants = variants;
        await productService.update(id, values);
      } else {
        await productService.create(values);
      }
      invalidateQuery(productService);
      message.success(`Produto ${isEdit ? "atualizado" : "cadastrado"} com sucesso`);
      navigate(-1);
    } catch (error) {
      message.error(`Erro ao ${isEdit ? "atualizar" : "cadastrar"} produto.`);
    } finally {
      setloading(false);
    }
  };

  const { data: productToEdit } = useGetOneWithParams<ProductModel>(productService, {
    id: id!,
    enabled: !!id && isEdit,
  });

  const [currentPlan, setCurrentPlan] = useState<PlanModel | undefined>(undefined);

  const getPlan = async () => {
    const plan = await planService.getMyPlan();
    setCurrentPlan(plan);
  };

  useEffect(() => {
    if (isEdit && productToEdit) {
      const variants: IProductVariantField[] = productToEdit.productEspecifications.map((pe) => {
        return {
          ...pe,
        };
      });

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
        variants,
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

  useEffect(() => {
    getPlan();
  }, []);

  return {
    form,
    categories,
    isLoadingCategories,
    submitProduct,
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
    currentPlan,
  };
}
