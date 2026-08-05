## 1. Mover CustomerDetailsModal para application-components

- [x] 1.1 Criar diretório `application-components/CustomerDetailsModal/`
- [x] 1.2 Mover `CustomerViewModal.tsx` de `Customer/CustomerView/components/` para o novo diretório, adaptando para receber customer via prop (sem busca por ID)
- [x] 1.3 Atualizar import na página de listagem de customers para usar o novo local

## 2. Lógica de preço especial no useOrderContentController

- [x] 2.1 Adicionar `useMemo` para criar `specialPriceMap: Map<number, InternCustomerSpecialPriceModel>` a partir de `selectedCustomer.internCustomerPrices`
- [x] 2.2 Criar função `getSpecialPriceForItem(item: CartSaleItem): InternCustomerSpecialPriceModel | undefined` que busca no mapa por `productEspecificationId`
- [x] 2.3 Criar função `resetSpecialPrices()` que percorre `saleItems` e reverte `isEspecialPrice`, `internCustomerPriceId`, `internCustomerPrice` de todos os itens
- [x] 2.4 Alterar `setselectedCustomer` para chamar `resetSpecialPrices()` antes de atualizar o state
- [x] 2.5 Retornar `specialPriceMap` e `getSpecialPriceForItem` do controller

## 3. Criar ApplySpecialPriceModal

- [x] 3.1 Criar diretório `application-components/ApplySpecialPriceModal/`
- [x] 3.2 Criar componente `ApplySpecialPriceModal.tsx` com props: `open`, `item`, `specialPrice`, `onApply`, `onCancel`
- [x] 3.3 Implementar exibição de comparação: preço normal, preço especial, economia por unidade, quantidade, total normal, total especial, economia total
- [x] 3.4 Implementar botões "Cancelar" e "Aplicar Preço Especial"

## 4. Atualizar OrderProductItem

- [x] 4.1 Adicionar props `specialPriceAvailable?: InternCustomerSpecialPriceModel` e `onApplySpecialPrice?: (item: CartSaleItem) => void`
- [x] 4.2 Implementar mini-menu expansível com tag "⭐ Preço especial disponível" + área expansível com preço e botão "Aplicar"
- [x] 4.3 Adicionar estado de expansão (useState para open/close do mini-menu)

## 5. Atualizar OrderContent

- [x] 5.1 Integrar `getSpecialPriceForItem` do controller para calcular preço especial de cada item
- [x] 5.2 Passar `specialPriceAvailable` e `onApplySpecialPrice` para cada `OrderProductItem`
- [x] 5.3 Adicionar estado para controlar abertura do `ApplySpecialPriceModal`
- [x] 5.4 Implementar handler `handleApplySpecialPrice` que seta `isEspecialPrice=true`, `internCustomerPriceId`, `internCustomerPrice` no item

## 6. Ícone de olho e modal de detalhes no CommonSale

- [x] 6.1 Adicionar ícone `Eye` (lucide-react) ao lado do nome do customer selecionado no `OrderContent`
- [x] 6.2 Adicionar estado `customerDetailsOpen` no `useOrderContentController`
- [x] 6.3 Renderizar `CustomerDetailsModal` com `customer` e `isOpen` do state
- [x] 6.4 Implementar handler para abrir/fechar o modal ao clicar no ícone

## 7. Indicação no ProductEspecificationModal

- [x] 7.1 Passar `selectedCustomer` como prop para `ProductEspecificationModal`
- [x] 7.2 No modal, após selecionar especificação, buscar preço especial em `selectedCustomer.internCustomerPrices`
- [x] 7.3 Exibir indicador do preço especial disponível ao lado do preço normal (quando existir)

## 8. Atualização de imports e limpeza

- [x] 8.1 Verificar e atualizar todos os imports afetados pela movimentação do `CustomerDetailsModal`
- [x] 8.2 Remover componente antigo de `Customer/CustomerView/components/` após confirmação de funcionamento
- [x] 8.3 Executar lint e typecheck para verificar erros
