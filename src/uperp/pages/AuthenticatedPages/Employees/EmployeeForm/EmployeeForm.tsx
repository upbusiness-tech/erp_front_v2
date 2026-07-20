import { EmployeeType } from "@/enums/employee.enum";
import { EmployeesPaths } from "@/routes/AuthenticatedRoutes/Employees/routes";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
} from "antd";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { mapModuleName, PermissionModules } from "./consts";
import { useEmployeeFormController } from "./useEmployeeForm.controller";

const { Text } = Typography;

export const EmployeeForm = ({ isEdit }: { isEdit?: boolean }) => {
  const { form, handleSubmit, groupedPermissions, navigate, isSubmitting } =
    useEmployeeFormController({ isEdit });

  return (
    <Card
      title={
        <Space>
          <Button
            type="text"
            icon={<ArrowLeft size={16} />}
            onClick={() => {
              navigate(EmployeesPaths.LIST);
            }}
          />
          {isEdit ? "Editar Funcionário" : "Novo Funcionário"}
        </Space>
      }
      extra={
        <Space>
          <Button type="primary" loading={isSubmitting} onClick={handleSubmit}>
            {isEdit ? "Atualizar" : "Cadastrar"} funcionário
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isActive: true, permissions: [] }}
      >
        <Tabs
          items={[
            {
              key: "dados",
              label: "Dados",
              children: (
                <>
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Nome"
                        rules={[{ required: true, message: "Nome é obrigatório." }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="password"
                        label="Senha"
                        help={
                          "Caso uma senha não seja informada, 1234 será estabelecida por padrão."
                        }
                      >
                        <Input.Password />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="type"
                        label="Cargo"
                        rules={[{ required: true, message: "Cargo é obrigatório." }]}
                      >
                        <Select
                          options={Object.values(EmployeeType).map((v) => ({
                            value: v.toString(),
                            label: v.toString(),
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="isActive" label="Ativo" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ),
            },
            {
              key: "perms",
              label: (
                <Space size={4}>
                  <ShieldCheck size={14} /> Permissões
                </Space>
              ),
              children: (
                <>
                  <Space
                    style={{
                      width: "100%",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text type="secondary">
                      Marque as ações que este funcionário poderá executar
                    </Text>
                    <Space>
                      <Button size="small">Marcar tudo</Button>
                      <Button size="small">Limpar</Button>
                    </Space>
                  </Space>
                  <Form.Item name="permissions" noStyle>
                    <Checkbox.Group
                      style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}
                    >
                      {Array.from(groupedPermissions.keys()).map((key) => (
                        <div key={key} style={{ marginBottom: 8 }}>
                          <Divider style={{ margin: "8px 0", fontSize: 16 }}>
                            <Text strong>
                              {" "}
                              {mapModuleName(key as PermissionModules).toUpperCase()}
                            </Text>
                          </Divider>
                          <Row gutter={[8, 8]}>
                            {Array.from(groupedPermissions.get(key)!).map((p) => (
                              <Col xs={24} sm={12} key={p.key}>
                                <Checkbox value={p.id} style={{ alignItems: "flex-start" }}>
                                  <div style={{ lineHeight: 1.3 }}>
                                    <div>
                                      <Text strong style={{ fontSize: 15 }}>
                                        {p.title}
                                      </Text>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {p.description}
                                    </Text>
                                  </div>
                                </Checkbox>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Card>
  );
};
