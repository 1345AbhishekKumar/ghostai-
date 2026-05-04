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
    >
      <section className="flex flex-1 items-center justify-center px-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Create a project or open an existing one
          </h1>
          <p className="text-sm text-muted-foreground">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <div className="flex justify-center">
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="size-4" />
              New Project
            </Button>
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
