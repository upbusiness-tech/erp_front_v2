import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  PackageX,
  Scale,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useDashboardPeriod } from "@/hooks/useDashboardPeriod";
import { useStockOverview } from "@/hooks/useStockOverview";
import { useStockSalesRanking } from "@/hooks/useStockSalesRanking";
import { BRAND } from "@/theme/colors";
import { EOrder } from "@/types/statistics";
import { message } from "antd";
import { useEffect, useMemo, useState } from "react";

export function useStockStatisticsController() {
  const { period, handlePeriodChange } = useDashboardPeriod();
  const [salesLimit, setSalesLimit] = useState(5);
  const [compositionLimit, setCompositionLimit] = useState(5);

  const {
    data: overviewData,
    isLoading: overviewLoading,
    isFetching: overviewFetching,
    isError: overviewError,
  } = useStockOverview({
    from: period.from,
    to: period.to,
    limit: compositionLimit,
  });

  const {
    data: mostSoldData,
    isLoading: mostSoldLoading,
    isFetching: mostSoldFetching,
    isError: mostSoldError,
  } = useStockSalesRanking({
    from: period.from,
    to: period.to,
    limit: salesLimit,
    order: EOrder.DESC,
  });

  const {
    data: leastSoldData,
    isLoading: leastSoldLoading,
    isFetching: leastSoldFetching,
    isError: leastSoldError,
  } = useStockSalesRanking({
    from: period.from,
    to: period.to,
    limit: salesLimit,
    order: EOrder.ASC,
  });

  useEffect(() => {
    if (overviewError) {
      message.error("Erro ao carregar dados de estoque");
    }
  }, [overviewError]);

  useEffect(() => {
    if (mostSoldError || leastSoldError) {
      message.error("Erro ao carregar rankings de vendas");
    }
  }, [mostSoldError, leastSoldError]);

  const flow = overviewData?.flow;
  const health = overviewData?.health;
  const highestStock = overviewData?.highestStock ?? [];
  const highestStockVariations = overviewData?.highestStockVariations ?? [];

  // Group categories: top 5 by quantity + "Outros"
  const categoryChartData = useMemo(() => {
    const sorted = [...(overviewData?.categoryDistribution ?? [])].sort(
      (a, b) => b.quantity - a.quantity,
    );
    if (sorted.length <= 5) {
      return sorted.map((c) => ({ name: c.name, value: c.quantity }));
    }
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);
    const othersTotal = others.reduce((sum, c) => sum + c.quantity, 0);
    return [
      ...top5.map((c) => ({ name: c.name, value: c.quantity })),
      { name: "Outros", value: othersTotal },
    ];
  }, [overviewData?.categoryDistribution]);

  const categoryColors = ["brand", "success", "info", "warning", "danger", "gray"] as const;

  const isRankingsFetching = mostSoldFetching || leastSoldFetching;

  // Health modal state
  const [healthModalKey, setHealthModalKey] = useState<string | null>(null);
  const healthModalOpen = healthModalKey !== null;

  const openHealthModal = (key: string) => setHealthModalKey(key);
  const closeHealthModal = () => setHealthModalKey(null);

  const fmtInt = new Intl.NumberFormat("pt-BR");

  // Flow cards
  const flowCards = [
    {
      key: "entries",
      label: "Entradas",
      value: fmtInt.format(flow?.entries ?? 0),
      description: flow?.entriesSubtitle,
      icon: <ArrowDownToLine size={18} color={BRAND} />,
    },
    {
      key: "exits",
      label: "Saídas",
      value: fmtInt.format(flow?.exits ?? 0),
      description: flow?.exitsSubtitle,
      icon: <ArrowUpFromLine size={18} color={BRAND} />,
    },
    {
      key: "movedUnits",
      label: "Unidades movimentadas",
      value: fmtInt.format(flow?.movedUnits ?? 0),
      description: flow?.movedUnitsSubtitle,
      icon: <ArrowLeftRight size={18} color={BRAND} />,
    },
    {
      key: "balance",
      label: "Saldo do período",
      value: fmtInt.format(flow?.balance ?? 0),
      description: flow?.balanceSubtitle,
      danger: (flow?.balance ?? 0) < 0,
      icon: <Scale size={18} color={BRAND} />,
    },
  ];

  // Health cards
  const healthCards = [
    {
      key: "outOfStock",
      label: "Sem estoque",
      value: fmtInt.format(health?.outOfStock ?? 0),
      description: "Saldo zerado, impossibilitado de vender",
      icon: <PackageX size={18} color={BRAND} />,
    },
    {
      key: "belowMinimum",
      label: "Abaixo do mínimo",
      value: fmtInt.format(health?.belowMinimum ?? 0),
      description: "Saldo menor que o mínimo configurado",
      icon: <TrendingDown size={18} color={BRAND} />,
    },
    {
      key: "aboveMaximum",
      label: "Acima do máximo",
      value: fmtInt.format(health?.aboveMaximum ?? 0),
      description: "Saldo maior que o máximo configurado",
      icon: <TrendingUp size={18} color={BRAND} />,
    },
    {
      key: "withoutSupplier",
      label: "Sem fornecedor",
      value: fmtInt.format(health?.withoutSupplier ?? 0),
      description: "Dificulta a rastreabilidade de recompra",
      icon: <Truck size={18} color={BRAND} />,
    },
  ];

  return {
    period,
    handlePeriodChange,
    salesLimit,
    setSalesLimit,
    compositionLimit,
    setCompositionLimit,
    overviewLoading,
    overviewFetching,
    mostSoldLoading,
    mostSoldFetching,
    leastSoldLoading,
    leastSoldFetching,
    isRankingsFetching,
    flow,
    health,
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
  };
}
