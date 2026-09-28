# Redesign das telas de autenticação

## Objetivo e público

- Hóspedes e proprietários acessam a DOMUS X para descobrir estadias ou administrar seus espaços; a tela precisa transmitir segurança e discrição antes da primeira ação.
- O redesenho abrange `/login`, `/cadastro`, `/recuperar-senha` e `/redefinir-senha`, usando o componente compartilhado `AuthForm`.

## Direção aprovada

- Composição em dois planos: uma cena arquitetônica abstrata e noturna contextualiza a marca; o formulário ocupa uma superfície elevada e concentrada para a tarefa.
- A paleta existente é a autoridade: `--navy`, `--surface`, `--surface-raised`, `--blue`, `--blue-light`, `--gray` e `--info`. Azul e azul-claro criam a iluminação; lilás é apenas profundidade ambiental.
- O visual deve ser premium por meio de luz, sombra, transparências e escala, não por bordas repetidas. A referência inspira proporção, atmosfera, posicionamento e ritmo, sem copiar sua marca, cores ou conteúdo.

## Experiência e responsividade

- A marca integra a cena, sem cabeçalho independente.
- O CTA primário tem brilho animado discreto e deslocamento do ícone de seta em hover/focus. Estados `disabled` mantêm feedback claro e desativam a animação excessiva.
- Google Auth fica após um divisor textual, com botão circular e SVG atual da marca Google; seu `href` e a navegação permanecem os mesmos.
- Links, feedbacks de erro/sucesso e mensagens de segurança ficam em posições previsíveis, legíveis e navegáveis por teclado.
- Em desktop, cena e formulário usam duas colunas. Em tablet e mobile, a cena reduz para uma faixa superior e o formulário ocupa a largura útil, preservando todos os controles e o conteúdo de confiança.

## Limites

- Não alterar endpoints, payloads, validações, rotas, redirecionamentos, integração com Google, tratamento de erro ou regras de negócio.
- Não introduzir dependências nem estilos inline.
- Não usar a imagem de referência como conteúdo de produção; ela é referência visual.
- Não alterar telas fora do fluxo de autenticação, salvo tokens globais estritamente necessários para suportar o visual aprovado.

## Verificação

- Os testes Playwright existentes continuam comprovando o `href` de Google Auth e o envio de cadastro.
- Novas asserções cobrem a presença do divisor, do botão Google acessível e do conteúdo de confiança em cada rota.
- Lint, typecheck e o conjunto Playwright relacionado precisam passar.
