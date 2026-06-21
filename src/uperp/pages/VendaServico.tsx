import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  List,
  Typography,
  Empty,
  Divider,
  message,
  Space,
} from "antd";
import { Briefcase, Trash2 } from "lucide-react";
import { useStore } from "../store";
import type { Sale } from "../types";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ServiceItem {
  id: string;
  description: string;
  employeeId: string;
  employeeName: string;
  price: number;
}

export function VendaServico() {
  const { employees, addSale } = useStore();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [form] = Form.useForm();

  const subtotal = items.reduce((s, i) => s + i.price, 0);

  const onAdd = (v: { description: string; employeeId: string; price: number }) => {
    const emp = employees.find((e) => e.id === v.employeeId);
    setItems((arr) => [
      ...arr,
      {
        id: Math.random().toString(36).slice(2),
        description: v.description,
        employeeId: v.employeeId,
        employeeName: emp?.name || "—",
        price: v.price,
      },
    ]);
    form.resetFields();
    message.success("Serviço adicionado à comanda");
  };

  const finalize = () => {
    if (items.length === 0) return message.warning("Adicione ao menos um serviço.");
    const sale: Sale = {
      id: `S${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toISOString().slice(0, 10),
      total: subtotal,
      items: items.length,
      type: "servico",
    };
    addSale(sale);
    setItems([]);
    message.success(`Serviço ${sale.id} finalizado! Total R$ ${subtotal.toFixed(2)}`);
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={14}>
        <Card title={<Space><Briefcase size={18} /> Novo Serviço</Space>}>
          <Form layout="vertical" form={form} onFinish={onAdd}>
            <Form.Item name="description" label="Descrição do serviço" rules={[{ required: true }]}>
              <TextArea rows={3} placeholder="Ex: Ajuste de barra de calça, reparo, instalação..." />
            </Form.Item>
            <Row gutter={12}>
              <Col span={14}>
                <Form.Item name="employeeId" label="Funcionário responsável" rules={[{ required: true }]}>
                  <Select
                    placeholder="Selecione"
                    options={employees
                      .filter((e) => e.active)
                      .map((e) => ({ value: e.id, label: `${e.name} (${e.role})` }))}
                  />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name="price" label="Valor (R$)" rules={[{ required: true }]}>
                  <InputNumber min={0} step={10} style={{ width: "100%" }} placeholder="0,00" />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" block>
              Adicionar à Comanda
            </Button>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title="Comanda de Serviços">
          {items.length === 0 ? (
            <Empty description="Nenhum serviço" />
          ) : (
            <List
              dataSource={items}
              renderItem={(it) => (
                <List.Item
                  actions={[
                    <Button
                      key="d"
                      size="small"
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
                      onClick={() => setItems((a) => a.filter((x) => x.id !== it.id))}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={it.description}
                    description={`Resp.: ${it.employeeName} • R$ ${it.price.toFixed(2)}`}
                  />
                </List.Item>
              )}
            />
          )}
          <Divider style={{ margin: "12px 0" }} />
          <Row justify="space-between">
            <Title level={4} style={{ margin: 0 }}>Total</Title>
            <Title level={4} style={{ margin: 0, color: "#F26B1F" }}>
              R$ {subtotal.toFixed(2)}
            </Title>
          </Row>
          <Button type="primary" block size="large" style={{ marginTop: 12 }} onClick={finalize}>
            Finalizar Serviço
          </Button>
        </Card>
      </Col>
    </Row>
  );
}
