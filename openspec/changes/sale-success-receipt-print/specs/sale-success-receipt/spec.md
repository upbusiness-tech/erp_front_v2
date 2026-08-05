## Purpose

Apresentar ao operador e ao cliente um resumo confiável da venda recém-concluída, com valores calculados a partir da resposta persistida pela API e identificação clara dos itens com preço especial.

## ADDED Requirements

### Requirement: Exibir recibo da venda concluída

O sistema SHALL exibir um modal de confirmação após a criação bem-sucedida da venda, usando a venda retornada pela API como snapshot imutável do recibo.

#### Scenario: Venda concluída com cliente

- **WHEN** uma venda é criada com sucesso e possui `internCustomer`
- **THEN** o modal exibe o código, a data, o cliente, os itens, os pagamentos, o total e o troco da venda

#### Scenario: Venda concluída sem cliente

- **WHEN** uma venda é criada com sucesso sem cliente associado
- **THEN** o modal identifica a operação como venda para consumidor final

### Requirement: Identificar preços especiais sem tratá-los como desconto

O sistema SHALL identificar visualmente cada item cujo preço especial foi aplicado e SHALL calcular o total de preços especiais como a soma dos valores praticados desses itens, sem exibir esse valor como desconto financeiro.

#### Scenario: Venda com preço especial aplicado

- **WHEN** um item possui `isEspecialPrice` verdadeiro e um preço especial retornado pela API
- **THEN** o item exibe uma identificação de preço especial, usa o preço especial no total da linha e o valor da linha compõe o total de preços especiais

#### Scenario: Venda sem preço especial

- **WHEN** nenhum item possui preço especial aplicado
- **THEN** nenhum total de preços especiais é exibido e todos os itens usam seus preços normais

### Requirement: Calcular resumo financeiro do recibo

O sistema SHALL calcular o subtotal e o total pela soma dos preços efetivamente praticados multiplicados pelas quantidades, SHALL calcular o valor pago pela soma dos pagamentos e SHALL calcular o troco como o excedente pago sobre o total, limitado a zero quando não houver excedente.

#### Scenario: Pagamento superior ao total

- **WHEN** a soma dos pagamentos é maior que o total da venda
- **THEN** o recibo exibe o valor pago e o troco correspondente

#### Scenario: Pagamento exato

- **WHEN** a soma dos pagamentos é igual ao total da venda
- **THEN** o recibo exibe troco igual a zero ou omite a linha de troco sem apresentar valor negativo

### Requirement: Limpar o fluxo após a conclusão

O sistema SHALL limpar itens, pagamentos, cliente selecionado e etapa da venda quando o recibo for aberto, preservando o snapshot para que o modal continue exibindo a operação concluída.

#### Scenario: Abrir recibo e iniciar nova venda

- **WHEN** o modal de recibo é aberto após uma venda bem-sucedida
- **THEN** o estado da nova venda fica vazio, a etapa retorna para itens e o fechamento do modal permite iniciar uma nova venda sem repetir a anterior

### Requirement: Não confirmar venda não criada

O sistema SHALL exibir sucesso e abrir o recibo somente depois que a API confirmar a criação da venda e SHALL interromper o fluxo quando não houver caixa aberto.

#### Scenario: Finalização sem caixa aberto

- **WHEN** o operador tenta finalizar a venda sem caixa aberto
- **THEN** o sistema exibe um aviso, não chama a criação da venda e não exibe confirmação de sucesso

#### Scenario: Erro ao criar venda

- **WHEN** a API rejeita a criação da venda
- **THEN** o sistema exibe uma mensagem de erro, não abre o recibo e mantém a venda não concluída para correção ou nova tentativa
