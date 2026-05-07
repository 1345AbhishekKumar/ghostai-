"use client"

import { type ReactNode } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  title?: string
  actions?: ReactNode
  className?: string
}

const ClerkUserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
)

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  title,
  actions,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center border-b border-border/80 bg-background/95 px-3 backdrop-blur",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          onClick={onToggleSidebar}
        >
          <SidebarIcon className="size-4" />
        </Button>
        <div className="hidden rounded-xl border border-border/70 bg-card/60 px-2 py-1 text-[11px] font-medium tracking-wide text-muted-foreground sm:block">
          GHOST AI
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center px-4">
        {title ? (
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {actions}
        <ClerkUserButton />
      </div>
    </header>
  )
}
