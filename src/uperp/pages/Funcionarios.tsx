import { useState } from "react";
import { Card, Table, Button, Modal, Form, Input, Select, Switch, Tag, Space, Popconfirm, message, Avatar } from "antd";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "../store";
import type { Employee } from "../types";

export function Funcionarios() {
  const { employees, setEmployees } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  const onSave = (v: Omit<Employee, "id">) => {
    if (editing) {
      setEmployees(employees.map((e) => (e.id === editing.id ? { ...editing, ...v } : e)));
      message.success("Funcionário atualizado");
    } else {
      setEmployees([...employees, { ...v, id: Math.random().toString(36).slice(2) }]);
      message.success("Funcionário cadastrado");
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  return (
    <Card
      title="Funcionários"
      extra={
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Novo Funcionário
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={employees}
        pagination={{ pageSize: 8 }}
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
            title: "Status",
            dataIndex: "active",
            render: (a: boolean) => <Tag color={a ? "green" : "default"}>{a ? "Ativo" : "Inativo"}</Tag>,
          },
          {
            title: "Ações",
            width: 120,
            render: (_, e: Employee) => (
              <Space>
                <Button
                  size="small"
                  icon={<Pencil size={14} />}
                  onClick={() => {
                    setEditing(e);
                    form.setFieldsValue(e);
                    setOpen(true);
                  }}
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
      >
        <Form layout="vertical" form={form} onFinish={onSave} initialValues={{ active: true }}>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Cargo" rules={[{ required: true }]}>
            <Select
              options={["Gerente", "Vendedor(a)", "Caixa", "Estoquista", "Administrador"].map((v) => ({
                value: v,
                label: v,
              }))}
            />
          </Form.Item>
          <Form.Item name="email" label="E-mail">
            <Input />
          </Form.Item>
          <Form.Item name="active" label="Ativo" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
