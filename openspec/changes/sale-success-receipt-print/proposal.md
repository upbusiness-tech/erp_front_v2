## Why

Ao finalizar uma venda, a tela exibe apenas uma mensagem de sucesso e não apresenta ao operador ou ao cliente um resumo confiável da operação. O rascunho de recibo não está conectado ao payload real da API, não identifica preços especiais e não oferece impressão adequada para impressoras térmicas.

Esta mudança cria um recibo pós-venda claro, preserva a venda retornada pelo backend como snapshot, evita finalizações duplicadas e permite imprimir um comprovante compacto por meio da janela de impressão do navegador.

## What Changes

- Criar models tipados para a resposta completa de venda, seus itens, pagamentos e dados derivados do recibo, aproveitando os models de domínio existentes sem expor dados sensíveis do usuário.
- Exibir um modal de venda concluída com código, data, cliente quando houver, itens, preços praticados, identificação de preço especial, subtotal, total de itens com preço especial, total, pagamentos e troco.
- Tratar preço especial como preço customizado do item, nunca como desconto financeiro.
- Gerar um documento de impressão compacto para papel térmico de 80 mm, com suporte preparado para 58 mm, e iniciar a impressão pela janela do navegador sem abrir um visualizador PDF ou nova aba.
- Limpar itens, pagamentos, cliente e etapa da venda quando o recibo for aberto, mantendo o snapshot exibido no modal.
- Corrigir o fluxo de finalização para só exibir sucesso após criação efetiva da venda e impedir sucesso falso quando não houver caixa aberto.
- Garantir que o estado novo de vendas seja limpo, sem depender do carrinho legado de `uperp/store.tsx`.

## Capabilities

### New Capabilities

- `sale-success-receipt`: Resumo pós-venda, modelagem do snapshot, cálculo de totais e identificação de preços especiais.
- `thermal-sale-printing`: Geração e impressão de comprovante PDF em formato compacto para impressoras térmicas.

### Modified Capabilities

<!-- Nenhuma capability existente possui requisitos aplicáveis para modificar. -->

## Impact

- `useCommonSale.controller.tsx`: receber a venda criada, construir o snapshot, controlar o modal e corrigir sucesso/erro.
- `CommonSale.tsx`: montar o modal de recibo e conectar suas ações.
- `SaleReceiptModal.tsx`: substituir o rascunho por uma apresentação baseada no model real.
- `src/model`: adicionar os models da resposta de venda e do recibo.
- `sales.store.ts`: permitir reset atômico do fluxo de venda.
- `src/application-components`: adicionar geração/impressão HTML do comprovante térmico.
- `package.json`: nenhuma dependência adicional necessária; a impressão usa APIs nativas do navegador.
- Não requer alteração de payload ou endpoint backend.
