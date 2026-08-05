## 1. Dependência e modelos

- [x] 1.1 Usar as APIs nativas do navegador para impressão, sem adicionar uma dependência de PDF ao frontend.
- [x] 1.2 Criar os models da resposta de venda, item e pagamento usando os models de domínio existentes e tipos de borda compatíveis com valores monetários serializados.
- [x] 1.3 Criar o `SaleReceiptModel` e o mapper que normaliza cliente, itens, preços praticados, pagamentos, subtotal, total de preços especiais, valor pago e troco.
- [x] 1.4 Garantir que os models e o mapper não incluam nem exponham senha ou outros dados sensíveis do usuário retornado pela API.

## 2. Estado e finalização da venda

- [x] 2.1 Adicionar ao `sales.store` uma ação atômica para limpar itens, pagamentos, cliente selecionado e retornar a etapa para `items`.
- [x] 2.2 Alterar `useCommonSaleController` para tipar o retorno de `saleService.create` e construir o snapshot do recibo.
- [x] 2.3 Corrigir o fluxo para interromper quando não houver caixa aberto e só exibir sucesso após a API confirmar a criação.
- [x] 2.4 Abrir o recibo e executar o reset do novo fluxo somente após uma resposta bem-sucedida, sem usar o carrinho legado.
- [x] 2.5 Manter itens e pagamentos no estado quando a API falhar, exibindo erro sem abrir o recibo.

## 3. Modal de recibo

- [x] 3.1 Substituir o rascunho de `SaleReceiptModal` por um componente baseado em `SaleReceiptModel`.
- [x] 3.2 Exibir estado de sucesso, código, data, cliente ou consumidor final e resumo visual do total.
- [x] 3.3 Exibir todos os itens com quantidade, preço unitário, total da linha, variação, observação e tag explícita para preço especial.
- [x] 3.4 Exibir subtotal, total de preços especiais somente quando aplicável, total, pagamentos e troco sem criar linha de desconto.
- [x] 3.5 Conectar o modal ao `CommonSale`, incluindo fechamento, ação de nova venda e ação de impressão.
- [x] 3.6 Garantir leitura e ações adequadas em telas pequenas sem perder o resumo financeiro.

## 4. Comprovante PDF térmico

- [x] 4.1 Criar o documento HTML de impressão com largura configurável de 80 mm, layout vertical compacto e suporte a quebra de conteúdo.
- [x] 4.2 Renderizar no documento de impressão os mesmos campos e regras do modal, incluindo identificação e total dos itens com preço especial sem classificá-los como desconto.
- [x] 4.3 Implementar a impressão via `srcdoc`, iframe temporário e `contentWindow.print()`, sem abrir nova aba ou visualizador PDF.
- [x] 4.4 Remover o iframe e os dados temporários após impressão iniciada ou falha, exibindo mensagem útil quando a geração/carregamento falhar.
- [ ] 4.5 Validar visualmente a impressão em 80 mm com venda curta, venda com preço especial, múltiplos pagamentos e lista longa de itens.

## 5. Verificação

- [x] 5.1 Verificar com o payload fornecido que os valores calculados são subtotal `R$ 87,00`, total de preços especiais `R$ 80,00`, total pago `R$ 100,00` e troco `R$ 13,00`.
- [ ] 5.2 Verificar os cenários de venda sem cliente, sem preço especial, pagamento exato, caixa fechado e erro da API.
- [ ] 5.3 Executar lint e build do projeto e corrigir problemas de tipagem, formatação ou empacotamento.
