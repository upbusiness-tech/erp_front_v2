import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { TransactionOrigin } from "@/enums/cashFlow.enum";
import { CashFlowTransactionService } from "@/services/cashFlowTransaction.service";
import { Form, Input, message, Modal } from "antd";
import { useState } from "react";
import { ICashFlowTransactionForm } from "./types";
import { useCacheManager } from "@/hooks/useCacheManager";

type CashFlowTransactionModalProps = {
  isOpen: boolean;
  type: TransactionOrigin | undefined;
  onClose: VoidFunction;
};

const cashFlowTransaction = new CashFlowTransactionService();
const cashFlowTransactionStatsService = new CashFlowTransactionService("stats");

export const CashFlowTransactionModal = ({
  isOpen,
  type,
  onClose,
}: CashFlowTransactionModalProps) => {
  const [movForm] = Form.useForm<ICashFlowTransactionForm>();

  const { invalidateQuery } = useCacheManager();

  const [isSubmiting, setIsSubmiting] = useState(false);
  const handleAdMovement = async () => {
    try {
      setIsSubmiting(true);
      const values = movForm.getFieldsValue();
      await cashFlowTransaction.create({
        ...values,
        origin: type,
      });
      invalidateQuery(cashFlowTransaction);
      invalidateQuery(cashFlowTransactionStatsService);
      onClose();
      movForm.resetFields();
    } catch (error: any) {
      message.error(error.message || "Erro ao enviar movimentação de caixa.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Modal
      loading={isSubmiting}
      open={isOpen}
      title={type}
      onCancel={onClose}
      onOk={handleAdMovement}
      okText="Registrar"
      cancelText="Cancelar"
    >
      <Form layout="vertical" form={movForm}>
        <Form.Item
          name="amount"
          label="Valor (R$)"
          rules={[{ required: true, message: "Informe o valor" }]}
        >
          <InputNumberFormatted min={1} step={1} style={{ width: "100%" }} prefix="R$" />
        </Form.Item>
        <Form.Item name="note" label="Observação">
          <Input.TextArea rows={2} placeholder="Ex: Troco / Pagamento de fornecedor" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
