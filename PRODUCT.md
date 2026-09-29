# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hóspedes que procuram estadias flexíveis e proprietários que anunciam quartos ou suítes reserváveis de forma independente.

## Product Purpose

DOMUS X centraliza a descoberta de vagas, consulta de disponibilidade, reserva, pagamento, renovação e comunicação de hospedagens, reduzindo a dependência de mensagens privadas.

## Positioning

O imóvel é anunciado como uma unidade principal, mas cada quarto ou suíte tem preço, características e disponibilidade próprios para reserva independente.

## Operating Context

Visitantes criam ou acessam uma conta antes de gerenciar seu perfil, anunciar espaços ou avançar em fluxos de hospedagem. A autenticação inclui login, cadastro, recuperação e redefinição de senha, além de acesso pelo Google.

## Capabilities and Constraints

- Next.js no frontend e NestJS no backend.
- As regras críticas de autenticação e sessão permanecem no backend.
- As rotas, campos, validações, integrações e comportamento dos fluxos existentes devem ser preservados.
- A localização exata de imóveis privados não é exposta publicamente.

## Brand Commitments

- Nome: DOMUS X.
- A identidade existente usa azul-marinho, azul e a fonte Plus Jakarta Sans.
- A imagem `frontend/public/assets/login-example.jpg` é referência vinculante de composição e atmosfera para o redesign da autenticação, não conteúdo a ser copiado literalmente.

## Evidence on Hand

- Fluxos de autenticação implementados em `frontend/app/login`, `frontend/app/cadastro`, `frontend/app/recuperar-senha` e `frontend/app/redefinir-senha`.
- Referência visual em `frontend/public/assets/login-example.jpg`.

## Product Principles

- Tornar a disponibilidade e a reserva mais claras que a negociação por mensagens privadas.
- Preservar segurança e discrição no uso da plataforma.
- Separar a verdade de negócio, mantida no backend, da experiência apresentada no frontend.
