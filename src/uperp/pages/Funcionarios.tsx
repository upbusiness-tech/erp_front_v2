import { useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Space,
  Popconfirm,
  message,
  Avatar,
  Tabs,
  Checkbox,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { useStore } from "../store";
import { PERMISSIONS, type Employee, type EmployeePermission, type PermissionDefinition } from "../types";

const { Text } = Typography;

export function Funcionarios() {
  const { employees, setEmployees } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm<Omit<Employee, "id">>();

  const permissionGroups = useMemo(() => {
    const map = new Map<string, PermissionDefinition[]>();
    PERMISSIONS.forEach((p) => {
      const arr = map.get(p.group) || [];
      arr.push(p);
      map.set(p.group, arr);
    });
    return Array.from(map.entries());
  }, []);

  const openNew = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ active: true, permissions: [] });
    setOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    form.setFieldsValue(e);
    setOpen(true);
  };

  const onSave = (v: Omit<Employee, "id">) => {
    const payload = { ...v, permissions: v.permissions || [] };
    if (editing) {
      setEmployees(employees.map((e) => (e.id === editing.id ? { ...editing, ...payload } : e)));
      message.success("Funcionário atualizado");
    } else {
      setEmployees([...employees, { ...payload, id: Math.random().toString(36).slice(2) }]);
      message.success("Funcionário cadastrado");
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const toggleAll = (checked: boolean) => {
    form.setFieldValue(
      "permissions",
      checked ? PERMISSIONS.map((p) => p.key) : []
    );
  };

  return (
    <Card
      title="Funcionários"
      extra={
        <Button type="primary" icon={<Plus size={14} />} onClick={openNew}>
          Novo Funcionário
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={employees}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 720 }}
        columns={[
          {
            title: "Nome",
            dataIndex: "name",
            render: (n) => (
              <Space>
                <Avatar style={{ background: "#F26B1F" }}>{n.charAt(0)}</Avatar>
                {n}
              </Space>
            ),
          },
          { title: "Cargo", dataIndex: "role", render: (r) => <Tag color="orange">{r}</Tag> },
          { title: "E-mail", dataIndex: "email" },
          {
            title: "Permissões",
            dataIndex: "permissions",
            render: (perms: EmployeePermission[] = []) =>
              perms.length === PERMISSIONS.length ? (
                <Tag color="gold">Acesso total</Tag>
              ) : (
                <Tag color="blue">{perms.length} permissões</Tag>
              ),
          },
          {
            title: "Status",
            dataIndex: "active",
            render: (a: boolean) => <Tag color={a ? "green" : "default"}>{a ? "Ativo" : "Inativo"}</Tag>,
          },
          {
            title: "Ações",
            width: 120,
            render: (_, e: Employee) => (
              <Space>
                <Button size="small" icon={<Pencil size={14} />} onClick={() => openEdit(e)} />
                <Popconfirm
                  title="Remover funcionário?"
                  onConfirm={() => {
                    setEmployees(employees.filter((x) => x.id !== e.id));
                    message.success("Funcionário removido");
                  }}
                >
                  <Button size="small" danger icon={<Trash2 size={14} />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        title={editing ? "Editar Funcionário" : "Novo Funcionário"}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        width={680}
        destroyOnHidden
      >
        <Form layout="vertical" form={form} onFinish={onSave} initialValues={{ active: true, permissions: [] }}>
          <Tabs
            items={[
              {
                key: "dados",
                label: "Dados",
                children: (
                  <>
                    <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item name="role" label="Cargo" rules={[{ required: true }]}>
                          <Select
                            options={["Gerente", "Vendedor(a)", "Caixa", "Estoquista", "Administrador"].map((v) => ({
                              value: v,
                              label: v,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="email" label="E-mail">
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="active" label="Ativo" valuePropName="checked">
                      <Switch />
                    </Form.Item>
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
                      <Text type="secondary">Marque as ações que este funcionário poderá executar</Text>
                      <Space>
                        <Button size="small" onClick={() => toggleAll(true)}>
                          Marcar tudo
                        </Button>
                        <Button size="small" onClick={() => toggleAll(false)}>
                          Limpar
                        </Button>
                      </Space>
                    </Space>
                    <Form.Item name="permissions" noStyle>
                      <Checkbox.Group style={{ width: "100%" }}>
                        {permissionGroups.map(([group, perms]) => (
                          <div key={group} style={{ marginBottom: 8 }}>
                            <Divider orientation="left" style={{ margin: "8px 0", fontSize: 13 }}>
                              {group}
                            </Divider>
                            <Row gutter={[8, 8]}>
                              {perms.map((p) => (
                                <Col xs={24} sm={12} key={p.key}>
                                  <Checkbox value={p.key} style={{ alignItems: "flex-start" }}>
                                    <div style={{ lineHeight: 1.3 }}>
                                      <div>
                                        <Text strong style={{ fontSize: 13 }}>
                                          {p.label}
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
      </Modal>
    </Card>
  );
}
