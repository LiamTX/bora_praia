# AGENTS.md - bora-praia-api

## Source of truth

Este arquivo é a fonte principal de regras operacionais para agentes neste repositório.
Instruções de sistema/developer e AGENTS.md mais específicos em subdiretórios têm precedência quando aplicável.
Siga as convenções aqui descritas **sem precisar que sejam repetidas no prompt**; desvie delas apenas se o pedido do usuário conflitar.

---

## Contexto do produto

O **Praia Certa** é uma plataforma web, mobile-first e sem necessidade de login, que ajuda moradores e turistas a escolherem a praia ideal em Florianópolis. A partir de previsões de chuva, vento, rajadas, ondas e outras condições do mar, o sistema avalia cada praia conforme o período e o objetivo do usuário — **relaxar, tomar banho ou surfar**. É possível consultar uma praia específica ou receber um ranking de recomendações, com justificativas claras e alternativas quando o destino desejado não estiver favorável.

Implicações para a API:

- Os fluxos públicos de consulta e recomendação não devem exigir autenticação ou cadastro.
- A API é a dona das regras de avaliação, scores e ranking por praia, período e objetivo; o frontend apenas apresenta esses resultados.
- Toda recomendação deve devolver justificativas compreensíveis e, quando couber, alternativas à praia consultada.
- Condições e previsões devem carregar unidades, período e horário de atualização. Ausência de dado não equivale a condição favorável ou zero.
- Previsão não é garantia de segurança: evite afirmar que uma praia é segura com base apenas no score.
- Datas e horários exibidos para Florianópolis usam `America/Sao_Paulo`; persistência deve preservar instantes sem perder essa referência.

---

## TDD obrigatório (RED → GREEN → REFACTOR)

1. Toda feature, ajuste ou correção deve começar pela fase **RED**: escreva um teste que falhe pelo motivo esperado **antes** de escrever o código de produção.
2. É **proibido alterar testes para fazê-los passar** (fase GREEN) salvo pedido explícito do usuário. Se um teste falhar após a implementação, corrija o código de produção, não o teste.
3. Na fase **REFACTOR**, mantenha o comportamento e a suíte verde.
4. Nenhuma fase termina sem evidência do RED inicial e do GREEN final (saída dos comandos de teste registrada).
5. Não avance com testes vermelhos: nunca parta para a próxima tarefa ou commit com a suíte falhando.

---

# 1. Stack Tecnológica

- Linguagem: **TypeScript** (`core/**/*.ts`), build via `nest build`.
- Framework: **NestJS** para API HTTP, bootstrap em `core/infra/http/nestjs/src/main.ts`. Não usar microservices nem RabbitMQ.
- Persistência: **TypeORM** (`DataSource`), config em `core/infra/db/typeorm/postgresql/postgresql.ormconfig.ts`.
- Banco: **PostgreSQL** (driver `pg`), variáveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_LOG` + pool (`DB_POOL_MAX`, `DB_POOL_MIN`, `DB_POOL_IDLE_TIMEOUT_MS`, `DB_POOL_CONNECTION_TIMEOUT_MS`, `DB_STATEMENT_TIMEOUT_MS`, `DB_POOL_MAX_USES`, configurados em `postgresql.ormconfig.ts`).
- Validação: **class-validator + class-transformer** nos DTOs de HTTP. Não usar Zod.
- Documentação HTTP: **Swagger** em `/doc` (DocumentBuilder com Bearer auth, `deepScanRoutes: true`).

---

# 2. Estrutura de Pastas (mapa oficial)

```
core/
├── domain/                          # CAMADA LIMPA: contratos/interfaces
│   ├── _usecase/<dominio>/          # contratos de usecases (I<Nome>UseCase)
│   ├── _services/<nome>/            # contratos de serviços externos (I<Nome>Service)
│   ├── db/
│   │   ├── entities/                # interfaces de entidades (I<Entity>) + enums
│   │   ├── repositories/<agregado>/ # contratos de repositories (I<Verbo><Entity>Repository)
│   │   └── transaction.handler.ts   # ITransactionHandler
├── application/                     # CAMADA LIMPA: implementações de usecases
│   ├── <dominio>/**                 # usecases (um arquivo por usecase)
│   ├── _shared/                     # helpers compartilhados da aplicação
│   ├── error.ts                     # AppError (único tipo de erro de domínio)
│   └── response.ts                  # Response.success/error (envelope de resposta)
└── infra/                           # CAMADA SUJA: implementações concretas
    ├── http/nestjs/src/
    │   ├── main.ts                  # bootstrap HTTP
    │   ├── app.module.ts            # módulo raiz (importa módulos de domínio)
    │   ├── error.filter.ts          # filtro global de erros HTTP
    │   ├── _modules/<dominio>/      # module|controller|service + dto/
    │   ├── _guards/                 # guards customizados (auth, níveis, permissões)
    │   ├── _decorators/             # decorators customizados
    │   ├── _shared/                 # exception-filter/, middlewares/, jwt/
    │   ├── proxy/repository.proxy.module.ts  # providers de Repository<T> do TypeORM
    │   ├── db/                      # database.module.ts + database.provider.ts (token DATABASE)
    │   └── routines/                # cron jobs (@Cron de @nestjs/schedule)
    ├── db/typeorm/postgresql/
    │   ├── entities/                # schemas TypeORM (EntitySchema, export <Entity>Schema)
    │   ├── migrations/              # migrations oficiais
    │   ├── repositories/<agregado>/ # implementações de repositories
    │   ├── transaction.handler.ts   # TransactionHandler (begin/commit/rollback)
    │   └── postgresql.ormconfig.ts  # DataSource + dotenv.config()
    ├── services/<vendor>/           # implementações de serviços externos (um por vendor)
    └── adapters/<tipo>/             # adapters genéricos de HTTP/storage
tests/
├── application/<dominio>/           # specs de usecases (espelha core/application)
└── infra/
```

Aliases de path (usar nos imports, `tsconfig.json`): `@domain/*`, `@application/*`, `@infra/*`, `@nest/*`, `@typeorm/*`.

---

# 3. Regras de Camadas (hard rules)

1. `core/domain/**` e `core/application/**` são camadas limpas:
    - **Proibido** decorators/injeção de framework (Nest, TypeORM), imports de libs de infra (typeorm) e acesso a `process.env`.
    - Dependa sempre de **interfaces** (contratos), nunca de implementações concretas.
2. `core/infra/**` é a única camada que conhece TypeORM, HTTP, SDKs de terceiros e env vars.
3. Todo contrato de interface começa com `I` (`IUserRepository`, `ICreateUserUseCase`).
4. Contratos de **usecase** e **repository** expõem **apenas um método `execute()`** com params de entrada e saída tipados. Contratos de **service** podem ter vários métodos com nomes de ação (`sendEmail`, `createPixKey`).
5. Espelhamento obrigatório de pastas:
    - usecase `core/application/<dominio>/x.usecase.ts` ↔ contrato `core/domain/_usecase/<dominio>/x.usecase.ts` ↔ spec `tests/application/<dominio>/x.usecase.spec.ts`.
    - repository idem entre `core/domain/db/repositories/<agregado>/` e `core/infra/db/typeorm/postgresql/repositories/<agregado>/`.
6. DTOs de entrada vindos de HTTP **não** são importados por domain/application. Contratos e usecases usam types/interfaces próprios definidos no lado limpo; a conversão DTO → input acontece no service/controller (camada HTTP).

---

# 4. Injeção de Dependência (padrão exclusivo: factory providers)

A DI é **100% manual, por factory e posicional**. Não usar `@Injectable()` + `@Inject()` em usecases/repositories. A cadeia é:

```
Controller → Service → UseCase → Repository
```

## 4.1 RepositoryProxyModule (`core/infra/http/nestjs/src/proxy/repository.proxy.module.ts`)

- Centraliza os `Repository<T>` do TypeORM. Cada entidade tem **uma constante de token string estática**:
  `static USER_REPOSITORY = 'UserRepository';`
- `register()` retorna um `DynamicModule` com um provider por schema:
  `{ provide: RepositoryProxyModule.USER_REPOSITORY, useFactory: (dataSource: DataSource) => dataSource.getRepository(UserSchema), inject: [DATABASE] }`
  onde `DATABASE` vem de `core/infra/http/nestjs/src/db/database.provider.ts` (inicializa o `DataSource` do ormconfig).
- Uso nos módulos: `imports: [RepositoryProxyModule.register()]`.

## 4.2 Registro de providers no módulo Nest

Toda classe concreta (repository, usecase, service) é registrada com `useFactory`, injetando o **token da classe concreta** (ou token string do proxy). **A ordem dos params da factory é EXATAMENTE a ordem do construtor**:

```ts
@Module({
    imports: [RepositoryProxyModule.register()],
    controllers: [UserController],
    providers: [
        {
            provide: FindUserByIdRepository,
            useFactory: (repo: Repository<IUser>) =>
                new FindUserByIdRepository(repo),
            inject: [RepositoryProxyModule.USER_REPOSITORY],
        },
        {
            provide: GetUserByIdUseCase,
            useFactory: (findUserByIdRepository: IFindUserByIdRepository) =>
                new GetUserByIdUseCase(findUserByIdRepository),
            inject: [FindUserByIdRepository],
        },
        {
            provide: UserService,
            useFactory: (getUserByIdUseCase: IGetUserByIdUseCase) => new UserService(getUserByIdUseCase),
            inject: [GetUserByIdUseCase],
        },
    ],
})
export class UserModule {}
```

## 4.3 Construtores (camadas limpas)

Constructor injection manual, resolvida por posição — sem decorators:

```ts
export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  constructor(
    private readonly findUserByIdRepository: IFindUserByIdRepository,
    private readonly cacheService: ICacheService,
  ) {}
  async execute(id: string): Promise<IUser> { ... }
}
```

Regra: quando um módulo crescer, prefira **um provider de service por agregado com params object** (`{ getUser: IGetUserByIdUseCase, ... }`) a providers gigantes repetidos. Não duplique providers já existentes em outro módulo — extraia para um módulo compartilhado com `exports`.

---

# 5. HTTP Runtime

## 5.1 Bootstrap (`main.ts`)

- `NestFactory.create(AppModule, { logger })` com níveis de log condicionais a `IS_PRODUCTION`.
- `app.setGlobalPrefix('api/v1')`, `app.enableCors()` e Swagger em `/doc`.
- Filtros e pipes **globais**:
  `app.useGlobalFilters(new DatabaseFilter(), new ErrorFilter());`
  `app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));`
- `app.listen(process.env.PORT || 3000)`; a API é HTTP-only.

## 5.2 Módulos de domínio (`_modules/<dominio>/`)

- Um módulo por domínio/agregado: `<dominio>.module.ts`, `<dominio>.controller.ts`, `<dominio>.service.ts`, opcional `<dominio>.schedule.ts` e `dto/`.
- Controllers extras por agregado ficam na mesma pasta (ex.: `user-address.controller.ts`).
- `AppModule` importa os módulos de domínio + providers globais (ex.: `JwtModule.register({ global: true, ... })`).

## 5.3 Controllers e endpoints

- Classe `@Controller()` **sem prefixo**; o path vai no método (`@Get('statement')`, `@Post('users')`).
- Stack de decorators por rota:
  `@ApiBearerAuth()`
  `@UsePipes(new ValidationPipe({ transform: true }))`
  `@ApiResponse({ type: GetUserResponseDto })`
  `@Get('users/:id')`
- Guards e decorators customizados vivem em `_guards/` e `_decorators/` — crie novos lá, não no módulo.
- **Anti-IDOR (hard rule):** IDs de recurso autenticado vêm do token (`req.user.id`), nunca do payload/query do cliente. O payload só carrega dados de negócio.
- O **Service** é o adapter: recebe o DTO, chama `usecase.execute()`, devolve o resultado. Não criar camada presenter.

## 5.4 DTOs e validação

- DTOs de request em `_modules/<dominio>/dto/<nome>.dto.ts` (kebab-case, sufixo `.dto.ts`), validados com class-validator:
  `@IsNotEmpty() @IsEmail() email: string;`
  `@IsOptional() @IsString() name?: string;`
- DTOs de response para Swagger no mesmo arquivo (`Res...Dto` / `...ResponseDto`).

---

# 6. Erros, Respostas e Filtros

## 6.1 AppError (`core/application/error.ts`)

Único erro de domínio:
`throw new AppError('Usuário não encontrado');` // status 400 default
`throw new AppError('Não autorizado', 403, { reason: 'x' });`

Possui `toJSON()` para manter as propriedades do erro em serialização segura.

## 6.2 Envelope de resposta (`core/application/response.ts`)

Toda resposta segue `{ data, statusCode, message }` via `Response.success(data, 200)` / `Response.error(data, message, status)`.

## 6.3 Filtros

- **`ErrorFilter`** (`error.filter.ts`): global, declarado **sem argumento em `@Catch()`**. Ramifica: `AppError` → envelope; array de erros do class-validator → primeiro erro, 400; `HttpException` → `getStatus()`; objeto `{statusCode, message}` serializado → repassa; fallback 500 com mensagem genérica.
- **`DatabaseFilter`**: `@Catch(DatabaseError)`, apenas loga.

---

# 7. Persistência

## 7.1 Entities (domain vs TypeORM)

- Domain: interface + enums, sem decorators, em `core/domain/db/entities/<entidade>.entity.ts` (export `I<Entity>`).
- Infra: **`EntitySchema<I<Entity>>`** (não decorators de classe) em `core/infra/db/typeorm/postgresql/entities/<entidade>.entity.ts`, export `<Entity>Schema`. Relações, transformers e nomes de tabela ficam no schema.

### Colunas PostgreSQL `date` (datas sem horário)

- Na borda HTTP, preserve `YYYY-MM-DD` como **string** até o repository. Não use `new Date(dto.date)` nem `toISOString()` para colunas `date`: isso introduz fuso e pode persistir um dia a menos.
- Os contratos de entidades que refletem o TypeORM aceitam `Date | string | null`, pois o driver PostgreSQL normalmente devolve `date` como string.
- Idade, streak e comparações de calendário extraem ano/mês/dia da string; para cálculos UTC, use `Date.UTC(ano, mês - 1, dia)` sem construir uma data local.
- Datas privadas continuam fora de DTOs públicos. Testes devem cobrir strings como `1990-05-10`, inclusive em timezone `America/Sao_Paulo`.

## 7.2 Repositories

- Contrato: um por arquivo, `I<Verbo><Entity>Repository`, `execute()` único. CRUDs simples podem reusar `IBaseRepository<T, A>` de `core/domain/db/repositories/base.repository.ts`.
- Implementação: **composição** (não herdar `Repository`), recebendo `Repository<T>` no construtor:

```ts
export class FindUserByIdRepository implements IFindUserByIdRepository {
  constructor(private readonly userRepository: Repository<IUser>) {}
  async execute(id: string, queryRunner?: any): Promise<IUser> { ... }
}
```

- Assinatura padrão: `execute(data, queryRunner?)`. Se `queryRunner` for passado, use `queryRunner.manager.getRepository(XxxSchema)` (permite lock pessimista com `setLock('pessimistic_write')`); senão use o `Repository` injetado.
- Um arquivo por operação: `find-user-by-id.repository.ts`.

## 7.3 Transações (`TransactionHandler`)

```ts
const queryRunner = await this.transactionHandler.begin(true);
try {
    const user = await this.findUserByIdRepository.execute(id, queryRunner);
    await this.insertLogRepository.execute(log, queryRunner); // MESMO queryRunner
    await this.transactionHandler.commit(queryRunner);
} catch (e) {
    await this.transactionHandler.rollback(queryRunner);
    throw e;
}
```

Hard rule: dentro de uma transação, **todo** repository envolvido recebe o mesmo `queryRunner`.

## 7.4 Índices

Índices existem para servir **queries reais de leitura** — nunca "por precaução". Antes de criar um, identifique o SQL (WHERE + ORDER BY + JOIN) que ele acelera e registre a justificativa.

1. **Ordem de colunas em índice composto**: igualdade (`=`) → range (`>`, `<`) → ordenação (`ORDER BY`). Ex.: `(user_id, consented_at DESC)` serve `WHERE user_id = $1 ORDER BY consented_at DESC`.
2. **Alinhe ao ORDER BY**: se a leitura é "mais recente primeiro", declare a coluna `DESC` no índice — scan ordenado sem sort no heap.
3. **Índice parcial (WHERE)** quando a query tem filtro estável e seletivo: `WHERE revoked_at IS NULL` para "sessões ativas", `WHERE consumed_at IS NULL` para OTPs válidos. Menor, mais rápido e mais barato de manter.
4. **Toda FK usada em lookup ou `ON DELETE CASCADE` tem índice na tabela filha** — o Postgres NÃO cria automaticamente; deletes do pai viram seq scan sem ele.
5. **Sem redundância**: UNIQUE já é índice; um índice composto cobre lookups por seu prefixo esquerdo — não duplique `(a)` se existe `(a, b)`.
6. **Sem índice para escrita pura**: colunas só de filtro em rotinas de purge/cleanup não merecem índice; a rotina roda em baixo volume.
7. Criados via **migration SQL raw**, nomeados `idx_<tabela>_<colunas>[_cond]`, com `DROP INDEX` correspondente no `down`.

Checklist de PR: todo índice novo indica a query que serve + EXPLAIN mostrando o uso. Índice sem query existente = proibido.

---

# 9. Serviços Externos

- Contrato em `core/domain/_services/<nome>/` (`I<Nome>Service` + DTOs de input/output tipados).
- Implementação em `core/infra/services/<vendor>/<vendor>.service.ts`.
- Nunca chamar SDK/HTTP externo direto de usecase: sempre via contrato, registrado como provider no módulo.

---

# 10. Configuração de Ambiente

- `dotenv.config({ path: '.env' })` é chamado **uma única vez** no `postgresql.ormconfig.ts` (importado cedo). Não usar `ConfigModule`.
- Env vars lidas via `process.env.*`; `.env.example` deve documentar todas as variáveis obrigatórias. Ao adicionar dependência de nova env var, atualize o `.env.example`.

---

# 11. Migrations

- Diretório oficial: `core/infra/db/typeorm/postgresql/migrations`.
- Padrão: `<timestamp>-<NomeSemantico>.ts`, classe implementando `MigrationInterface` com propriedade `name` (ex.: `CreateUsers1792000000000`).
- **SQL raw** via `queryRunner.query(...)`, sem lógica JS embutida, exceto valor fixo solicitado ou manipulação de dado legado.
- `up` e `down` **completos e reversíveis**; todo índice/FK/constraint criado no `up` é removido no `down`.
- Coluna nova obrigatória: adicionar nullable → backfill → validar ausência de NULL → `SET NOT NULL`.
- Em migração de dados críticos, falhar explicitamente se houver inconsistência.

---

# 12. Nomenclatura

| Componente                        | Padrão                                           | Exemplo                                          |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Usecase (contrato e impl.)        | `<verbo>-<objeto>.usecase.ts`                    | `create-user.usecase.ts`                         |
| Repository (contrato e impl.)     | `<verbo>-<entidade>.repository.ts`               | `find-user-by-id.repository.ts`                  |
| Entity domain                     | `<entidade>.entity.ts` (export `I<Entity>`)      | `user.entity.ts`                                 |
| Schema TypeORM                    | `<entidade>.entity.ts` (export `<Entity>Schema`) | `user.entity.ts`                                 |
| Module/Controller/Service         | `<dominio>.{module,controller,service}.ts`       | `user.module.ts`                                 |
| Schedule/Routine                  | `<nome>.{schedule,routine}.ts`                   | `user.schedule.ts`                               |
| Guard/Decorator/Filter/Middleware | `<nome>.{guard,decorator,filter,middleware}.ts`  | `auth.guard.ts`                                  |
| DTO                               | `<nome>.dto.ts`                                  | `create-user.dto.ts`                             |
| Migration                         | `<timestamp>-<Nome>.ts`                          | `1792000000000-CreateUsers.ts`                   |
| Teste                             | `<nome>.spec.ts`                                 | `create-user.usecase.spec.ts`                    |
| Arquivos/pastas                   | kebab-case                                       | `user-address/`, `find-user-by-id.repository.ts` |

Infra compartilhada do runtime HTTP usa prefixo `_`: `_modules`, `_shared`, `_guards`, `_decorators`.

---

# 13. Playbooks

## 13.1 Novo endpoint

1. DTO de request com class-validator em `_modules/<dominio>/dto/` (e DTO de response se exposto no Swagger).
2. Método no `<dominio>.service.ts` chamando o usecase.
3. Rota no controller com guards/decorators adequados + `@ApiResponse`.
4. IDs do recurso autenticado vindos do token, não do payload.
5. Se o usecase não existir, seguir 13.2.

## 13.2 Novo usecase

1. Contrato `I<Nome>UseCase` em `core/domain/_usecase/<dominio>/`.
2. Implementação em `core/application/<dominio>/` com constructor injection por interface.
3. Registrar provider `useFactory` no módulo (ordem dos params = ordem do construtor).
4. Se houver testes, spec em `tests/application/<dominio>/` (espelhar pasta).

## 13.3 Nova entidade (checklist obrigatório)

1. Interface `I<Entity>` + enums em `core/domain/db/entities`.
2. `<Entity>Schema` (EntitySchema) em `core/infra/db/typeorm/postgresql/entities`.
3. Constante de token + provider no `RepositoryProxyModule`.
4. Contratos de repository em `core/domain/db/repositories/<agregado>/`.
5. Implementações em `core/infra/db/typeorm/postgresql/repositories/<agregado>/`.
6. Providers `useFactory` no módulo Nest correspondente.
7. Migration com `up`/`down` completos no diretório oficial.
8. Build OK: `npx tsc -p tsconfig.build.json --noEmit --incremental false`.

## 13.4 Novo serviço externo

1. Contrato + DTOs em `core/domain/_services/<nome>/`.
2. Implementação em `core/infra/services/<vendor>/`.
3. Provider no módulo consumidor; usar via interface.

---

# 14. Checklist Mínimo de PR

- [ ] Build OK (`npx tsc -p tsconfig.build.json --noEmit --incremental false`).
- [ ] Camadas respeitadas (domain/application sem dependência de infra).
- [ ] Contratos com `I`, `execute()` único para usecase/repository.
- [ ] Providers registrados via `useFactory` com ordem de params correta.
- [ ] Erros de domínio via `AppError`; respostas no envelope `Response`.
- [ ] IDs de recurso autenticado vindos do token.
- [ ] TDD executado: evidência de RED inicial e GREEN final para cada mudança de comportamento.
- [ ] Novas env vars documentadas no `.env.example`.

### Quando houver migration no PR

- [ ] Diretório oficial, `up`/`down` completos, SQL raw.
- [ ] Backfill/validação + `SET NOT NULL` para coluna obrigatória.
- [ ] Índices novos seguem §7.4 (query que serve + sem redundância).
