import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { InvoiceModel } from "@/model/invoice.model";
import { Button, Card, Col, Row, Tag, Typography, message } from "antd";
import { Sparkles } from "lucide-react";
import { PaymentProofModal } from "./components/PaymentProofModal/PaymentProofModal";
import { useInvoiceViewController } from "./useInvoiceView.controller";

const { Title, Text } = Typography;

export function InvoiceView() {
  const {
    plans,
    currentCompany,
    invoices,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    tableColumns,
    selectedInvoice,
    closePaymentProofModal,
  } = useInvoiceViewController();

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {plans.map((p) => {
          const current = p.id === currentCompany?.planId;
          return (
            <Col xs={24} md={8} key={p.name}>
              <Card
                style={{
                  border: current ? "2px solid #F26B1F" : undefined,
                  height: "100%",
                }}
              >
                {current && (
                  <Tag color="orange" style={{ marginBottom: 8 }}>
                    Plano atual
                  </Tag>
                )}
                <Title level={4} style={{ margin: 0 }}>
                  <Sparkles
                    size={16}
                    style={{ marginRight: 6, verticalAlign: -2, color: "#F26B1F" }}
                  />
                  {p.name}
                </Title>
                <div style={{ margin: "12px 0" }}>
                  <Text style={{ fontSize: 28, fontWeight: 700, color: "#F26B1F" }}>
                    R$ {Number(p.price).toFixed(2)}
                  </Text>
                  <Text type="secondary"> /mês</Text>
                </div>
                <Button
                  type={current ? "default" : "primary"}
                  block
                  style={{ marginTop: 16 }}
                  disabled={current}
                  onClick={() => message.info(`Para mudar de plano, contate o suporte.`)}
                >
                  {current ? "Plano Atual" : "Selecionar"}
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card title="Faturas e Mensalidades">
        <GenericTable<InvoiceModel>
          data={invoices}
          columns={tableColumns}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {selectedInvoice && (
          <PaymentProofModal invoice={selectedInvoice} onClose={closePaymentProofModal} />
        )}
      </Card>
    </>
  );
}
