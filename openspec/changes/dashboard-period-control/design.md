## Context

O codebase tem uma arquitetura dual: uma camada legada (Context Store via `useStore()`) usada por `Financas.tsx` e `StockStatsOverview`, e uma camada moderna (TanStack Query + `BaseService` + `api` axios) usada pelas tabelas de produto e vendas. O backend já expõe `GET /product/dashboard?from=&to=&limit=` que retorna `ProductDashboardResponse` (summary + rankings). Não existe endpoint equivalente para finanças ainda — será tratado como filtragem local no frontend neste momento, com o contrato `{ from, to }` preparado para futura migração.

As telas afetadas não possuem nenhum controle de período atualmente: `Financas.tsx` tem dados hardcoded "HOJE" e gráfico mockado; `StockStatsOverview` processa todas as vendas do store sem filtro temporal e usa `Math.random()` como fallback.

## Goals / Non-Goals

**Goals:**
- Criar `PeriodSelector` + `useDashboardPeriod` como infraestrutura compartilhada
- Refatorar tab Estatísticas de Finanças para dados reais filtrados por período (frontend filtering, sem endpoint)
- Migrar `StockStatsOverview` para consumir endpoint real `ProductDashboard`
- Adicionar `PeriodSelector` nas tabs Histórico de Vendas e Histórico de Caixas
- Período padrão "Este Mês" em todas as telas

**Non-Goals:**
- Não criar endpoint de sale dashboard no backend (será feito posteriormente)
- Não migrar `Financas.tsx` da context store para TanStack Query (a migração da fonte de dados de vendas é um esforço separado)
- Não alterar outras tabs de Finanças além das mencionadas (Relatórios permanece como está)

## Decisions

### D1: PeriodSelector via Segmented do Ant Design

**Escolha:** Usar `Segmented` com opções `['Hoje', 'Ontem', 'Semana', 'Mês', 'Per.']`. Quando "Per." é selecionado, substituir por `RangePicker`.

**Alternativas consideradas:**
- `Select` dropdown → menos visível, requer dois cliques pra ver opções
- `Radio.Group buttonStyle="solid"` → visual pesado com muitos botões
- `Segmented` → nativo do Ant Design, responsivo, visual limpo, animações built-in

**Razão:** `Segmented` oferece a melhor relação visibilidade/espaço. Os labels curtos (4-5 caracteres) cabem bem. A troca condicional para `RangePicker` mantém a UI limpa quando não está em modo personalizado.

### D2: useDashboardPeriod como hook com estado local (não Zustand)

**Escolha:** Hook React com `useState` para gerenciar `preset`, `customFrom`, `customTo`. O período computado é derivado via `useMemo`.

**Alternativas consideradas:**
- Zustand store → overkill, o período não precisa ser global (cada tela pode ter seu próprio estado de período)
- Context provider → mesma complexidade sem benefício adicional

**Razão:** Cada tela de dashboard deve ter seu período independente. Se no futuro quisermos sincronizar períodos entre abas, podemos evoluir o hook para aceitar uma store key opcional, mas o default é isolamento.

**Interface do hook:**
```typescript
function useDashboardPeriod(defaultPreset?: PeriodPreset): {
  preset: PeriodPreset;
  period: { from: string; to: string }; // YYYY-MM-DD
  setPreset: (preset: PeriodPreset) => void;
  setCustomRange: (from: Dayjs, to: Dayjs) => void;
}
```

### D3: Finanças — filtragem local no frontend (passo inicial)

**Escolha:** Processar `sales[]` do `useStore()` filtrando por `date` no intervalo `[from, to]`. Agregar receita, contagem, ticket médio, payment breakdown, top produtos e série diária com `useMemo`.

**Alternativas consideradas:**
- Criar endpoint `GET /sale/dashboard` → ideal mas depende de trabalho no backend, fora do escopo imediato
- Usar `GET /sale?filter=date||$between||from,to` via NestCRUD → possível mas retorna dados brutos, requer agregação igual

**Razão:** O contrato `{ from, to }` fica estabelecido no hook/componente. Quando o endpoint existir, basta trocar a fonte de dados — a interface do hook não muda. A filtragem local é viável porque os dados já estão em memória no context store.

### D4: StockStatsOverview — TanStack Query com endpoint real

**Escolha:** `ProductDashboardService` estendendo um pattern simples (não `BaseService`, pois o endpoint não é CRUD). `useProductDashboard(period)` hook com `useQuery` do TanStack Query.

**Service:**
```typescript
class ProductDashboardService {
  async getDashboard(from: string, to: string, limit = 10): Promise<ProductDashboardResponse> {
    return api.get('/product/dashboard', { params: { from, to, limit } }).then(r => r.data);
  }
}
```

**Hook:**
```typescript
function useProductDashboard(period: { from: string; to: string }) {
  return useQuery({
    queryKey: ['product-dashboard', period],
    queryFn: () => productDashboardService.getDashboard(period.from, period.to),
    staleTime: 30_000,
    enabled: !!period.from && !!period.to,
  });
}
```

**Razão:** TanStack Query já está no projeto com padrão estabelecido (`useGetAllWithParams`, `useCacheManager`). Reutilizar o mesmo ecossistema garante cache, refetch e loading states consistentes.

### D5: Loading states — Skeleton (não stale cache)

**Escolha:** Mostrar Ant Design `Skeleton` nos cards durante o primeiro load. Em refetches (troca de período), manter os dados anteriores visíveis com um indicador sutil de loading (opacidade reduzida ou spinner no canto).

**Alternativas consideradas:**
- Manter último valor sem indicador → usuário não sabe que está carregando
- Spinner full-page → quebra a experiência, parece lento

**Razão:** `keepPreviousData` do TanStack Query (ou placeholderData) mantém a UI utilizável durante transições de período. Skeleton só no primeiro load evita layout shift.

### D6: Limite de 60 dias — disabledDate no RangePicker

**Escolha:** Usar `disabledDate` no `RangePicker` do Ant Design para bloquear datas futuras e datas anteriores a 60 dias atrás de hoje. Adicionalmente, validar no `onChange` e mostrar `message.warning` se o range selecionado exceder 60 dias.

```typescript
const disabledDate = (current: Dayjs) => {
  if (current > dayjs().endOf('day')) return true;
  return current < dayjs().subtract(60, 'day').startOf('day');
};
```

**Razão:** `disabledDate` impede seleção de datas inválidas visualmente. A validação extra no `onChange` cobre o caso de o usuário selecionar first/last que, juntos, excedem 60 dias (ex: first = 60 dias atrás, last = hoje → 60 dias, ok; first = 61 dias atrás → bloqueado pelo disabledDate).

### D7: Posicionamento do PeriodSelector

**Escolha:** `PeriodSelector` renderizado como barra de ferramentas no topo de cada tab/dashboard, antes dos cards de métricas.

**No Financas.tsx:** O `PeriodSelector` fica acima dos Tabs, compartilhando o estado do período entre Estatísticas, Histórico de Vendas e Histórico de Caixas. Apenas a tab Relatórios não é afetada.

**No StockStatsOverview:** O `PeriodSelector` fica no topo do componente, acima dos cards de summary.

## Risks / Trade-offs

- **[Risco] Filtragem local em Finanças pode ficar lenta com muitas vendas** → Mitigação: `useMemo` com dependências corretas evita recomputação desnecessária. Quando migrar para endpoint, a performance melhora naturalmente.

- **[Risco] 60 dias pode ser restritivo para análises históricas** → Mitigação: O limite é facilmente ajustável (parâmetro `maxRangeDays` no hook). Os relatórios gerados na tab "Relatórios" não têm essa restrição e servem para análise de longo prazo.

- **[Risco] StockStatsOverview depende de endpoint que pode estar indisponível** → Mitigação: TanStack Query tem retry automático (3 tentativas). Se o endpoint falhar, mostra mensagem de erro e mantém cache anterior se disponível. O componente mantém o fallback local como último recurso durante a transição.

- **[Trade-off] Período compartilhado entre tabs de Finanças vs isolado por tab** → Decidido: compartilhado. O comportamento natural de um ERP é: "quero ver tudo sobre este mês". Trocar de tab e ver outro período seria confuso. Se no futuro houver demanda por independência, o hook pode ser instanciado separadamente por tab.

## Migration Plan

1. Criar `PeriodSelector` e `useDashboardPeriod` (componentes novos, sem dependentes) — passo zero, seguro
2. Integrar no `StockStatsOverview` com endpoint real — o componente já existe, é uma substituição interna
3. Integrar no `Financas.tsx` com filtragem local — mesma abordagem, substituição interna
4. Testar manualmente: trocar períodos, verificar consistência entre tabs, testar limite de 60 dias
5. Rollback: cada componente é autocontido; reverter é desfazer as alterações no arquivo específico
