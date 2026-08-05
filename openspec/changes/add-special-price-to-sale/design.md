## Context

O fluxo de venda atual já possui toda a infraestrutura necessária para suportar preços especiais: o model `InternCustomerModel` traz `internCustomerPrices`, o `CartSaleItem` já tem os campos `isEspecialPrice`, `internCustomerPriceId` e `internCustomerPrice`, e o `saleFormulas.ts` já calcula totais usando esses campos. O `OrderProductItem` já renderiza tags e preços especiais quando `isEspecialPrice === true`.

O que falta é a camada de UI que conecta esses dados: identificar quando um item tem preço especial disponível, permitir ao vendedor aplicá-lo, e reverter ao desselecionar o cliente.

## Goals / Non-Goals

**Goals:**

- Fornecer visibilidade imediata de preços especiais disponíveis por item no carrinho
- Permitir aplicação de preço especial com confirmação explícita do vendedor
- Reverter automaticamente preços ao desselecionar o cliente
- Exibir detalhes do cliente e seus preços especiais em modal dedicado

**Non-Goals:**

- Alterar o payload da API ou o backend
- Modificar a estrutura do `CartSaleItem` ou do sales store
- Aplicar preços especiais automaticamente sem confirmação do usuário
- Alterar a lógica de cálculo de totais (já funcional)
- Adicionar edição de preços especiais a partir da tela de venda

## Decisions

### 1. Mapa de preços especiais via `useMemo` no controller

**Decisão**: Criar um `Map<productEspecificationId, InternCustomerSpecialPriceModel>` derivado de `selectedCustomer.internCustomerPrices` usando `useMemo`.

**Alternativas consideradas**:

- Buscar preços especiais via API separada: Rejeitado porque os dados já vêm no payload do customer
- Buscar no momento do match (sem cache): Rejeitado porque seria O(n*m) a cada render

**Racional**: O `Map` permite lookup O(1) para cada item do carrinho. O `useMemo` com dependência em `selectedCustomer` garante recálculo apenas quando o customer muda.

### 2. Indicador visual com padrão expansível (não modal)

**Decisão**: Usar um mini-menu expansível inline no item do carrinho, com tag permanente + área expansível com botão.

**Alternativas consideradas**:

- Modal para cada item: Rejeitado porque adiciona passo extra e quebra o fluxo
- Botão direto sem expansão: Rejeitado porque poderia causar cliques acidentais
- Tooltip: Rejeitado porque não funciona bem em mobile

**Racional**: O padrão tag + expansão equilibra visibilidade (tag sempre visível) com ação controlada (expansão necessária para aplicar). Mantém o carrinho compacto.

### 3. Modal de confirmação separado para aplicação

**Decisão**: Criar `ApplySpecialPriceModal` como componente dedicado, passando o item e o preço especial como props.

**Alternativas consideradas**:

- Confirm dentro do mini-menu: Rejeitado porque não mostra comparação completa
- Aplicar direto sem confirmação: Rejeitado porque o usuário precisa ver o impacto no total

**Racional**: O modal permite mostrar comparação detalhada (normal vs especial, economia por unidade, economia total) antes de confirmar. Segue o padrão de UX do projeto para ações que alteram valores.

### 4. CustomerDetailsModal movido para application-components

**Decisão**: Mover o `CustomerViewModal` existente de `Customer/CustomerView/components/` para `application-components/CustomerDetailsModal/`, adaptando para funcionar tanto na listagem de customers quanto na tela de venda.

**Alternativas consideradas**:

- Duplicar o componente: Rejeitado porque viola DRY
- Criar um novo modal simplificado: Rejeitado porque o existente já atende

**Racional**: Reutilizar o componente existente mantém consistência visual e reduz manutenção. A adaptação principal é receber o customer via prop em vez de buscar por ID.

### 5. Reset via callback no `setselectedCustomer`

**Decisão**: No `useOrderContentController`, interceptar a mudança de customer para resetar `isEspecialPrice` de todos os itens que o tinham.

**Alternativas consideradas**:

- Efeito colateral no `useEffect`: Rejeitado porque é menos explícito
- Reset manual no momento de deselecionar: Rejeitado porque poderia ser esquecido

**Racional**: Centralizar o reset no callback do setselectedCustomer garante que acontece sempre, independentemente de como o customer é deselecionado (botão limpar, select clear, etc).

## Risks / Trade-offs

- **Performance com muitos itens no carrinho**: O `useMemo` para o mapa de preços e o `find` em cada item são O(1) e O(n) respectivamente, mas com carrinhos muito grandes (>50 itens) pode haver impacto leve. **Mitigação**: Limitar itens por venda (regra de negócio existente).

- **Consistência de estado**: Ao deselecionar customer, itens com preço especial devem ser revertidos. Se o reset falhar, o payload ficaria com `isEspecialPrice=true` mas `internCustomerPriceId=null`. **Mitigação**: Reset síncrono no callback, não dependente de efeitos colaterais.

- **Componente CustomerDetailsModal movido**: A importação na página de listagem de customers precisa ser atualizada. **Mitigação**: Manter re-export do local antigo por um período de transição se necessário.

## Migration Plan

1. Criar novos componentes (`ApplySpecialPriceModal`, `CustomerDetailsModal`) em `application-components/`
2. Atualizar imports na página de listagem de customers para usar o novo local
3. Integrar lógica de preço especial no `useOrderContentController`
4. Atualizar `OrderContent` e `OrderProductItem` para renderizar indicadores
5. Adicionar ícone de olho e modal no `CommonSale`

**Rollback**: Remover novos componentes e reverter alterações nos controllers. Nenhuma mudança de dados persistidos.
