import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface DialogPatternProps {
  title: string
  description?: string
  children?: ReactNode
  footerActions?: ReactNode
  className?: string
}

export function DialogPattern({
  title,
  description,
  children,
  footerActions,
  className,
}: DialogPatternProps) {
  return (
    <section
      className={cn(
        "w-full rounded-3xl border border-border bg-card text-card-foreground",
        className
      )}
    >
      <div className="space-y-2 p-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {children ? <div className="px-6 pb-6">{children}</div> : null}

      {footerActions ? (
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/50 px-6 py-4">
          {footerActions}
        </footer>
      ) : null}
    </section>
  )
}
