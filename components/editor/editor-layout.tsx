"use client"

import { type ReactNode, useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { cn } from "@/lib/utils"
import { type EditorProject } from "@/types/editor-project"

interface EditorLayoutProps {
  children: ReactNode
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
  onCreateProject: () => void
  onRenameProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => void
  currentProjectId?: string
  title?: string
  navbarActions?: ReactNode
  rightPanel?: ReactNode
  contentClassName?: string
  rightPanelClassName?: string
  isRightPanelOpen?: boolean
}

export function EditorLayout({
  children,
  ownedProjects,
  sharedProjects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  currentProjectId,
  title,
  navbarActions,
  rightPanel,
  contentClassName,
  rightPanelClassName,
  isRightPanelOpen = false,
}: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
        title={title}
        actions={navbarActions}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={onCreateProject}
        onRenameProject={onRenameProject}
        onDeleteProject={onDeleteProject}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        currentProjectId={currentProjectId}
      />
      <main
        className={cn(
          "relative min-h-[calc(100vh-3.5rem)] w-full min-w-0 transition-all duration-300",
          contentClassName
        )}
      >
        {children}
      </main>
      {rightPanel ? (
        <aside
          className={cn(
            "fixed top-[4.5rem] right-4 z-40 h-[calc(100vh-5.5rem)] w-80 rounded-2xl border border-border/80 bg-card/88 shadow-2xl shadow-background/60 backdrop-blur transition-all duration-300 xl:block",
            isRightPanelOpen ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[calc(100%+100px)] opacity-0",
            rightPanelClassName
          )}
        >
          {rightPanel}
        </aside>
      ) : null}
    </div>
  )
}
