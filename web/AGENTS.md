# AGENTS.md - praia-certa-web

## Source of truth

Este arquivo é a fonte principal de regras operacionais para agentes no frontend.
Siga as convenções aqui descritas sem precisar que sejam repetidas no prompt. Instruções mais específicas em subdiretórios têm precedência quando aplicável.

---

## Contexto do produto

O **Praia Certa** é uma plataforma web, mobile-first e sem necessidade de login, que ajuda moradores e turistas a escolherem a praia ideal em Florianópolis. A partir de previsões de chuva, vento, rajadas, ondas e outras condições do mar, o sistema avalia cada praia conforme o período e o objetivo do usuário — **relaxar, tomar banho ou surfar**. É possível consultar uma praia específica ou receber um ranking de recomendações, com justificativas claras e alternativas quando o destino desejado não estiver favorável.

Implicações para o frontend:

- O acesso ao conteúdo principal não pode exigir cadastro, login ou dados pessoais.
- A API é responsável pelo cálculo dos scores e do ranking. O frontend apresenta os resultados; não duplique a regra de recomendação no cliente.
- Toda recomendação deve preservar as justificativas e alternativas retornadas pela API, sem inventar explicações ou condições.
- Exiba unidades, período e horário de atualização dos dados quando fornecidos. Previsão não é garantia de segurança; não use linguagem que prometa condições seguras.
- A interface e os textos são em português do Brasil. Datas e horários locais usam `America/Sao_Paulo`; medidas usam o sistema métrico.

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# 1. Stack tecnológica

- **Next.js 16 + App Router** com Cache Components e Partial Prefetching.
- **React 19 + TypeScript estrito**.
- **Tailwind CSS 4** para estilos; os tokens visuais ficam em `src/app/globals.css`.
- **shadcn/ui + Base UI + Lucide** para componentes acessíveis e ícones. A configuração está em `components.json`.
- **Cult UI** configurada como registro `@cult-ui` em `components.json`, não como dependência npm única. Instale componentes sob demanda com `npx shadcn@latest add @cult-ui/<componente>`; não adicione componentes sem necessidade concreta.
- **ESLint** com as regras `core-web-vitals` e TypeScript do Next.
- Data fetching com `fetch` nativo em Server Components. Não adicionar cliente HTTP, gerenciador global de estado ou biblioteca de formulários sem uma necessidade concreta.
- Quando testes forem introduzidos, usar **Vitest + Testing Library** para unidade/integração e **Playwright** para fluxos de navegador, sem substituir validações manuais de acessibilidade.

# 2. Estrutura de pastas (mapa oficial)

```
src/
├── app/                              # rotas, layouts e estados loading/error do App Router
│   ├── globals.css                   # tokens Tailwind/shadcn e estilos globais
│   ├── layout.tsx                    # layout raiz, fontes e metadata global
│   └── page.tsx                      # composição da página inicial
├── components/
│   ├── ui/                           # componentes gerados/adaptados do shadcn
│   ├── layout/                       # header, footer e navegação compartilhados
│   └── shared/                       # componentes genéricos sem regra de negócio
├── config/                           # constantes públicas e configuração da aplicação
├── features/
│   ├── beaches/
│   │   ├── components/               # busca, card e detalhes de praias
│   │   ├── hooks/                    # interação específica de praias
│   │   ├── services/                 # acesso à API de praias
│   │   └── types/                    # contratos de praias
│   ├── conditions/
│   │   ├── components/               # indicadores de chuva, vento e mar
│   │   └── types/                    # condições, períodos e unidades
│   └── recommendations/
│       ├── components/               # filtros, ranking e justificativas
│       ├── hooks/                    # interação específica de recomendações
│       ├── services/                 # acesso à API de recomendações
│       └── types/                    # objetivos, scores e alternativas
├── hooks/                            # hooks realmente compartilhados entre features
├── lib/                              # utilitários genéricos e infraestrutura de API
└── types/                            # tipos globais; evitar esta pasta para tipos de uma feature
public/
└── images/beaches/                   # imagens otimizáveis das praias
```

Use o alias `@/*` para imports a partir de `src`. Pastas de rotas e arquivos usam `kebab-case`; componentes usam `PascalCase`; hooks começam com `use`.

# 3. Arquitetura e limites

1. `src/app` compõe rotas e estados de carregamento/erro. Regras e componentes reutilizáveis ficam em `features` ou `components`.
2. Componentes de uma feature podem usar `components/ui`, `components/shared`, `lib` e `config`.
3. Evite dependências entre features. Se um tipo ou componente for realmente compartilhado, promova-o para `types`, `components/shared` ou `lib`.
4. `components/ui` contém primitives visuais, sem chamadas à API ou regras do Praia Certa.
5. Services concentram URLs, parsing do envelope da API e tratamento de erros de transporte. Componentes não montam URLs manualmente.
6. Não exponha segredos ao navegador. Variáveis `NEXT_PUBLIC_*` são públicas; credenciais e a URL interna da API ficam apenas no servidor.
7. Não criar autenticação, conta de usuário ou paywall para os fluxos principais.

# 4. Server Components e interatividade

- **Server Component é o padrão.** Não adicione `"use client"` em páginas ou layouts inteiros para resolver um problema local de interatividade.
- Use Client Components apenas em folhas que precisam de estado, eventos, effects ou APIs do navegador. Mantenha suas props serializáveis e sua árvore pequena.
- Faça fetching no servidor sempre que possível. Dados compartilháveis podem usar `"use cache"` com um `cacheLife` explícito e adequado à validade da previsão.
- Dados que precisam ser atualizados a cada requisição ficam fora de `"use cache"` e devem ser envolvidos por `Suspense` quando exigidos pelo modelo de Cache Components.
- Preferências e filtros que precisam ser compartilháveis devem ser representados na URL. Não introduzir Redux/Zustand/Jotai por padrão.
- Mapas, gráficos pesados e componentes abaixo da dobra devem entrar sob demanda com dynamic import quando houver ganho real.

# 5. UI mobile-first e acessibilidade

- Projetar primeiro para telas a partir de **360 px**, com navegação utilizável em conexões móveis e uma mão.
- Conteúdo principal antes de elementos decorativos; alvos de toque com pelo menos **44 × 44 px**.
- HTML semântico, hierarquia de headings, labels associados, foco visível, navegação por teclado e textos alternativos úteis.
- Não comunicar favorabilidade apenas por cor: combinar texto/ícone e informar o motivo da avaliação.
- Respeitar `prefers-reduced-motion`; evitar animações que bloqueiem leitura ou interação.
- Toda busca ou consulta deve prever estados de loading, vazio, erro e dados indisponíveis/desatualizados.
- Para condições do mar, diferenciar claramente chuva, vento, rajada, altura/período de onda e demais métricas; não reduzir tudo a um único semáforo sem explicação.

# 6. Performance

- Usar `next/font` e `next/image`; declarar dimensões e configurar `remotePatterns` restritos para imagens externas.
- Reservar `priority` para a imagem LCP. Demais imagens usam lazy loading.
- Não importar bibliotecas grandes em componentes compartilhados do layout raiz.
- Evitar hydration desnecessária, renderizações de listas extensas no cliente e efeitos para valores deriváveis durante a renderização.
- Respeitar os limites móveis de Core Web Vitals no percentil 75: **LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1**.
- Medir antes de otimizações complexas; não adicionar Web Workers, virtualização ou cache próprio sem evidência de necessidade.

# 7. Integração com a API

- Base HTTP prevista: `/api/v1` do backend NestJS, configurada por ambiente.
- A API usa o envelope `{ data, statusCode, message }`; services devem tratá-lo em um único lugar.
- Validar dados externos na borda antes de usá-los na UI. Se for necessária uma biblioteca de schema, adotar uma única solução no projeto.
- Preservar `null`/dados ausentes; não converter ausência de previsão em zero ou condição favorável.
- Não silenciar erros: exibir mensagem útil e permitir nova tentativa quando fizer sentido.

# 8. Checklist mínimo de PR

- [ ] `npm run lint` sem erros.
- [ ] `npm run build` concluído.
- [ ] Fluxo verificado em viewport móvel e desktop, incluindo loading/erro/vazio quando aplicável.
- [ ] Sem `"use client"` ou dependência nova sem justificativa.
- [ ] Justificativas, alternativas, unidades e atualização das previsões preservadas.
- [ ] Teclado, foco, contraste, reduced motion e textos alternativos verificados nas partes alteradas.
- [ ] Nenhum segredo exposto e nenhum login exigido no fluxo principal.
- [ ] Regras e mapa deste arquivo atualizados quando a estrutura ou convenção mudar.
