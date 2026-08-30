import { Button, Card, Form, Input, Select, Typography } from "antd";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployeeLoginController } from "./useEmployeeLogin.controller";
import { useAuthStore } from "@/stores/auth.store";

const { Title, Text } = Typography;

export function EmployeeLogin() {
  const navigate = useNavigate();
  const { avaliableEmployees, isLoading, handleLoginWithEmployee, isSubmitting } =
    useEmployeeLoginController();

  const { logout } = useAuthStore();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #111 0%, #2a1a10 60%, #F26B1F 160%)",
        padding: 24,
      }}
    >
      <Card style={{ width: 420, boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#111",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <UserCircle2 color="#F26B1F" size={32} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            Acesso do Funcionário
          </Title>
          {/* <Text type="secondary">Minha Loja Demo Ltda</Text> */}
        </div>

        <Form layout="vertical" onFinish={handleLoginWithEmployee}>
          <Form.Item name="username" label="Funcionário" rules={[{ required: true }]}>
            <Select
              loading={isLoading}
              size="large"
              options={avaliableEmployees.map((ae) => {
                return {
                  value: ae.username,
                  label: `${ae.employee.name} (${ae.employee.type})`,
                };
              })}
            />
          </Form.Item>
          <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={isSubmitting}>
            Entrar no Sistema
          </Button>
        </Form>

        <Button
          type="link"
          icon={<ArrowLeft size={14} />}
          onClick={logout}
          style={{ marginTop: 8, padding: 0 }}
        >
          Trocar empresa
        </Button>
      </Card>
    </div>
  );
}
