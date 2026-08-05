## Purpose

Permitir a impressão de um comprovante de venda compacto e legível em impressoras térmicas, usando os mesmos dados confirmados no recibo pós-venda e a janela de impressão do navegador.

## ADDED Requirements

### Requirement: Imprimir comprovante térmico

O sistema SHALL oferecer uma ação de impressão no recibo e SHALL gerar um documento de impressão dimensionado para papel térmico de 80 mm, sem abrir um visualizador PDF ou uma nova aba.

#### Scenario: Imprimir comprovante de 80 mm

- **WHEN** o operador seleciona "Imprimir comprovante"
- **THEN** o sistema gera um layout vertical compacto com largura de 80 mm e abre a janela de impressão do navegador

#### Scenario: Venda com muitos itens

- **WHEN** o comprovante possui mais itens do que cabem em uma página
- **THEN** o conteúdo continua em páginas térmicas consecutivas sem cortar itens, pagamentos ou totais

### Requirement: Comprovante representar o snapshot da venda

O comprovante SHALL conter cliente quando houver, itens, identificação de preço especial, subtotal, total de preços especiais quando aplicável, total, pagamentos e troco usando o mesmo snapshot exibido no modal.

#### Scenario: PDF de venda com preço especial

- **WHEN** o operador imprime uma venda que possui itens com preço especial
- **THEN** o comprovante identifica esses itens e exibe o total de preços especiais sem classificá-lo como desconto

#### Scenario: PDF sem cliente

- **WHEN** o operador imprime uma venda sem cliente associado
- **THEN** o PDF exibe uma identificação de consumidor final

### Requirement: Imprimir sem nova aba

O sistema SHALL iniciar a impressão em uma janela de impressão do navegador usando um documento HTML temporário e SHALL remover os recursos temporários usados para impressão após o processo ser iniciado ou falhar.

#### Scenario: Impressão iniciada

- **WHEN** o navegador termina de carregar o documento temporário para impressão
- **THEN** a janela de impressão é solicitada sem navegação para uma nova aba ou visualizador PDF

#### Scenario: Falha na geração do PDF

- **WHEN** ocorre uma falha ao gerar ou carregar o documento de impressão
- **THEN** o sistema informa a falha ao operador e não deixa recursos temporários persistentes na página
