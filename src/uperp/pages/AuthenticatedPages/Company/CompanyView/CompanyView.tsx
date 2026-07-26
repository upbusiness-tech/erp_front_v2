import { Avatar, Button, Card, Col, Form, Input, Row } from "antd";
import { Camera, Building2 } from "lucide-react";
import { useRef } from "react";
import { useCompanyViewController } from "./useCompanyView.controller";

export const CompanyView = () => {
  const { company, form, avatarUrl, isUpdating, handleUpdateCompany, handleFileSelect } =
    useCompanyViewController();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Card>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
              <Avatar
                src={avatarUrl ?? company?.profilePicture}
                size={96}
                style={{ background: "#F26B1F", cursor: "pointer" }}
                icon={<Building2 />}
                onClick={() => fileInputRef.current?.click()}
              />
              <Camera
                size={20}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: -4,
                  background: "#fff",
                  borderRadius: "50%",
                  padding: 4,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
            <h2 style={{ margin: 0 }}>{company?.name}</h2>
            <h2 style={{ margin: 0 }}>{company?.email}</h2>
            <p style={{ color: "#888", margin: 0 }}>{company?.document}</p>
            <p style={{ color: "#F26B1F", marginTop: 12, fontWeight: 600 }}>
              Plano {company?.planName}
            </p>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={16}>
        <Card title="Dados Cadastrais">
          <Form
            layout="vertical"
            form={form}
            initialValues={company}
            onFinish={handleUpdateCompany}
          >
            <Form.Item
              name="name"
              label="Razão Social"
              rules={[{ required: true, message: "Razão social é obrigatória." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Descrição">
              <Input />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="contactEmail"
                  label="E-mail de contato"
                  rules={[{ required: true, message: "E-mail de contato é obrigatório." }]}
                >
                  <Input type="email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contactPhoneNumber"
                  label="Telefone"
                  rules={[{ required: true, message: "Telefone é obrigatória." }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="address" label="Endereço">
              <Input />
            </Form.Item>
            <Button loading={isUpdating} type="primary" htmlType="submit">
              Salvar alterações
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};
