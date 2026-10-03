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
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IProductCreateFields, IProductVariantField, ProductUnitOfMeasure } from "./types";

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

  const [file, setfile] = useState<File | undefined>(undefined);
  const [loading, setloading] = useState(false);

  const submitProduct = async () => {
    try {
      setloading(true);
      const values = form.getFieldsValue(true);
      if (file) {
        const url = await uploadToCloudinary(file);
        form.setFieldValue("productPicture", url);
        values.productPicture = url;
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

      form.setFieldsValue({
        name: productToEdit.name,
        productCategoryId: productToEdit.productCategoryId,
        productPicture: productToEdit.productPicture,
        unitOfMeasure: productToEdit.unitOfMeasure as ProductUnitOfMeasure,
        variants,
        productFiscalClassification: {
          cest: fiscalFromClassification.cest,
          cfop: fiscalFromClassification.cfop,
          cofins: fiscalFromClassification.cofins,
          csosn: fiscalFromClassification.csosn,
          ncm: fiscalFromClassification.ncm,
          origin: fiscalFromClassification.origin,
          pis: fiscalFromClassification.pis,
        },
      });
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
    setfile,
    handleDeleteProduct,
    isEdit: !!isEdit,
    id,
    loading,
    suppliers,
    isLoadingSuppliers,
    currentPlan,
  };
}
