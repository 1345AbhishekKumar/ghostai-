import { type ReactNode } from "react"

interface AuthShellProps {
  children: ReactNode
  title: string
  description: string
  features: string[]
}

export function AuthShell({ children, title, description, features }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl">
        <section className="hidden w-1/2 flex-col justify-center border-r border-border px-12 lg:flex">
          <p className="mb-6 inline-flex w-fit rounded-xl border border-border px-3 py-1 text-sm text-foreground">
            Ghost AI
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{description}</p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>
        <section className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2 lg:px-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </div>
  )
}
