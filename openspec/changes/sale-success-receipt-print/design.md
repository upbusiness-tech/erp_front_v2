## Context

O fluxo de `CommonSale` envia uma venda para `SaleService`, mas descarta a resposta da API e exibe apenas uma mensagem global. `SaleReceiptModal` contém um rascunho baseado em tipos legados que não representam o payload real. O estado atual da venda está em `sales.store.ts`, enquanto `CommonSale` ainda acessa o carrinho legado de `uperp/store.tsx` para algumas ações.

A API serializa valores monetários como strings e retorna relações parciais de produto, especificação, cliente e preço especial. A resposta de venda deve ser a fonte de verdade do recibo, sem depender do estado do carrinho depois da confirmação.

## Goals / Non-Goals

**Goals:**

- Tipar a resposta de venda e normalizar os valores necessários ao recibo.
- Derivar um snapshot de apresentação único, reutilizado pelo modal e pelo PDF.
- Representar preço especial como preço praticado do item, com identificação visual e total próprio, sem conceito de desconto.
- Resetar o fluxo novo de venda assim que o snapshot for criado.
- Imprimir documento HTML de 80 mm pela janela de impressão do navegador, sem nova aba de visualização.
- Manter o fluxo responsivo no desktop e mobile.

**Non-Goals:**

- Alterar o endpoint, DTO ou regras de persistência do backend.
- Criar impressão fiscal, NFC-e, SAT ou integração direta com spooler de impressora.
- Alterar a tela de vendas recentes ou implementar reimpressão de vendas históricas.
- Modelar ou exibir senha, email ou outros dados sensíveis do usuário retornado pela API.

## Decisions

### Modelos de API e recibo separados

Adicionar um model de venda persistida composto por `DefaultIdModel`, `SaleType`, `SaleStatus`, `InternCustomerModel`, `ProductModel`, `ProductEspecificationModel` e `InternCustomerSpecialPriceModel` quando as relações estiverem presentes. Para relações parciais, usar tipos derivados somente com os campos retornados, em vez de forçar models completos que exigiriam propriedades ausentes.

O model da API deve aceitar valores monetários serializados como `string | number` na borda. Um mapper converte esses valores para `number` e produz um `SaleReceiptModel` com:

- itens com `unitPrice`, `lineTotal` e `hasSpecialPrice`;
- `subtotal`, calculado pela soma dos valores efetivamente praticados;
- `specialPriceTotal`, calculado somente pelas linhas com preço especial;
- `paid`, calculado pela soma dos pagamentos;
- `change`, calculado como `Math.max(paid - subtotal, 0)`;
- cliente normalizado para o nome associado ou "Consumidor final".

O modal e o PDF recebem o mesmo `SaleReceiptModel`, evitando divergência de cálculo ou apresentação.

### Preço especial não é desconto

O preço unitário efetivo será escolhido nesta ordem: preço especial retornado quando `isEspecialPrice` for verdadeiro, depois preço normal da especificação. O total de preços especiais será uma métrica informativa das linhas customizadas. Não será criado campo de desconto nem será exibido texto de economia.

### Snapshot e reset atômico

Depois de `saleService.create<SaleModel>(data)`, o controller cria o snapshot, atualiza o estado do recibo e chama uma ação de reset no `sales.store`. O reset limpa `saleItems`, `payments`, `selectedCustomer` e restaura `saleStep` para `items`. O snapshot permanece fora do store da venda para que o modal continue válido após a limpeza.

O carrinho legado não será usado para limpar ou contar a venda nova. A ação de limpeza do fluxo CommonSale deverá operar sobre `sales.store`.

### Fluxo de finalização

A verificação de caixa aberto acontece antes da chamada à API. Ausência de caixa retorna imediatamente após o aviso. A mensagem de sucesso e a abertura do modal acontecem somente dentro do caminho de resposta bem-sucedida. Erros da API não limpam a venda nem abrem o recibo, permitindo correção ou nova tentativa.

### Impressão térmica nativa do navegador

Criar um documento HTML específico de comprovante com página vertical customizada de 80 mm de largura, estilos compactos e quebra de conteúdo para várias páginas. A largura será centralizada em uma constante de estilo para permitir suporte posterior a 58 mm sem alterar o model ou o modal.

O botão de impressão cria um `iframe` temporário com `srcdoc`, aplica `@page { size: 80mm auto }`, aguarda o carregamento e chama `contentWindow.print()`. O iframe é removido após o início da impressão ou em caso de falha. Não será usado PDF viewer, link com `target="_blank"`, Puppeteer ou navegação para uma aba de visualização.

### Mapa de pagamentos da API

O comprovante usará o enum de pagamentos do domínio (`PIX`, `CREDITO`, `DEBITO`, `DINHEIRO`) e um mapa de rótulos correspondente. O mapa legado de `uperp/types.ts`, que usa valores minúsculos, não será reutilizado para interpretar a resposta da API.

## Risks / Trade-offs

- [O navegador pode restringir `print()` de conteúdo em iframe] → manter a impressão iniciada diretamente pelo clique do operador, usar HTML com `srcdoc`, tratar `onload`/erro e validar nos navegadores suportados.
- [A API pode retornar relações parciais ou valores monetários em formatos diferentes] → manter tipos de borda tolerantes, normalizar em um único mapper e cobrir o payload fornecido em testes.
- [Páginas de rolo térmico possuem altura variável] → usar largura fixa de 80 mm, conteúdo compacto e quebra em páginas; validar impressão física com uma venda curta e outra longa.
- [O carrinho legado ainda pode ser usado por componentes antigos] → limitar o reset desta mudança ao fluxo `sales.store` e documentar a separação, evitando limpar estado não relacionado por engano.
- [Totais derivados no frontend podem divergir se o backend alterar regras de preço] → usar os preços e flags persistidos no payload retornado, não valores atuais do catálogo ou do carrinho.

## Migration Plan

1. Adicionar os models e mapper de recibo sem alterar o contrato da API.
2. Substituir o rascunho do modal e conectar o retorno tipado do controller.
3. Adicionar o reset do fluxo novo e corrigir o caminho de sucesso/erro.
4. Adicionar impressão HTML térmica e validar o formato de 80 mm no navegador suportado pelo projeto.
5. Em caso de rollback, remover a montagem do modal e da impressão; o endpoint e o payload permanecem compatíveis porque não sofrem alterações.
