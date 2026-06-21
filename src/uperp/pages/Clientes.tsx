import { useState } from "react";
import { Card, Table, Button, Modal, Form, Input, Switch, Tag, Space, message, Popconfirm } from "antd";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { useStore } from "../store";
import type { Customer } from "../types";

export function Clientes() {
  const { customers, setCustomers } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const onSave = (v: Omit<Customer, "id">) => {
    if (editing) {
      setCustomers(customers.map((c) => (c.id === editing.id ? { ...editing, ...v } : c)));
      message.success("Cliente atualizado");
    } else {
      setCustomers([...customers, { ...v, id: Math.random().toString(36).slice(2) }]);
      message.success("Cliente cadastrado");
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
  };

  return (
    <Card
      title="Clientes"
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
          Novo Cliente
        </Button>
      }
    >
      <Table
        rowKey="id"
        dataSource={customers}
        pagination={{ pageSize: 8 }}
        columns={[
          {
            title: "Nome",
            dataIndex: "name",
            render: (n, c: Customer) => (
              <Space>
                {n}
                {c.loyalty && (
                  <Tag color="orange" icon={<Star size={11} style={{ marginRight: 2 }} />}>
                    Fidelidade
                  </Tag>
                )}
              </Space>
            ),
          },
          { title: "E-mail", dataIndex: "email" },
          { title: "Telefone", dataIndex: "phone" },
          { title: "Documento", dataIndex: "document" },
          {
            title: "Ações",
            width: 120,
            render: (_, c: Customer) => (
              <Space>
                <Button
                  size="small"
                  icon={<Pencil size={14} />}
                  onClick={() => {
                    setEditing(c);
                    form.setFieldsValue(c);
                    setOpen(true);
                  }}
                />
                <Popconfirm
                  title="Remover cliente?"
                  onConfirm={() => {
                    setCustomers(customers.filter((x) => x.id !== c.id));
                    message.success("Cliente removido");
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
        title={editing ? "Editar Cliente" : "Novo Cliente"}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form} onFinish={onSave} initialValues={{ loyalty: false }}>
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="E-mail">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefone">
            <Input />
          </Form.Item>
          <Form.Item name="document" label="CPF/CNPJ">
            <Input />
          </Form.Item>
          <Form.Item name="loyalty" label="Preços especiais / Fidelidade" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
