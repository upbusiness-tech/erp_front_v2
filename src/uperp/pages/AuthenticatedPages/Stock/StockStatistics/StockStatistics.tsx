import { PeriodSelector } from "@/application-components/PeriodSelector/PeriodSelector";
import { StatCard } from "@/application-components/StatCard/StatCard";
import { BarList } from "@/application-components/charts/tremor/BarList";
import { DonutChart } from "@/application-components/charts/tremor/DonutChart";
import { getColorClassName } from "@/application-components/charts/tremor/chartUtils";
import { DANGER } from "@/theme/colors";
import { extractStockFormatByUnit } from "@/uperp/common/formulas/productFormulas";
import { Card, Col, Divider, Empty, Grid, Modal, Row, Segmented, Skeleton } from "antd";
import { useStockStatisticsController } from "./useStockStatistics.controller";

const { useBreakpoint } = Grid;

const fmtIntLegend = new Intl.NumberFormat("pt-BR");

export default function StockStatistics() {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const {
    period,
    handlePeriodChange,
    salesLimit,
    setSalesLimit,
    compositionLimit,
    setCompositionLimit,
    overviewLoading,
    overviewFetching,
    mostSoldLoading,
    leastSoldLoading,
    isRankingsFetching,
    categoryChartData,
    categoryColors,
    highestStock,
    highestStockVariations,
    mostSoldData,
    leastSoldData,
    flowCards,
    healthCards,
    healthModalKey,
    healthModalOpen,
    openHealthModal,
    closeHealthModal,
  } = useStockStatisticsController();

  return (
    <div className="font-sans">
      <PeriodSelector period={period} onChange={handlePeriodChange} showRange />

      {/* Flow Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {flowCards.map((card) => (
          <Col xs={12} md={6} key={card.key}>
            <Skeleton loading={overviewLoading} active paragraph={{ rows: 1 }}>
              <div
                style={{
                  opacity: overviewFetching ? 0.6 : 1,
                  transition: "opacity 0.2s",
                  height: "100%",
                }}
              >
                <StatCard
                  label={card.label}
                  value={
                    card.danger ? <span style={{ color: DANGER }}>{card.value}</span> : card.value
                  }
                  description={card.description}
                  icon={card.icon}
                />
              </div>
            </Skeleton>
          </Col>
        ))}
      </Row>

      {/* Sales Rankings */}
      <Card
        title="Rankings de vendas"
        extra={
          <Segmented
            value={salesLimit}
            onChange={(value) => setSalesLimit(value as number)}
            options={[
              { label: "5", value: 5 },
              { label: "10", value: 10 },
              { label: "15", value: 15 },
            ]}
          />
        }
        style={{ marginBottom: 24 }}
      >
        <div
          style={{
            opacity: isRankingsFetching ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Skeleton loading={mostSoldLoading} active paragraph={{ rows: 5 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#111418", marginBottom: 12 }}>
                  Mais vendidos
                </h4>
                {mostSoldData && mostSoldData.length > 0 ? (
                  <BarList
                    data={mostSoldData.map((item) => ({
                      name: item.name,
                      unit: item.unit,
                      value: item.quantity,
                    }))}
                    valueFormatter={(value, item) => extractStockFormatByUnit(item.unit, value)}
                    color="success"
                    sortOrder="descending"
                  />
                ) : (
                  <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Skeleton>
            </Col>
            <Col xs={24} md={12}>
              <Skeleton loading={leastSoldLoading} active paragraph={{ rows: 5 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#111418", marginBottom: 12 }}>
                  Menos vendidos
                </h4>
                {leastSoldData && leastSoldData.length > 0 ? (
                  <BarList
                    data={leastSoldData.map((item) => ({
                      name: item.name,
                      unit: item.unit,
                      value: item.quantity,
                    }))}
                    valueFormatter={(value, item) => extractStockFormatByUnit(item.unit, value)}
                    color="warning"
                    sortOrder="ascending"
                  />
                ) : (
                  <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Skeleton>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Stock Health Snapshot */}
      <Card
        title="Saúde do estoque"
        extra={
          <span style={{ fontSize: 14, fontWeight: "bolder", color: "#999" }}>Dados atuais</span>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          {healthCards.map((card) => (
            <Col xs={24} sm={12} lg={6} key={card.key}>
              <div
                style={{
                  opacity: overviewFetching ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <StatCard
                  label={card.label}
                  value={card.value}
                  description={card.description}
                  icon={card.icon}
                  onClick={() => openHealthModal(card.label)}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Stock Composition Snapshot */}
      <Card
        title="Composição do estoque"
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 14, fontWeight: "bolder", color: "#999" }}>Dados atuais</span>
            <Segmented
              value={compositionLimit}
              onChange={(value) => setCompositionLimit(value as number)}
              options={[
                { label: "5", value: 5 },
                { label: "10", value: 10 },
                { label: "15", value: 15 },
              ]}
            />
          </div>
        }
      >
        <div
          style={{
            opacity: overviewFetching ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {/* Top bar lists inline */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Skeleton loading={overviewLoading} active paragraph={{ rows: 5 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#111418", marginBottom: 12 }}>
                  Maior estoque de produtos
                </h4>
                {highestStock.length > 0 ? (
                  <BarList
                    data={highestStock.map((item) => ({
                      name: item.name,
                      unit: item.unit,
                      value: item.quantity,
                    }))}
                    valueFormatter={(value, item) => extractStockFormatByUnit(item.unit, value)}
                    color="info"
                    sortOrder="descending"
                  />
                ) : (
                  <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Skeleton>
            </Col>
            <Col xs={24} lg={12}>
              <Skeleton loading={overviewLoading} active paragraph={{ rows: 5 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#111418", marginBottom: 12 }}>
                  Maior estoque de variações
                </h4>
                {highestStockVariations.length > 0 ? (
                  <BarList
                    data={highestStockVariations.map((item) => ({
                      name: item.name,
                      unit: item.unit,
                      value: item.quantity,
                    }))}
                    valueFormatter={(value, item) => extractStockFormatByUnit(item.unit, value)}
                    color="brand"
                    sortOrder="descending"
                  />
                ) : (
                  <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Skeleton>
            </Col>
          </Row>

          <Divider />

          {/* Category donut below */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            <Col xs={24}>
              <Skeleton loading={overviewLoading} active paragraph={{ rows: 4 }}>
                <h4
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111418",
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  Distribuição por categoria
                </h4>
                {categoryChartData.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <DonutChart
                        data={categoryChartData}
                        category="name"
                        value="value"
                        colors={[...categoryColors]}
                        variant="donut"
                        valueFormatter={(value) => `${value} un.`}
                        className={isMobile ? "h-52 w-52" : "h-60 w-60"}
                      />
                    </div>
                    {/* Legend */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px 16px",
                        marginTop: 16,
                        justifyContent: "center",
                      }}
                    >
                      {categoryChartData.map((item, index) => (
                        <div
                          key={item.name}
                          style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <span
                            className={getColorClassName(categoryColors[index] ?? "gray", "bg")}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 14, color: "#555" }}>{item.name}</span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>
                            {fmtIntLegend.format(item.value)} un.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Skeleton>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Health Modal */}
      <Modal
        title={healthModalKey}
        open={healthModalOpen}
        onCancel={closeHealthModal}
        footer={null}
      >
        <Empty description="Em desenvolvimento..." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Modal>
    </div>
  );
}
