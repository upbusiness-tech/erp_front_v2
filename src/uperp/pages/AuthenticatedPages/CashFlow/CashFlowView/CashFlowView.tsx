import { GenericTable } from "@/application-components/GenericTable/GenericTable";
import { TransactionOrigin } from "@/enums/cashFlow.enum";
import { formatDateFromApi } from "@/uperp/common/dates";
import { calculeCashFlowEstimetedAmount } from "@/uperp/common/formulas/cashFlowFormulas";
import { formatPrice } from "@/uperp/common/formulas/productFormulas";
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
import { CashFlowTransactionModal } from "./CashFlowTransactionModal/CashFlowTransactionModal";
import { BRAND, BRAND_SOFT, BRAND_BORDER, DANGER, INFO, SUCCESS } from "@/theme/colors";
import { CloseCashFlowModal } from "./CloseCashFlowModal/CloseCashFlowModal";
import { useCashFlowViewController } from "./useCashFlowView.controller";

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
    canCloseCashFlow,
    canCreateTransaction,
  } = useCashFlowViewController();

  return (
    <>
      <CloseCashFlowModal
        cashBreakdown={{
          initialBalance: currentCashFlow?.initialBalance ?? 0,
          replacement: replacementData?.amount ?? 0,
          sales: salesData?.amount ?? 0,
          sagrias: sangriasData?.amount ?? 0,
        }}
        isOpen={openCloseCashFlowModal}
        onClose={() => setOpenCloseCashFlowModal(false)}
      />

      <Card
        style={{ marginBottom: 16, borderLeft: `4px solid ${SUCCESS}` }}
        styles={{ body: { padding: 16 } }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 12]}>
          <Col>
            <Space align="center">
              <LockOpen color={SUCCESS} size={24} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Caixa Aberto
                </Text>
                <Title level={4} style={{ margin: 0 }}>
                  Operador: {currentCashFlow?.openedByUser.employee.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Aberto em {formatDateFromApi(currentCashFlow?.createdAt || "")}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              disabled={!canCloseCashFlow}
              danger
              icon={<Lock size={14} />}
              onClick={handleCloseCashModal}
            >
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
              value={formatPrice(currentCashFlow?.initialBalance ?? 0)}
              precision={2}
              prefix={<Wallet size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Vendas"
              value={formatPrice(salesData?.amount ?? 0)}
              precision={2}
              valueStyle={{ color: SUCCESS }}
              prefix={<TrendingUp size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Reposições"
              value={formatPrice(replacementData?.amount ?? 0)}
              precision={2}
              valueStyle={{ color: INFO }}
              prefix={<ArrowDownCircle size={16} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="Sangrias"
              value={formatPrice(sangriasData?.amount ?? 0)}
              precision={2}
              valueStyle={{ color: DANGER }}
              prefix={<TrendingDown size={16} />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16, background: BRAND_SOFT, borderColor: BRAND_BORDER }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Text type="secondary">Saldo estimado</Text>
            <Title level={2} style={{ margin: 0, color: BRAND }}>
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
                disabled={!canCreateTransaction}
                icon={<PlusCircle size={14} />}
                onClick={() => handleOpenModal(TransactionOrigin.REPLACEMENT)}
              >
                Reposição
              </Button>
              <Button
                disabled={!canCreateTransaction}
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
