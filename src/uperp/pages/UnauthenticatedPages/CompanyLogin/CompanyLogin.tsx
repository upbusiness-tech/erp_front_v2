import { BRAND } from "@/theme/colors";
import { Button, Card, Form, Input, Typography } from "antd";
import { Store } from "lucide-react";
import { useCompanyLoginController } from "./useCompanyLogin.controller";

const { Title, Text } = Typography;

export function CompanyLogin() {
  const { handleLoginWithCompany, isSubmitting } = useCompanyLoginController();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, #111 0%, #2a1a10 60%, ${BRAND} 160%)`,
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
              background: BRAND,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Store color="#fff" size={32} />
          </div>
          <Title level={3} style={{ margin: 0 }}>
            UpERP
          </Title>
          <Text type="secondary">Acesso da Empresa</Text>
        </div>

        <Form layout="vertical" onFinish={handleLoginWithCompany}>
          <Form.Item name="email" label="E-mail" rules={[{ required: true }]}>
            <Input placeholder="suaempresa@email.com" size="large" />
          </Form.Item>
          <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={isSubmitting}>
            Entrar
          </Button>
        </Form>
      </Card>
    </div>
  );
}
