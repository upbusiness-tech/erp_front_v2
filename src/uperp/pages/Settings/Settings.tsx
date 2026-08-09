import { Card, Row, Col, Switch, Typography, Space, Divider } from "antd";
import { Palette } from "lucide-react";
import { useSettingsController } from "./useSettings.controller";

const { Title, Text } = Typography;

export function Settings() {
  const { groupedSettings, isLoading, handleToggle, darkSidebar, handleDarkSidebarToggle } =
    useSettingsController();

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        {groupedSettings.map((group, idx) => (
          <Card
            key={group.module}
            title={group.title}
            loading={isLoading}
            style={{ marginBottom: idx === groupedSettings.length - 1 ? 0 : 16 }}
          >
            {group.items.map((item, i) => (
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
                          {item.description}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.key}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Switch
                      checked={item.value}
                      loading={isLoading}
                      onChange={() => handleToggle(item.id)}
                    />
                  </Col>
                </Row>
                {i < group.items.length - 1 && <Divider style={{ margin: "16px 0" }} />}
              </div>
            ))}
          </Card>
        ))}

        <Card title="Aparência" style={{ marginTop: 16 }}>
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
                  <Palette size={18} color="#F26B1F" />
                </div>
                <div>
                  <Text strong style={{ display: "block" }}>
                    Menu lateral escuro
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Alterna entre o tema escuro e claro do menu lateral.
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Switch checked={darkSidebar} onChange={handleDarkSidebarToggle} />
            </Col>
          </Row>
        </Card>
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
