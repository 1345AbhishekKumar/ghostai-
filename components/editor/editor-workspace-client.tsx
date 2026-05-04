"use client"

import { useState } from "react"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"
import { type EditorProject } from "@/types/editor-project"

interface EditorWorkspaceClientProps {
  project: {
    id: string
    name: string
  }
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}

export function EditorWorkspaceClient({
  project,
  ownedProjects,
  sharedProjects,
}: EditorWorkspaceClientProps) {
  // Use the same project actions hook as the editor home
  const {
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

  const [isShareOpen, setIsShareOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <EditorNavbar
        isSidebarOpen={true}
        onToggleSidebar={() => {}}
      />
      <div className="flex flex-1">
        <aside className="border-border border-r bg-background">
          <ProjectSidebar
            isOpen={true}
            onClose={() => {}}
            onCreateProject={openCreateDialog}
            onRenameProject={openRenameDialog}
            onDeleteProject={openDeleteDialog}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            currentProjectId={project.id}
          />
        </aside>

        <main className="flex flex-1 flex-col">
          {/* Top navbar with project name */}
          <div className="border-border bg-background flex h-14 items-center border-b px-6">
            <h1 className="text-text-primary text-lg font-semibold">
              {project.name}
            </h1>
            <div className="flex flex-1" />
            <div className="flex gap-2">
              <Button type="button" onClick={() => setIsShareOpen(true)}>
                Share
              </Button>
              {/* AI sidebar toggle placeholder */}
              <div className="bg-surface-secondary h-8 w-20 rounded" />
            </div>
          </div>

          <ShareDialog open={isShareOpen} onOpenChange={(open) => { if (!open) setIsShareOpen(false) }} projectId={project.id} />



          {/* Canvas area with placeholder */}
          <div className="flex flex-1 items-center justify-center bg-gray-950">
            <div className="text-center">
              <p className="text-text-secondary text-sm">
                Canvas placeholder
              </p>
              <p className="text-text-muted mt-2 text-xs">
                Real canvas logic coming soon
              </p>
            </div>
          </div>
        </main>

        {/* Right sidebar placeholder for AI chat */}
        <aside className="border-border bg-background w-64 border-l" />
      </div>

      <ProjectDialogs
        createProjectName={createProjectName}
        renameProjectName={renameProjectName}
        createRoomIdPreview={createRoomIdPreview}
        isCreateDialogOpen={isCreateDialogOpen}
        isRenameDialogOpen={isRenameDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        selectedProjectName={project.name}
        loading={loading}
        onCreateProjectNameChange={setCreateProjectName}
        onRenameProjectNameChange={setRenameProjectName}
        onCloseDialog={closeDialog}
        onSubmitCreateProject={submitCreateProject}
        onSubmitRenameProject={submitRenameProject}
        onSubmitDeleteProject={submitDeleteProject}
      />
    </div>
  )
}
