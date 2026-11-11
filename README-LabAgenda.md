# LabAgenda — Agendamento de laboratórios

Projeto acadêmico Full Stack de Arquitetura Web. React + Vite no frontend; Node.js + Express no backend; MongoDB + Mongoose na persistência. Os laboratórios cadastrados pelo seed são fictícios: não representam a infraestrutura oficial da UFRR.

## Requisitos

- Node.js 22 ou 24 e npm.
- Docker com Compose, ou um MongoDB local/Atlas acessível pela API.
- Portas 5173 (frontend), 3001 (API) e 27017 (MongoDB local).

## Executar pela primeira vez

Abra o terminal na pasta `labagenda` extraída do ZIP:

```bash
npm install
npm run install:all
```

Copie `server/.env.example` para `server/.env` e `client/.env.example` para `client/.env`. No Linux/macOS:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

No PowerShell do Windows:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Edite `server/.env`: defina uma chave JWT aleatória e uma senha de administrador própria. Gere uma chave com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Inicie o MongoDB (Docker Desktop deve estar aberto no Windows):

```bash
docker compose up -d
npm run seed --prefix server
npm run dev
```

Acesse **http://localhost:5173**. Entre com `ADMIN_EMAIL` e `ADMIN_PASSWORD` definidos em `server/.env`. Cadastre uma segunda conta pela interface para testar o usuário comum. O seed é repetível e não apaga registros; ele não altera senha de um administrador que já exista.

Alternativa ao Docker: configure `MONGODB_URI` para um MongoDB existente e pule `docker compose up -d`. Nunca publique `.env` ou credenciais no Git. Para parar os serviços: Ctrl+C no terminal da aplicação e `docker compose stop` no banco. `docker compose down` preserva o volume; não use `-v` se quiser manter os dados.

## Comandos e validação

```bash
npm test
npm run build
```

Os testes usam o executor nativo do Node e Supertest. Verificam autenticação, token inválido, entrada inválida e proibição de CRUD de laboratórios por usuário comum. O teste de autorização substitui apenas a consulta de usuário; estes testes não verificam persistência real. O build gera `client/dist`.

Para executar apenas a API em modo sem watch:

```bash
npm start --prefix server
```

## Funcionalidades e regras

- Cadastro público sempre cria usuário comum, independentemente de um campo `role` enviado pelo cliente.
- Login com bcrypt (custo 12), JWT de duas horas e consulta ao usuário atual no banco em cada requisição protegida.
- O token fica no sessionStorage e é removido no logout. Para uma evolução de produção, considerar cookies HttpOnly, recuperação de senha e monitoramento.
- Administrador pode cadastrar, listar, editar e excluir laboratórios e gerenciar todas as reservas.
- Usuário comum consulta laboratórios e cria, lista, edita e exclui somente suas próprias reservas.
- Laboratório tem nome, localização, capacidade e descrição. Cada reserva referencia um laboratório e um usuário.
- Reservas de uma hora, entre 8h e 22h, em datas futuras, usando o horário de Boa Vista (UTC−4). Não há limite diário, aprovação ou calendário de feriados nesta versão.
- Consulta de disponibilidade não divulga dados pessoais das reservas.
- Índice único `(lab, date, hour)` no MongoDB resolve concorrência: duas solicitações simultâneas para o mesmo espaço e horário não são aceitas.
- Laboratórios vinculados a reservas não podem ser excluídos; remova as reservas vinculadas primeiro. O administrador não pode alterar o titular de uma reserva.
- Formulários validados no servidor com Zod e modelos Mongoose; há limite de corpo JSON, Helmet, CORS e limite de tentativas de login/cadastro.
- Interface SPA com React Router, contexto de autenticação, estados de carregamento, erros, busca de laboratórios e layout mobile.
- Dashboard apresenta estatísticas gerais de espaços e as reservas visíveis ao perfil; usuário comum não recebe reservas de outros usuários.

## Arquitetura

```text
server/src/
  models/        Modelos Mongoose: User, Lab, Reservation
  controllers/   Validação de entrada e regras de negócio
  middleware/    Autenticação, autorização e funções assíncronas
  routes/        Rotas e verbos HTTP
  app.js         Express e tratamento central de erros
  index.js       Conexão MongoDB, índices e inicialização
  seed.js        Administrador e laboratórios fictícios
client/src/
  main.jsx       Componentes, telas, rotas, contexto e hooks
  ReservationList.jsx  Componente compartilhado de reservas
  api.js         Cliente HTTP e token
  style.css      Identidade visual e responsividade
```

MVC adaptado à API: Models persistem, Controllers aplicam regras e a View do backend é a resposta JSON. A apresentação fica separada no React. O contexto mantém o usuário autenticado e o cliente HTTP envia o Bearer token.

## API

Todas as rotas usam prefixo `/api`. Salvo cadastro, login e health, exigem `Authorization: Bearer TOKEN`.

| Método | Rota | Permissão/resultado |
|---|---|---|
| GET | /health | Público, saúde do processo |
| POST | /auth/register | Público, cria usuário comum |
| POST | /auth/login | Público, retorna token e usuário |
| GET | /auth/me | Perfil autenticado |
| GET | /labs | Lista laboratórios |
| POST | /labs | Administrador, cria |
| PUT | /labs/:id | Administrador, substitui campos editáveis |
| DELETE | /labs/:id | Administrador, exclui sem vínculos |
| GET | /availability?lab=ID&date=AAAA-MM-DD | Horas ocupadas |
| GET | /reservations | Próprias reservas; admin vê todas |
| POST | /reservations | Cria reserva para si |
| PUT | /reservations/:id | Titular ou admin, edita |
| DELETE | /reservations/:id | Titular ou admin, exclui |

Corpo de laboratório: `{"name":"Lab A","location":"Sala 1","capacity":20,"description":"Computação"}`.
Corpo de reserva: `{"lab":"ID_MONGODB","date":"AAAA-MM-DD","hour":10,"purpose":"Estudo em grupo"}`.
Cadastro: `{"name":"Seu nome","email":"voce@exemplo.com","password":"SenhaForte123!"}`. Login usa email e password.
Respostas principais: 201 criado, 204 excluído, 400 dados inválidos, 401 sem autenticação, 403 sem permissão, 404 inexistente e 409 conflito de e-mail/horário/vínculos.

## Roteiro de apresentação (3–5 minutos)

1. Explique a divisão `server`/`client` e os modelos relacionados (30 s).
2. Cadastre um usuário. Tente senha errada e mostre o feedback; depois faça login (40 s).
3. Crie uma reserva futura, mostre a hora bloqueada, edite a finalidade e exclua (60 s).
4. Entre como administrador. Cadastre, edite e exclua um laboratório sem reservas. Mostre a lista geral de reservas e as opções extras de gestão (60 s).
5. Mostre a proteção no backend e execute `npm test`; reduza a janela para exibir o mobile (40 s).

Reserve alguns horários futuros antes da aula. Nunca apresente sua senha real nem o conteúdo de `.env`.

## Git e entrega

Crie um repositório na sua conta GitHub e envie a pasta do projeto, sem `node_modules`, `dist` e `.env`:

```bash
git init
git add .
git commit -m "feat: implementa agendamento full stack de laboratorios"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Não foi criado um repositório remoto nem efetuado deploy. Hospedagem é opcional: publique a API Node em um serviço compatível, conecte um MongoDB acessível, configure JWT_SECRET e CLIENT_ORIGIN no servidor e VITE_API_URL no frontend antes do build. Uma hospedagem apenas estática não executa Express e MongoDB.

## Checklist de teste manual com MongoDB

- Seed termina; API inicia e frontend abre.
- Cadastro duplicado retorna conflito; login inválido retorna erro.
- Usuário A reserva horário futuro; usuário B vê o horário ocupado.
- Usuário B não vê a reserva de A na listagem e recebe 403 ao tentar alterar o ID pela API.
- Reserva repetida retorna 409; horário passado retorna 400.
- Duas requisições concorrentes para o mesmo horário: apenas uma recebe 201.
- Admin modifica laboratórios; usuário comum recebe 403 para as mesmas requisições.
- Reinicie a API: registros permanecem no MongoDB.

Esses passos manuais precisam ser executados em um ambiente com MongoDB; os testes sem banco não os substituem.
