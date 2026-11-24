const goals = ["Relaxar", "Tomar banho", "Surfar"];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <p className="text-lg font-semibold tracking-tight">Praia Certa</p>
        <p className="text-sm text-muted-foreground">Florianópolis</p>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-16 sm:px-8 sm:py-24">
        <section className="max-w-3xl" aria-labelledby="hero-title">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            Condições do tempo e do mar, sem cadastro
          </p>
          <h1
            id="hero-title"
            className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
          >
            Encontre a praia certa para o seu momento.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
            Compare previsões de chuva, vento, rajadas e ondas para escolher
            onde aproveitar Florianópolis, com recomendações claras e
            alternativas para cada objetivo.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3" aria-label="Objetivos disponíveis">
            {goals.map((goal) => (
              <li
                key={goal}
                className="rounded-full border bg-card px-4 py-2 text-sm font-medium"
              >
                {goal}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
