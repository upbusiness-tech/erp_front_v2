import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { SubscriptionModel } from "@/model/subscription.model";
import { BRAND } from "@/theme/colors";
import { Button, Card, Col, Row, Tag, Typography, message } from "antd";
import { Sparkles } from "lucide-react";
import { PaymentModal } from "./components/PaymentModal/PaymentModal";
import { useSubscriptionViewController } from "./useSubscriptionView.controller";

const { Title, Text } = Typography;

export function SubscriptionView() {
  const {
    currentCompany,
    subscriptions,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    tableColumns,
    selectedSubscription,
    closePaymentModal,
    openPaymentModal,
  } = useSubscriptionViewController();

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card
            style={{
              border: `2px solid ${BRAND}`,
              height: "100%",
            }}
          >
            <Tag color="orange" style={{ marginBottom: 8 }}>
              Plano atual
            </Tag>
            <Title level={4} style={{ margin: 0 }}>
              <Sparkles size={16} style={{ marginRight: 6, verticalAlign: -2, color: BRAND }} />
              {currentCompany?.planName}
            </Title>
            <div style={{ margin: "12px 0" }}>
              <Text style={{ fontSize: 28, fontWeight: 700, color: BRAND }}>
                R$ {Number(currentCompany?.planPrice).toFixed(2)}
              </Text>
              <Text type="secondary"> /mês</Text>
            </div>
            <Button
              type={"default"}
              block
              style={{ marginTop: 16 }}
              disabled={true}
              onClick={() => message.info(`Para mudar de plano, contate o suporte.`)}
            >
              Plano Atual
            </Button>
          </Card>
        </Col>
      </Row>

      <Card title="Faturas">
        <GenericTable<SubscriptionModel>
          data={subscriptions}
          columns={tableColumns}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowClick={openPaymentModal}
        />

        {selectedSubscription && (
          <PaymentModal subscription={selectedSubscription} onClose={closePaymentModal} />
        )}
      </Card>
    </>
  );
}
