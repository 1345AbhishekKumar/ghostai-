"use client"

import { useState, useMemo } from "react"
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"
import { Bot, Share2, LayoutTemplate, Cloud, CloudUpload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { EditorLayout } from "@/components/editor/editor-layout"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { WorkspaceCanvas } from "@/components/editor/workspace-canvas"
import { AiSidebar } from "@/components/editor/ai-sidebar"
import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"
import { type EditorProject } from "@/types/editor-project"
import { type CanvasTemplate } from "@/components/editor/starter-templates"
import { ReactFlowProvider, useReactFlow } from "@xyflow/react"
import { type SaveStatus } from "@/hooks/use-canvas-autosave"

interface EditorWorkspaceClientProps {
  roomId: string
  project: {
    id: string
    name: string
  }
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <Cloud className="size-3.5" />
        <span>Saved</span>
      </div>
    )
  }

  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-500">
        <CloudUpload className="size-3.5 animate-pulse" />
        <span>Saving...</span>
      </div>
    )
  }

  if (status === "saved") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-500">
        <CheckCircle2 className="size-3.5" />
        <span>Saved</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive">
      <AlertCircle className="size-3.5" />
      <span>Error saving</span>
    </div>
  )
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="rounded-2xl border border-border/80 bg-card/70 px-5 py-4">
        <p className="text-sm text-muted-foreground">Initializing workspace...</p>
      </div>
    </div>
  )
}

function EditorWorkspaceClientInner({
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
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const { setNodes, setEdges, fitView } = useReactFlow()

  const handleImportTemplate = (template: CanvasTemplate) => {
    setNodes(template.nodes)
    setEdges(template.edges)
    setIsTemplatesOpen(false)
    // Fit view after state transition
    setTimeout(fitView, 100)
  }

  return (
    <EditorLayout
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      onCreateProject={openCreateDialog}
      onRenameProject={openRenameDialog}
      onDeleteProject={openDeleteDialog}
      currentProjectId={project.id}
      title={project.name}
      isRightPanelOpen={isAiSidebarOpen}
      navbarActions={
        <>
          <SaveStatusIndicator status={saveStatus} />
          <Button type="button" variant="outline" onClick={() => setIsTemplatesOpen(true)}>
            <LayoutTemplate className="size-4" />
            Templates
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsShareOpen(true)}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button 
            type="button" 
            variant={isAiSidebarOpen ? "secondary" : "ghost"} 
            size="icon" 
            aria-label="AI assistant panel"
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
          >
            <Bot className="size-4" />
          </Button>
        </>
      }
      rightPanel={<AiSidebar roomId={roomId} projectId={project.id} />}
      contentClassName="h-[calc(100vh-3.5rem)]"
    >

      <ShareDialog open={isShareOpen} onOpenChange={setIsShareOpen} projectId={project.id} />
      <StarterTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} onImport={handleImportTemplate} />
      <WorkspaceCanvas roomId={roomId} onSaveStatusChange={setSaveStatus} />
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

import { SpecStoreProvider } from "@/store/spec-store-provider"

export function EditorWorkspaceClient(props: EditorWorkspaceClientProps) {
  return (
    <ReactFlowProvider>
      <SpecStoreProvider projectId={props.project.id}>
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
          <RoomProvider
            id={props.roomId}
            initialPresence={{
              cursor: null,
              thinking: false,
            }}
            initialStorage={{
              // "flow" must be present to satisfy the Storage type.
              // If the room already has a "flow" entry in Liveblocks cloud,
              // this initial value is ignored and the persisted data takes over.
              flow: new LiveObject({
                nodes: new LiveMap(),
                edges: new LiveMap(),
              }),
              "ai-status-feed": new LiveObject({}),
              "ai-chat": new LiveList([]),
            }}
          >
            <ClientSideSuspense fallback={<CanvasLoadingState />}>
              {() => <EditorWorkspaceClientInner {...props} />}
            </ClientSideSuspense>
          </RoomProvider>
        </LiveblocksProvider>
      </SpecStoreProvider>
    </ReactFlowProvider>
  )
}
