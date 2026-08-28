import { ProductSupplierModel } from "@/model/productSupplier.model";
import { ProductSupplierService } from "@/services/productSupplier.service";
import { Form, message } from "antd";
import { useEffect, useState } from "react";

const productSupplierService = new ProductSupplierService();

interface UseEditSupplierModalProps {
  editingSupplier: ProductSupplierModel | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function useEditSupplierModal({
  editingSupplier,
  onClose,
  onSuccess,
}: UseEditSupplierModalProps) {
  const [form] = Form.useForm<{ name: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSupplier) {
      form.setFieldsValue({ name: editingSupplier.name });
    }
  }, [editingSupplier, form]);

  const handleSave = async () => {
    if (!editingSupplier) return;
    try {
      setLoading(true);
      const { name } = form.getFieldsValue();
      await productSupplierService.update(editingSupplier.id, { name });
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error("Erro ao atualizar a categoria do produto");
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, handleSave };
}
