import { useCacheManager } from "@/hooks/useCacheManager";
import { useGetAllWithParams } from "@/hooks/useGetAllWithParams";
import { ProductSupplierModel } from "@/model/productSupplier.model";
import { ProductService } from "@/services/product.service";
import { ProductSupplierService } from "@/services/productSupplier.service";
import { PaginatedResponse } from "@/types/crud.types";
import { message } from "antd";
import { useState } from "react";

const productSupplierService = new ProductSupplierService();
const productService = new ProductService();

export function useStockSuppliersOverviewController() {
  const { data: suppliers } =
    useGetAllWithParams<PaginatedResponse<ProductSupplierModel>>(productSupplierService);

  const { invalidateQuery } = useCacheManager();

  const [supplierName, setSupplierName] = useState<string>("");

  const [submiting, setsubmiting] = useState(false);
  const submitSupplier = async () => {
    try {
      setsubmiting(true);
      await productSupplierService.create({ name: supplierName });
      invalidateQuery(productSupplierService);
      setSupplierName("");
    } catch (error) {
      console.info();
    } finally {
      setsubmiting(false);
    }
  };

  const [editingSupplier, setEditingSupplier] = useState<ProductSupplierModel | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await productSupplierService.delete(id);
      refreshSuppliers();
      message.success("Fornecedor removido!");
    } catch {
      message.error("Erro ao remover fornecedor");
    }
  };

  const refreshSuppliers = () => {
    invalidateQuery(productSupplierService);
    invalidateQuery(productService);
  };

  return {
    supplierName,
    setSupplierName,
    submitSupplier,
    suppliers,
    submiting,
    refreshSuppliers,
    handleDelete,
    editingSupplier,
    setEditingSupplier,
  };
}
