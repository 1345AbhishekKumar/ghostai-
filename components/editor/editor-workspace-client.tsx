"use client"

import { useState } from "react"
import { Bot, FileText, Share2, Sparkles } from "lucide-react"
import { EditorLayout } from "@/components/editor/editor-layout"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { WorkspaceCanvas } from "@/components/editor/workspace-canvas"
import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"
import { type EditorProject } from "@/types/editor-project"

interface EditorWorkspaceClientProps {
  roomId: string
  project: {
    id: string
    name: string
  }
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}

export function EditorWorkspaceClient({
  roomId,
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
    <EditorLayout
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      onCreateProject={openCreateDialog}
      onRenameProject={openRenameDialog}
      onDeleteProject={openDeleteDialog}
      currentProjectId={project.id}
      title={project.name}
      navbarActions={
        <>
          <Button type="button" variant="outline" onClick={() => setIsShareOpen(true)}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="AI assistant panel">
            <Bot className="size-4" />
          </Button>
        </>
      }
      rightPanel={
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="size-4" />
              AI Assistant
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Generate architecture updates, annotate nodes, and draft technical specs.
            </p>
            <Button type="button" className="mt-3 w-full" disabled>
              <Bot className="size-4" />
              Coming soon
            </Button>
          </div>
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="size-4" />
              Spec Actions
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Once your graph is ready, generate a markdown spec for review and download.
            </p>
            <Button type="button" variant="outline" className="mt-3 w-full" disabled>
              Generate Spec
            </Button>
          </div>
        </div>
      }
      contentClassName="h-[calc(100vh-3.5rem)]"
    >
      <ShareDialog open={isShareOpen} onOpenChange={setIsShareOpen} projectId={project.id} />
      <div className="h-full w-full">
        <WorkspaceCanvas roomId={roomId} />
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
    </EditorLayout>
  )
}
