import { Card, Form, Input, Button, Row, Col, message, Avatar } from "antd";
import { Building2 } from "lucide-react";
import { useStore } from "../store";

export function Empresa() {
  const { company, setCompany } = useStore();
  const [form] = Form.useForm();

  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Card>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <Avatar size={96} style={{ background: "#F26B1F", marginBottom: 12 }} icon={<Building2 />} />
            <h2 style={{ margin: 0 }}>{company.name}</h2>
            <p style={{ color: "#888", margin: 0 }}>{company.cnpj}</p>
            <p style={{ color: "#F26B1F", marginTop: 12, fontWeight: 600 }}>Plano {company.plan}</p>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Dados Cadastrais">
          <Form
            layout="vertical"
            form={form}
            initialValues={company}
            onFinish={(v) => {
              setCompany({ ...company, ...v });
              message.success("Dados da empresa atualizados");
            }}
          >
            <Row gutter={12}>
              <Col span={16}>
                <Form.Item name="name" label="Razão Social"><Input /></Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="cnpj" label="CNPJ"><Input /></Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="email" label="E-mail"><Input /></Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Telefone"><Input /></Form.Item>
              </Col>
            </Row>
            <Form.Item name="address" label="Endereço"><Input /></Form.Item>
            <Button type="primary" htmlType="submit">Salvar alterações</Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
