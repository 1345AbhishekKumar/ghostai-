"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type EditorProject } from "@/types/editor-project"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCreateProject: () => void
  onRenameProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50 px-4 text-center text-sm text-muted-foreground">
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
}: {
  projects: EditorProject[]
  showActions?: boolean
  emptyLabel?: string
  onRenameProject?: (projectId: string) => void
  onDeleteProject?: (projectId: string) => void
}) {
  if (projects.length === 0) {
    return <EmptyState label={emptyLabel} />
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
            <p className="truncate text-xs text-muted-foreground">{project.roomId}</p>
          </div>
          {showActions ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Rename ${project.name}`}
                onClick={() => onRenameProject?.(project.id)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${project.name}`}
                onClick={() => onDeleteProject?.(project.id)}
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
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close project sidebar"
          className="fixed inset-0 top-14 z-30 bg-black/45 md:hidden"
          onClick={onClose}
        />
      ) : null}
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
              <ProjectList
                projects={ownedProjects}
                showActions
                onRenameProject={onRenameProject}
                onDeleteProject={onDeleteProject}
              />
            </TabsContent>
            <TabsContent value="shared">
              <ProjectList projects={sharedProjects} emptyLabel="No shared projects yet." />
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
