import { CashierPaths } from "@/routes/AuthenticatedRoutes/Cashier/routes";
import { useCashFlowStore } from "@/stores/cashFlow.store";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { ArrowRight, History, Lock, LockOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CLOSED_CASH_FLOW_COLOR, OPEN_CASH_FLOW_COLOR } from "./consts";
import { useEffect } from "react";

const { Title, Text } = Typography;

export const CashFlowStatus = () => {
  const { currentCashFlow, loadCurrentCashOpen } = useCashFlowStore();

  const isCashFlowOpen = !currentCashFlow?.isClosed;

  const navigate = useNavigate();

  const handleGoToCashFlow = () => {
    if (isCashFlowOpen) {
      navigate(CashierPaths.BASE);
    } else {
      navigate(CashierPaths.OPEN);
    }
  };

  useEffect(() => {
    const load = async () => {
      const result = await loadCurrentCashOpen();
      if (!result) navigate(CashierPaths.OPEN);
    };

    if (!currentCashFlow) load();
  }, [currentCashFlow, loadCurrentCashOpen]);

  return (
    <Card
      style={{
        marginBottom: 16,
        borderLeft: `4px solid ${isCashFlowOpen ? OPEN_CASH_FLOW_COLOR : CLOSED_CASH_FLOW_COLOR}`,
      }}
      styles={{ body: { padding: 16 } }}
    >
      <Row align="middle" justify="space-between" gutter={[12, 12]}>
        <Col>
          <Space>
            {isCashFlowOpen ? (
              <LockOpen color={OPEN_CASH_FLOW_COLOR} />
            ) : (
              <Lock color={CLOSED_CASH_FLOW_COLOR} />
            )}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Status do Caixa
              </Text>
              <Title level={4} style={{ margin: 0 }}>
                {isCashFlowOpen ? "Caixa Aberto" : "Caixa Fechado"}
              </Title>
            </div>
          </Space>
        </Col>
        <Col>
          <Space wrap>
            {isCashFlowOpen && (
              <Button
                icon={<History size={14} />}
                // onClick={() => setRecentOpen(true)}
              >
                Ver vendas recentes
              </Button>
            )}
            <Button
              type={isCashFlowOpen ? "default" : "primary"}
              danger={isCashFlowOpen}
              icon={<ArrowRight size={14} />}
              iconPosition="end"
              onClick={handleGoToCashFlow}
            >
              {isCashFlowOpen ? "Gerenciar Caixa" : "Abrir Caixa"}
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};
