import { useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  InputNumber,
  Input,
  Statistic,
  Table,
  Tag,
  Typography,
  Space,
  Modal,
  Empty,
  message,
} from "antd";
import {
  Lock,
  LockOpen,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "../store";
import type { CashMovementType } from "../types";

const { Title, Text } = Typography;

interface Props {
  operatorName: string;
  onBack?: () => void;
}

export function Caixa({ operatorName, onBack }: Props) {
  const {
    cashOpen,
    cashSession,
    cashMovements,
    openCash,
    closeCash,
    addCashMovement,
  } = useStore();

  const [openForm] = Form.useForm<{ initialValue: number }>();
  const [movementModal, setMovementModal] = useState<CashMovementType | null>(null);
  const [movForm] = Form.useForm<{ value: number; note?: string }>();

  const stats = useMemo(() => {
    const sum = (t: CashMovementType) =>
      cashMovements.filter((m) => m.type === t).reduce((s, m) => s + m.value, 0);
    const entradas = sum("entrada");
    const vendas = sum("venda");
    const sangrias = sum("sangria");
    const reposicoes = sum("reposicao");
    const inicial = cashSession?.initialValue ?? 0;
    const saldo = inicial + entradas + vendas + reposicoes - sangrias;
    return { entradas, vendas, sangrias, reposicoes, inicial, saldo };
  }, [cashMovements, cashSession]);

  const handleOpen = (v: { initialValue: number }) => {
    openCash(v.initialValue || 0, operatorName);
    message.success("Caixa aberto com sucesso!");
    openForm.resetFields();
  };

  const handleClose = () => {
    let declared = stats.saldo;
    Modal.confirm({
      title: "Fechar caixa?",
      content: (
        <div>
          <Text type="secondary">Saldo estimado: R$ {stats.saldo.toFixed(2)}</Text>
          <div style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12 }}>Valor conferido em caixa (R$)</Text>
            <InputNumber
              defaultValue={stats.saldo}
              min={0}
              step={1}
              style={{ width: "100%", marginTop: 4 }}
              prefix="R$"
              onChange={(v) => { declared = v || 0; }}
            />
          </div>
        </div>
      ),
      okText: "Fechar caixa",
      cancelText: "Cancelar",
      onOk: () => {
        closeCash(declared);
        message.success("Caixa fechado.");
      },
    });
  };

  const handleMovement = (v: { value: number; note?: string }) => {
    if (!movementModal) return;
    addCashMovement({ type: movementModal, value: v.value, note: v.note });
    message.success("Movimentação registrada");
    setMovementModal(null);
    movForm.resetFields();
  };

  const movementLabels: Record<CashMovementType, string> = {
    entrada: "Entrada manual",
    sangria: "Sangria",
    reposicao: "Reposição",
    venda: "Venda",
  };

  if (!cashOpen) {
    return (
      <>
        {onBack && (
          <Button type="link" icon={<ArrowLeft size={14} />} onClick={onBack} style={{ paddingLeft: 0, marginBottom: 8 }}>
            Voltar
          </Button>
        )}
        <Row justify="center">
          <Col xs={24} md={14} lg={10}>
            <Card
              style={{ borderTop: "4px solid #DC2626" }}
              styles={{ body: { padding: 32 } }}
            >
              <Space direction="vertical" align="center" style={{ width: "100%", marginBottom: 16 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "#FEF2F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock color="#DC2626" size={32} />
                </div>
                <Title level={3} style={{ margin: 0 }}>Caixa Fechado</Title>
                <Text type="secondary">Informe o valor inicial para iniciar as operações.</Text>
              </Space>
              <Form layout="vertical" form={openForm} onFinish={handleOpen} initialValues={{ initialValue: 0 }}>
                <Form.Item
                  name="initialValue"
                  label="Valor inicial (R$)"
                  rules={[{ required: true, message: "Informe o valor inicial" }]}
                >
                  <InputNumber
                    min={0}
                    step={10}
                    size="large"
                    style={{ width: "100%" }}
                    prefix="R$"
                  />
                </Form.Item>
                <Form.Item label="Operador">
                  <Input value={operatorName} disabled size="large" />
                </Form.Item>
                <Button type="primary" size="large" htmlType="submit" block icon={<LockOpen size={16} />}>
                  Abrir Caixa
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      {onBack && (
        <Button type="link" icon={<ArrowLeft size={14} />} onClick={onBack} style={{ paddingLeft: 0, marginBottom: 8 }}>
          Voltar
        </Button>
      )}

      <Card
        style={{ marginBottom: 16, borderLeft: "4px solid #16A34A" }}
        styles={{ body: { padding: 16 } }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 12]}>
          <Col>
            <Space align="center">
              <LockOpen color="#16A34A" size={24} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Caixa Aberto</Text>
                <Title level={4} style={{ margin: 0 }}>
                  Operador: {cashSession?.operatorName}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Aberto em {cashSession ? new Date(cashSession.openedAt).toLocaleString("pt-BR") : "-"}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button danger icon={<Lock size={14} />} onClick={handleClose}>
              Fechar Caixa
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic title="Valor inicial" value={stats.inicial} precision={2} prefix={<Wallet size={16} />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Vendas"
              value={stats.vendas}
              precision={2}
              valueStyle={{ color: "#16A34A" }}
              prefix={<TrendingUp size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Entradas / Reposições"
              value={stats.entradas + stats.reposicoes}
              precision={2}
              valueStyle={{ color: "#2563EB" }}
              prefix={<ArrowDownCircle size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Sangrias"
              value={stats.sangrias}
              precision={2}
              valueStyle={{ color: "#DC2626" }}
              prefix={<TrendingDown size={16} />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16, background: "#FFF7ED", borderColor: "#FED7AA" }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Text type="secondary">Saldo estimado em caixa</Text>
            <Title level={2} style={{ margin: 0, color: "#F26B1F" }}>
              R$ {stats.saldo.toFixed(2)}
            </Title>
          </Col>
          <Col>
            <Space wrap>
              <Button icon={<ArrowDownCircle size={14} />} onClick={() => setMovementModal("entrada")}>
                Entrada
              </Button>
              <Button icon={<PlusCircle size={14} />} onClick={() => setMovementModal("reposicao")}>
                Reposição
              </Button>
              <Button icon={<ArrowUpCircle size={14} />} danger onClick={() => setMovementModal("sangria")}>
                Sangria
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="Movimentações do Caixa">
        {cashMovements.length === 0 ? (
          <Empty description="Nenhuma movimentação registrada" />
        ) : (
          <Table
            rowKey="id"
            dataSource={cashMovements}
            pagination={{ pageSize: 8 }}
            columns={[
              {
                title: "Horário",
                dataIndex: "at",
                width: 160,
                render: (v: string) => new Date(v).toLocaleString("pt-BR"),
              },
              {
                title: "Tipo",
                dataIndex: "type",
                width: 140,
                render: (t: CashMovementType) => {
                  const colors: Record<CashMovementType, string> = {
                    entrada: "blue",
                    venda: "green",
                    sangria: "red",
                    reposicao: "purple",
                  };
                  return <Tag color={colors[t]}>{movementLabels[t]}</Tag>;
                },
              },
              { title: "Observação", dataIndex: "note", render: (v?: string) => v || "-" },
              {
                title: "Valor",
                dataIndex: "value",
                width: 140,
                align: "right",
                render: (v: number, r) => (
                  <Text
                    strong
                    style={{
                      color: r.type === "sangria" ? "#DC2626" : "#16A34A",
                    }}
                  >
                    {r.type === "sangria" ? "-" : "+"} R$ {v.toFixed(2)}
                  </Text>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        open={movementModal !== null}
        title={movementModal ? movementLabels[movementModal] : ""}
        onCancel={() => {
          setMovementModal(null);
          movForm.resetFields();
        }}
        onOk={() => movForm.submit()}
        okText="Registrar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={movForm} onFinish={handleMovement}>
          <Form.Item name="value" label="Valor (R$)" rules={[{ required: true, message: "Informe o valor" }]}>
            <InputNumber min={0.01} step={1} style={{ width: "100%" }} prefix="R$" />
          </Form.Item>
          <Form.Item name="note" label="Observação">
            <Input.TextArea rows={2} placeholder="Ex: Troco / Pagamento de fornecedor" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
