"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { type EditorProject } from "@/types/editor-project"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCreateProject: () => void
  onRenameProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
  currentProjectId?: string
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

function ProjectList({
  projects,
  showActions = false,
  emptyLabel = "No projects yet.",
  onRenameProject,
  onDeleteProject,
  currentProjectId,
}: {
  projects: EditorProject[]
  showActions?: boolean
  emptyLabel?: string
  onRenameProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
  currentProjectId?: string
}) {
  if (projects.length === 0) {
    return <EmptyState label={emptyLabel} />
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <li
          key={project.id}
          className={cn(
            "group flex items-center gap-2 rounded-xl border px-2 py-2 transition-colors",
            project.id === currentProjectId
              ? "border-primary/50 bg-primary/10"
              : "border-border/80 bg-card/50 hover:bg-muted/30"
          )}
        >
          <Link href={`/editor/${project.id}`} className="min-w-0 flex-1 rounded-lg px-1 py-1">
            <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{project.roomId}</p>
          </Link>
          {showActions ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename ${project.name}`}
                onClick={(event) => {
                  event.preventDefault()
                  onRenameProject?.(project.id)
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${project.name}`}
                onClick={(event) => {
                  event.preventDefault()
                  onDeleteProject?.(project.id)
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  ownedProjects,
  sharedProjects,
  currentProjectId,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close project sidebar"
          className="fixed inset-0 top-14 z-30 bg-background/70 md:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-80 max-w-[calc(100vw-0.5rem)] border-r border-border/80 bg-card/88 p-4 shadow-2xl shadow-background/65 backdrop-blur transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+80px)]"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col gap-4">
          <div className="space-y-3">
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
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground">Workspace overview</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border/70 bg-card/70 px-2 py-2">
                  <p className="text-[11px] text-muted-foreground">Owned</p>
                  <p className="text-sm font-semibold text-foreground">{ownedProjects.length}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/70 px-2 py-2">
                  <p className="text-[11px] text-muted-foreground">Shared</p>
                  <p className="text-sm font-semibold text-foreground">{sharedProjects.length}</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="my-projects" className="min-h-0 flex-1">
            <TabsList className="w-full bg-muted/40">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
            <TabsContent value="my-projects" className="mt-3">
              <ProjectList
                projects={ownedProjects}
                showActions
                onRenameProject={onRenameProject}
                onDeleteProject={onDeleteProject}
                currentProjectId={currentProjectId}
              />
            </TabsContent>
            <TabsContent value="shared" className="mt-3">
              <ProjectList projects={sharedProjects} emptyLabel="No shared projects yet." currentProjectId={currentProjectId} />
            </TabsContent>
          </Tabs>

          <Button type="button" className="w-full" onClick={onCreateProject}>
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
