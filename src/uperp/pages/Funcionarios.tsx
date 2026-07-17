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
  App,
  Avatar,
  Tabs,
  Checkbox,
  Row,
  Col,
  Typography,
  Divider,
  Descriptions,
  Empty,
} from "antd";
import { Plus, Pencil, Trash2, ShieldCheck, Eye, ArrowLeft } from "lucide-react";
import { useStore } from "../store";
import {
  PERMISSIONS,
  type Employee,
  type EmployeePermission,
  type PermissionDefinition,
} from "../types";

const { Text, Title } = Typography;

type Mode = "list" | "form";

export function Funcionarios() {
  const { employees, setEmployees } = useStore();
  const { message } = App.useApp();
  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [viewing, setViewing] = useState<Employee | null>(null);
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
    setMode("form");
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    form.setFieldsValue(e);
    setMode("form");
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
    setMode("list");
    setEditing(null);
    form.resetFields();
  };

  const toggleAll = (checked: boolean) => {
    form.setFieldValue("permissions", checked ? PERMISSIONS.map((p) => p.key) : []);
  };

  const permLabel = (k: EmployeePermission) =>
    PERMISSIONS.find((p) => p.key === k)?.label || k;

  if (mode === "form") {
    return (
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeft size={16} />}
              onClick={() => {
                setMode("list");
                setEditing(null);
              }}
            />
            {editing ? "Editar Funcionário" : "Novo Funcionário"}
          </Space>
        }
        extra={
          <Space>
            <Button
              onClick={() => {
                setMode("list");
                setEditing(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="primary" onClick={() => form.submit()}>
              Salvar
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onSave}
          initialValues={{ active: true, permissions: [] }}
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
                        <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="email" label="E-mail">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="role" label="Cargo" rules={[{ required: true }]}>
                          <Select
                            options={[
                              "Gerente",
                              "Vendedor(a)",
                              "Caixa",
                              "Estoquista",
                              "Administrador",
                            ].map((v) => ({ value: v, label: v }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="active" label="Ativo" valuePropName="checked">
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
                            <Divider style={{ margin: "8px 0", fontSize: 13 }}>
                              {group}
                            </Divider>
                            <Row gutter={[8, 8]}>
                              {perms.map((p) => (
                                <Col xs={24} sm={12} key={p.key}>
                                  <Checkbox
                                    value={p.key}
                                    style={{ alignItems: "flex-start" }}
                                  >
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
      </Card>
    );
  }

  return (
    <>
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
          scroll={{ x: 760 }}
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
            {
              title: "Cargo",
              dataIndex: "role",
              render: (r) => <Tag color="orange">{r}</Tag>,
            },
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
              render: (a: boolean) => (
                <Tag color={a ? "green" : "default"}>{a ? "Ativo" : "Inativo"}</Tag>
              ),
            },
            {
              title: "Ações",
              width: 150,
              render: (_, e: Employee) => (
                <Space>
                  <Button
                    size="small"
                    icon={<Eye size={14} />}
                    onClick={() => setViewing(e)}
                  />
                  <Button
                    size="small"
                    icon={<Pencil size={14} />}
                    onClick={() => openEdit(e)}
                  />
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
      </Card>

      <Modal
        open={viewing !== null}
        title={
          viewing ? (
            <Space>
              <Avatar style={{ background: "#F26B1F" }}>{viewing.name.charAt(0)}</Avatar>
              {viewing.name}
            </Space>
          ) : (
            ""
          )
        }
        onCancel={() => setViewing(null)}
        footer={
          viewing && (
            <Space>
              <Button onClick={() => setViewing(null)}>Fechar</Button>
              <Button
                type="primary"
                icon={<Pencil size={14} />}
                onClick={() => {
                  const e = viewing;
                  setViewing(null);
                  openEdit(e);
                }}
              >
                Editar
              </Button>
            </Space>
          )
        }
        width={640}
        destroyOnHidden
      >
        {viewing && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Cargo">
                <Tag color="orange">{viewing.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="E-mail">{viewing.email || "—"}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={viewing.active ? "green" : "default"}>
                  {viewing.active ? "Ativo" : "Inativo"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 16 }}>
              <Space size={6}>
                <ShieldCheck size={16} color="#F26B1F" /> Permissões
              </Space>
            </Title>
            {viewing.permissions?.length ? (
              <Space wrap size={[6, 6]}>
                {viewing.permissions.map((k) => (
                  <Tag key={k} color="blue">
                    {permLabel(k)}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhuma permissão atribuída"
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
}
