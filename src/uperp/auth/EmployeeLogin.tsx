import { useState } from "react";
import { Form, Input, Button, Card, Typography, Select, App } from "antd";
import { UserCircle2, ArrowLeft } from "lucide-react";

const { Title, Text } = Typography;

interface Props {
  onSuccess: (name: string) => void;
  onBack: () => void;
}

export function EmployeeLogin({ onSuccess, onBack }: Props) {
  const { message } = App.useApp();

  const onFinish = (values: { name: string; password: string }) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(`Bem-vindo(a), ${values.name}!`);
      onSuccess(values.name);
    }, 500);
  };

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
          <Text type="secondary">Minha Loja Demo Ltda</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ name: "Pedro Almeida", password: "demo" }}>
          <Form.Item name="name" label="Funcionário" rules={[{ required: true }]}>
            <Select
              size="large"
              options={[
                { value: "Pedro Almeida", label: "Pedro Almeida (Gerente)" },
                { value: "Juliana Costa", label: "Juliana Costa (Vendedor)" },
                { value: "Marcos Silva", label: "Marcos Silva (Caixa)" },
              ]}
            />
          </Form.Item>
          <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Entrar no Sistema
          </Button>
        </Form>

        <Button type="link" icon={<ArrowLeft size={14} />} onClick={onBack} style={{ marginTop: 8, padding: 0 }}>
          Trocar empresa
        </Button>
      </Card>
    </div>
  );
}
