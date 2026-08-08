import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { TransactionOrigin } from "@/enums/cashFlow.enum";
import {
  calculeCashFlowEstimetedAmount,
  calculeCashFlowTransactionAmount,
} from "@/uperp/common/cashFlowFormulas";
import { formatIsoDateIntoDateTimeString } from "@/uperp/common/dates";
import { Button, Card, Col, Row, Space, Statistic, Typography } from "antd";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  LockOpen,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { useStore } from "../../../../store";
import type { CashMovementType } from "../../../../types";
import { CashFlowTransactionModal } from "./CashFlowTransactionModal/CashFlowTransactionModal";
import { CloseCashFlowModal } from "./CloseCashFlowModal/CloseCashFlowModal";
import { useCashFlowViewController } from "./useCashFlowView.controller";
import { formatPrice } from "@/uperp/common/productFormulas";

const { Title, Text } = Typography;

export const CashFlowView = () => {
  const {
    currentCashFlow,
    handleOpenModal,
    handleCloseModal,
    openTransactionModal,
    currentModalTransaction,
    replacementData,
    sangriasData,
    salesData,
    transactions,
    cashFlowTransactionsTableColumns,
    total,
    isLoading,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleCloseCashModal,
    openCloseCashFlowModal,
    setOpenCloseCashFlowModal,
    generalTotal,
  } = useCashFlowViewController();

  return (
    <>
      {/* {onBack && (
        <Button
          type="link"
          icon={<ArrowLeft size={14} />}
          onClick={onBack}
          style={{ paddingLeft: 0, marginBottom: 8 }}
        >
          Voltar
        </Button>
      )} */}

      <CloseCashFlowModal
        isOpen={openCloseCashFlowModal}
        onClose={() => setOpenCloseCashFlowModal(false)}
      />

      <Card
        style={{ marginBottom: 16, borderLeft: "4px solid #16A34A" }}
        styles={{ body: { padding: 16 } }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 12]}>
          <Col>
            <Space align="center">
              <LockOpen color="#16A34A" size={24} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Caixa Aberto
                </Text>
                <Title level={4} style={{ margin: 0 }}>
                  Operador: {currentCashFlow?.openedByUser.employee.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Aberto em {formatIsoDateIntoDateTimeString(currentCashFlow?.createdAt || "")}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button danger icon={<Lock size={14} />} onClick={handleCloseCashModal}>
              Fechar Caixa
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Valor inicial"
              value={currentCashFlow?.initialBalance}
              precision={2}
              prefix={<Wallet size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Vendas"
              value={salesData?.amount}
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
              value={replacementData?.amount}
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
              value={sangriasData?.amount}
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
              {formatPrice(
                calculeCashFlowEstimetedAmount(
                  Number(sangriasData?.amount ?? []),
                  Number(replacementData?.amount ?? []),
                  Number(salesData?.amount ?? []),
                  Number(currentCashFlow?.initialBalance ?? []),
                ).toFixed(2),
              )}
            </Title>
          </Col>
          <Col>
            <Space wrap>
              <Button
                icon={<PlusCircle size={14} />}
                onClick={() => handleOpenModal(TransactionOrigin.REPLACEMENT)}
              >
                Reposição
              </Button>
              <Button
                icon={<ArrowUpCircle size={14} />}
                danger
                onClick={() => handleOpenModal(TransactionOrigin.SANGRIA)}
              >
                Sangria
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="Movimentações do Caixa">
        <GenericTable
          columns={cashFlowTransactionsTableColumns}
          data={transactions}
          total={total}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </Card>

      <CashFlowTransactionModal
        isOpen={openTransactionModal}
        onClose={handleCloseModal}
        type={currentModalTransaction}
      />
    </>
  );
};
