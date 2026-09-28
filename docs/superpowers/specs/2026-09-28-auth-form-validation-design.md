# Validação dos formulários de autenticação

## Objetivo

Adicionar validação local tipada aos fluxos de login, cadastro, recuperação e redefinição de senha, sem alterar os contratos, rotas ou a validação definitiva do backend.

## Arquitetura

- Instalar `react-hook-form`, `zod` e `@hookform/resolvers` no frontend.
- Criar schemas Zod no frontend que reflitam as regras já aplicadas pelos DTOs do backend: e-mail válido, nome entre 2 e 120 caracteres, senha entre 12 e 128 caracteres nos fluxos de cadastro e redefinição, senha obrigatória no login e token com ao menos 32 caracteres na redefinição.
- Manter `AuthForm` como o componente compartilhado. Ele registra os campos com `react-hook-form`, executa o envio atual somente após a validação e mantém os erros de API como feedback geral do formulário.

## Experiência de validação

- Validar ao sair do campo e no envio; depois da primeira tentativa de envio, validar novamente enquanto a pessoa corrige o valor.
- O primeiro campo inválido recebe foco no envio.
- Cada erro fica abaixo do campo correspondente, em texto objetivo e com `aria-describedby` e `aria-invalid`.
- O campo inválido ganha destaque vermelho suave, com contraste adequado e sem alterar a composição premium da tela. O estado de foco válido segue usando a paleta azul existente.
- Valores de nome e e-mail são normalizados antes do envio da mesma forma que o backend faz: remoção de espaços externos e e-mail em minúsculas.

## Limites

- Não alterar endpoints, payloads aceitos pelo backend, Google Auth, links, rotas, redirecionamentos ou mensagens de falha retornadas pela API.
- O backend continua como fonte de verdade. Os schemas do frontend existem apenas para feedback antecipado e não substituem os DTOs.
- O escopo não inclui o formulário de perfil nesta etapa.

## Verificação

- Testes Playwright comprovam que login, cadastro, recuperação e redefinição bloqueiam envio local inválido e apresentam mensagens por campo.
- Testes cobrem obrigatório, e-mail inválido, nome curto e senha curta nos fluxos em que a regra se aplica.
- Typecheck, lint dos arquivos modificados e o detector visual passam.
