import { useState } from "react";
import { Form, Input, Button, Card, Typography, Modal, message, Divider } from "antd";
import { Store, Building2 } from "lucide-react";

const { Title, Text } = Typography;

interface Props {
  onSuccess: () => void;
}

export function CompanyLogin({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("Empresa autenticada com sucesso!");
      onSuccess();
    }, 600);
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
              background: "#F26B1F",
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

        <Form layout="vertical" onFinish={onFinish} initialValues={{ cnpj: "12.345.678/0001-90", password: "demo" }}>
          <Form.Item name="cnpj" label="CNPJ" rules={[{ required: true }]}>
            <Input placeholder="00.000.000/0000-00" size="large" />
          </Form.Item>
          <Form.Item name="password" label="Senha" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Entrar
          </Button>
        </Form>

        <Divider plain>ou</Divider>
        <Button block icon={<Building2 size={16} />} onClick={() => setRegisterOpen(true)}>
          Cadastrar Empresa
        </Button>
      </Card>

      <Modal
        title="Cadastrar nova empresa"
        open={registerOpen}
        onCancel={() => setRegisterOpen(false)}
        onOk={() => {
          message.success("Empresa cadastrada! Faça login para continuar.");
          setRegisterOpen(false);
        }}
        okText="Cadastrar"
        cancelText="Cancelar"
      >
        <Form layout="vertical">
          <Form.Item label="Razão Social" required>
            <Input placeholder="Minha Empresa Ltda" />
          </Form.Item>
          <Form.Item label="CNPJ" required>
            <Input placeholder="00.000.000/0000-00" />
          </Form.Item>
          <Form.Item label="E-mail" required>
            <Input placeholder="contato@empresa.com" />
          </Form.Item>
          <Form.Item label="Telefone">
            <Input placeholder="(00) 0000-0000" />
          </Form.Item>
          <Form.Item label="Senha" required>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
