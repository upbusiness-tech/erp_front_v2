import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { PaymentMethod } from "@/enums/payment.enum";
import { Form, message, Modal, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { ICloseCashFlowForm } from "./types";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { useNavigate } from "react-router-dom";
import { CashierPaths } from "@/routes/AuthenticatedRoutes/Cashier/routes";
import { CashFlowService } from "@/services/cashFlow.service";
import { useCacheManager } from "@/hooks/useCacheManager";

const { Text } = Typography;

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.PIX]: "PIX",
  [PaymentMethod.CREDIT]: "Cartão de Crédito",
  [PaymentMethod.DEBIT]: "Cartão de Débito",
  [PaymentMethod.CASH]: "Dinheiro",
};

type CloseCashFlowModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
};

const cashFlowService = new CashFlowService("open");
export const CloseCashFlowModal = ({ isOpen, onClose }: CloseCashFlowModalProps) => {
  const [form] = Form.useForm<ICloseCashFlowForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { invalidateQuery } = useCacheManager();

  const { handleCloseCashFlow } = useCashFlowStore();
  const navigate = useNavigate();

  const paymentMethods = useMemo(() => Object.values(PaymentMethod), []);

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        closingBalance: 0,
        informedValues: paymentMethods.map((method) => ({
          method,
          value: 0,
        })),
      });
    }
  }, [isOpen, form, paymentMethods]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();
      const result = await handleCloseCashFlow(values);
      if (result) {
        invalidateQuery(cashFlowService);
        navigate(CashierPaths.OPEN);
        onClose();
        form.resetFields();
      } else {
        message.error(error.message || "Erro ao encerrar o caixa.");
      }
    } catch (error: any) {
      return error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      title="Fechar Caixa"
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Fechar Caixa"
      cancelText="Cancelar"
      confirmLoading={isSubmitting}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="closingBalance"
          label="Valor no Caixa (R$)"
          rules={[{ required: true, message: "Informe o valor no caixa" }]}
        >
          <InputNumberFormatted min={0} step={1} style={{ width: "100%" }} prefix="R$" />
        </Form.Item>

        <Text strong style={{ marginBottom: 8, display: "block" }}>
          Valores Informados
        </Text>

        <Form.List name="informedValues">
          {(fields) =>
            fields.map(({ key, name }) => {
              const method = paymentMethods[name];
              return (
                <div key={key}>
                  <Form.Item name={[name, "method"]} hidden>
                    <input />
                  </Form.Item>
                  <Form.Item
                    label={PAYMENT_METHOD_LABELS[method]}
                    name={[name, "value"]}
                    rules={[
                      {
                        required: true,
                        message: `Informe o valor de ${PAYMENT_METHOD_LABELS[method]}`,
                      },
                    ]}
                  >
                    <InputNumberFormatted min={0} step={1} style={{ width: "100%" }} prefix="R$" />
                  </Form.Item>
                </div>
              );
            })
          }
        </Form.List>
      </Form>
    </Modal>
  );
};
