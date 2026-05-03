"use client"

import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50 px-4 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-80 border-r border-border bg-card/95 p-4 backdrop-blur-sm transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close project sidebar"
          >
            <X className="size-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="min-h-0 flex-1">
          <TabsList className="w-full">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects">
            <EmptyState label="No projects yet." />
          </TabsContent>
          <TabsContent value="shared">
            <EmptyState label="No shared projects yet." />
          </TabsContent>
        </Tabs>

        <Button type="button" className="w-full">
          <Plus className="size-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
