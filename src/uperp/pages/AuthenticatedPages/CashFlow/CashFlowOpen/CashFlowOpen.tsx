import InputNumberFormatted from "@/application-components/InputNumberFormated/InputNumberFormated";
import { CashierPaths } from "@/routes/AuthenticatedRoutes/Cashier/routes";
import { useAuthStore } from "@/stores/auth.store";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { Button, Card, Col, Form, Input, message, Row, Space, Typography } from "antd";
import { Lock, LockOpen } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export const CashFlowOpen = () => {
  const [openForm] = Form.useForm<{ initialBalance: number }>();

  const { currentCashFlow, handleOpenCashFlow } = useCashFlowStore();
  const navigate = useNavigate();

  const handleOpen = async () => {
    const values = openForm.getFieldsValue();
    const result = await handleOpenCashFlow(values);
    if (result) {
      navigate(CashierPaths.BASE);
    } else {
      message.error("Não foi possível abrir o caixa.");
    }
  };

  // useEffect(() => {
  //   loadCurrentCashOpen();
  // }, [loadCurrentCashOpen]);

  useEffect(() => {
    if (currentCashFlow) navigate(CashierPaths.BASE);
  }, [currentCashFlow, navigate]);

  const { employeeName } = useAuthStore();

  return (
    <>
      {/* {onBack && (
        <Button
          type="link"
          icon={<ArrowLeft size={14} />}
          onClick={onBack}
          style={{ paddingLeft: 0, marginBottom: 8 }}
        >
          Voltar
        </Button>
      )} */}
      <Row justify="center">
        <Col xs={24} md={14} lg={10}>
          <Card style={{ borderTop: "4px solid #DC2626" }} styles={{ body: { padding: 32 } }}>
            <Space direction="vertical" align="center" style={{ width: "100%", marginBottom: 16 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#FEF2F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock color="#DC2626" size={32} />
              </div>
              <Title level={3} style={{ margin: 0 }}>
                Caixa Fechado
              </Title>
              <Text type="secondary">Informe o valor inicial para iniciar as operações.</Text>
            </Space>
            <Form
              layout="vertical"
              form={openForm}
              onFinish={handleOpen}
              initialValues={{ initialValue: 0 }}
            >
              <Form.Item
                name="initialBalance"
                label="Valor inicial (R$)"
                rules={[{ required: true, message: "Informe o valor inicial" }]}
              >
                <InputNumberFormatted
                  min={0}
                  step={10}
                  size="large"
                  style={{ width: "100%" }}
                  prefix="R$"
                />
              </Form.Item>
              <Form.Item label="Operador">
                <Input value={employeeName || "Indefinido"} disabled size="large" />
              </Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                block
                icon={<LockOpen size={16} />}
              >
                Abrir Caixa
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};
