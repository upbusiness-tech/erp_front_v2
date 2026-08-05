import { Card, Row, Col, Switch, Typography, Space, Divider, message } from "antd";
import {
  FileText,
  Printer,
  UserCheck,
  AlertTriangle,
  Percent,
  LockOpen,
  Palette,
} from "lucide-react";
import { useStore } from "../store";
import type { AppSettings } from "../types";

const { Title, Text } = Typography;

interface Item {
  key: keyof AppSettings;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Vendas",
    items: [
      {
        key: "productObservations",
        title: "Adicionar observações aos produtos",
        description: "Permite anexar uma observação ao incluir um item na comanda.",
        icon: <FileText size={18} color="#F26B1F" />,
      },
      {
        key: "printReceipt",
        title: "Imprimir cupom fiscal ao finalizar vendas",
        description: "Envia o comprovante para a impressora térmica automaticamente.",
        icon: <Printer size={18} color="#F26B1F" />,
      },
      {
        key: "requireCustomerOnSale",
        title: "Exigir cliente na venda",
        description: "Bloqueia a finalização da venda sem cliente vinculado.",
        icon: <UserCheck size={18} color="#F26B1F" />,
      },
      {
        key: "askDiscountReason",
        title: "Solicitar motivo do desconto",
        description: "Exibe um campo obrigatório de justificativa ao aplicar desconto.",
        icon: <Percent size={18} color="#F26B1F" />,
      },
    ],
  },
  {
    title: "Estoque & Operação",
    items: [
      {
        key: "lowStockAlerts",
        title: "Alertas de estoque baixo",
        description: "Mostra avisos quando produtos atingirem o nível crítico.",
        icon: <AlertTriangle size={18} color="#F26B1F" />,
      },
      {
        key: "autoOpenCashOnLogin",
        title: "Abrir caixa automaticamente no login",
        description: "Direciona o operador para a abertura do caixa ao entrar.",
        icon: <LockOpen size={18} color="#F26B1F" />,
      },
    ],
  },
  {
    title: "Aparência",
    items: [
      {
        key: "darkSidebar",
        title: "Menu lateral escuro",
        description: "Alterna entre o tema escuro e claro do menu lateral.",
        icon: <Palette size={18} color="#F26B1F" />,
      },
    ],
  },
];

export function Configuracoes() {
  const { settings, updateSetting } = useStore();

  const toggle = (key: keyof AppSettings, value: boolean) => {
    updateSetting(key, value);
    message.success("Preferência atualizada");
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        {groups.map((g, idx) => (
          <Card
            key={g.title}
            title={g.title}
            style={{ marginBottom: idx === groups.length - 1 ? 0 : 16 }}
          >
            {g.items.map((item, i) => (
              <div key={item.key}>
                <Row align="middle" justify="space-between" gutter={16}>
                  <Col flex="auto">
                    <Space align="start">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: "#FFF7ED",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <Text strong style={{ display: "block" }}>
                          {item.title}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.description}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Switch checked={settings[item.key]} onChange={(v) => toggle(item.key, v)} />
                  </Col>
                </Row>
                {i < g.items.length - 1 && <Divider style={{ margin: "16px 0" }} />}
              </div>
            ))}
          </Card>
        ))}
      </Col>
      <Col xs={24} lg={8}>
        <Card>
          <Title level={5} style={{ marginTop: 0 }}>
            Sobre as preferências
          </Title>
          <Text type="secondary">
            As configurações abaixo afetam o comportamento do sistema para todos os operadores da
            loja. As alterações são aplicadas imediatamente nas próximas operações.
          </Text>
          <Divider />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Precisa de mais opções? Entre em contato com o suporte para personalizações avançadas do
            seu plano.
          </Text>
        </Card>
      </Col>
    </Row>
  );
}
