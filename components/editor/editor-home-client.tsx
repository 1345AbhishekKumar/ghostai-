"use client"

import { Plus } from "lucide-react"

import { EditorLayout } from "@/components/editor/editor-layout"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"
import { type EditorProject } from "@/types/editor-project"

interface EditorHomeClientProps {
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}

export function EditorHomeClient({ ownedProjects, sharedProjects }: EditorHomeClientProps) {
  const {
    selectedProject,
    createProjectName,
    renameProjectName,
    createRoomIdPreview,
    isCreateDialogOpen,
    isRenameDialogOpen,
    isDeleteDialogOpen,
    loading,
    setCreateProjectName,
    setRenameProjectName,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    submitCreateProject,
    submitRenameProject,
    submitDeleteProject,
  } = useProjectActions({
    ownedProjects,
    sharedProjects,
  })

  return (
    <EditorLayout
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      onCreateProject={openCreateDialog}
      onRenameProject={openRenameDialog}
      onDeleteProject={openDeleteDialog}
      title="Editor Dashboard"
    >
      <section className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-3xl rounded-3xl border border-border/80 bg-card/70 p-6 shadow-2xl shadow-background/30 backdrop-blur md:p-10">
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/20 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            ARCHITECTURE WORKSPACE
          </div>
          <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-foreground">
                Create a project or open one from your workspace.
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Start a new system design canvas, collaborate in real time, and generate a technical spec when your architecture is ready.
              </p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Button type="button" size="lg" onClick={openCreateDialog}>
                <Plus className="size-4" />
                New Project
              </Button>
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">My projects</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{ownedProjects.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Shared with me</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{sharedProjects.length}</p>
            </div>
          </div>
        </div>
      </section>
      <ProjectDialogs
        isCreateDialogOpen={isCreateDialogOpen}
        isRenameDialogOpen={isRenameDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        createProjectName={createProjectName}
        renameProjectName={renameProjectName}
        createRoomIdPreview={createRoomIdPreview}
        selectedProjectName={selectedProject?.name ?? "this project"}
        loading={loading}
        onCreateProjectNameChange={setCreateProjectName}
        onRenameProjectNameChange={setRenameProjectName}
        onCloseDialog={closeDialog}
        onSubmitCreateProject={submitCreateProject}
        onSubmitRenameProject={submitRenameProject}
        onSubmitDeleteProject={submitDeleteProject}
      />
    </EditorLayout>
  )
}
