import { Lock } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card/70 p-8 text-center shadow-2xl shadow-background/30">
        <Lock className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 mb-2 text-2xl font-semibold text-foreground">
          Access Denied
        </h1>
        <p className="mb-6 text-muted-foreground">
          You don&apos;t have permission to access this project.
        </p>
        <Link href="/editor">
          <Button>Back to Projects</Button>
        </Link>
      </div>
    </div>
  )
}
