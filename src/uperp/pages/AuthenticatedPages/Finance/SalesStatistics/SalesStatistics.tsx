import { PeriodSelector } from "@/application-components/PeriodSelector/PeriodSelector";
import { BarChart } from "@/application-components/charts/tremor/BarChart";
import { DonutChart } from "@/application-components/charts/tremor/DonutChart";
import { LineChart } from "@/application-components/charts/tremor/LineChart";
import { getColorClassName } from "@/application-components/charts/tremor/chartUtils";
import { StatCard } from "@/application-components/StatCard/StatCard";
import { Receipt, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { BRAND } from "@/theme/colors";
import { fmtBrl } from "@/uperp/common/util/sale.util";
import { Card, Col, Empty, Grid, Row, Skeleton } from "antd";
import { useSalesStatisticsController } from "./useSalesStatistics.controller";
import { SalesStatisticsTable } from "./SalesStatisticsTable";

const { useBreakpoint } = Grid;

const PAYMENT_DONUT_COLORS = ["success", "brand", "info", "warning"] as const;

export default function SalesStatistics() {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const {
    period,
    handlePeriodChange,
    statsLoading,
    statsFetching,
    summary,
    timeline,
    paymentBreakdown,
    weekdayRevenue,
    salesColumns,
  } = useSalesStatisticsController();

  const summaryCards = [
    {
      key: "grossRevenue",
      label: "Lucro bruto",
      value: fmtBrl.format(summary?.grossRevenue ?? 0),
      description: "Faturamento total do período",
      icon: <TrendingUp size={18} color={BRAND} />,
    },
    {
      key: "profitRevenue",
      label: "Lucro líquido",
      value: fmtBrl.format(summary?.profitRevenue ?? 0),
      description: "Receita menos custo e descontos",
      icon: <Wallet size={18} color={BRAND} />,
    },
    {
      key: "salesCount",
      label: "Nº de vendas",
      value: (summary?.salesCount ?? 0).toLocaleString("pt-BR"),
      description: "Vendas realizadas no período",
      icon: <ShoppingCart size={18} color={BRAND} />,
    },
    {
      key: "averageTicket",
      label: "Ticket médio",
      value: fmtBrl.format(summary?.averageTicket ?? 0),
      description: "Valor médio por venda",
      icon: <Receipt size={18} color={BRAND} />,
    },
  ];

  return (
    <div className="font-sans">
      <PeriodSelector period={period} onChange={handlePeriodChange} showRange />

      {/* Summary Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {summaryCards.map((card) => (
          <Col xs={12} md={6} key={card.key}>
            <Skeleton loading={statsLoading} active paragraph={{ rows: 1 }}>
              <div
                style={{
                  opacity: statsFetching ? 0.6 : 1,
                  transition: "opacity 0.2s",
                  height: "100%",
                }}
              >
                <StatCard
                  label={card.label}
                  value={card.value}
                  description={card.description}
                  icon={card.icon}
                />
              </div>
            </Skeleton>
          </Col>
        ))}
      </Row>

      {/* Revenue vs Profit Line Chart */}
      <Card title="Lucros" style={{ marginBottom: 24 }}>
        <div
          style={{
            opacity: statsFetching ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <Skeleton loading={statsLoading} active paragraph={{ rows: 6 }}>
            {timeline.length > 0 ? (
              <LineChart
                data={timeline.map((t) => ({
                  label: t.label,
                  "Lucro bruto": t.revenue,
                  "Lucro líquido": t.grossProfit,
                }))}
                index="label"
                categories={["Lucro bruto", "Lucro líquido"]}
                colors={["brand", "success"]}
                valueFormatter={(value) => fmtBrl.format(value)}
                yAxisWidth={90}
                className={isMobile ? "h-60" : "h-72"}
              />
            ) : (
              <Empty
                description="Nenhuma venda neste período"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Skeleton>
        </div>
      </Card>

      {/* Payment Method Donut and Weekday Revenue */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Formas de pagamento">
            <div
              style={{
                opacity: statsFetching ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <Skeleton loading={statsLoading} active paragraph={{ rows: 4 }}>
                {paymentBreakdown.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {paymentBreakdown.some((p) => p.amount > 0) ? (
                      <DonutChart
                        data={paymentBreakdown}
                        category="label"
                        value="amount"
                        colors={[...PAYMENT_DONUT_COLORS]}
                        variant="donut"
                        valueFormatter={(value) => fmtBrl.format(value)}
                        className={isMobile ? "h-52 w-52" : "h-60 w-60"}
                      />
                    ) : (
                      <Empty
                        description="Sem dados"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ marginBottom: 12 }}
                      />
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px 16px",
                        marginTop: 12,
                        justifyContent: "center",
                      }}
                    >
                      {paymentBreakdown.map((item, index) => (
                        <div
                          key={item.method}
                          style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                          <span
                            className={getColorClassName(
                              PAYMENT_DONUT_COLORS[index] ?? "gray",
                              "bg",
                            )}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 14, color: "#555" }}>{item.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>
                            {Math.round(item.percentage)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Skeleton>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Faturamento líquido por dia da semana">
            <div
              style={{
                opacity: statsFetching ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <Skeleton loading={statsLoading} active paragraph={{ rows: 4 }}>
                {weekdayRevenue.length > 0 ? (
                  <BarChart
                    data={weekdayRevenue.map((w) => ({
                      label: w.label,
                      "Faturamento líquido": w.revenue,
                    }))}
                    index="label"
                    categories={["Faturamento líquido"]}
                    colors={["brand"]}
                    valueFormatter={(value) => fmtBrl.format(value)}
                    yAxisWidth={90}
                    showLegend={false}
                    className={isMobile ? "h-56" : "h-64"}
                  />
                ) : (
                  <Empty description="Sem dados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Skeleton>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sales Table */}
      <SalesStatisticsTable from={period.from} to={period.to} salesColumns={salesColumns} />
    </div>
  );
}
