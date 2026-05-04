import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/editor/access-denied"
import { EditorWorkspaceClient } from "@/components/editor/editor-workspace-client"
import { checkProjectAccess, getCurrentUserIdentity, getSignInPath } from "@/lib/project-access"
import { getEditorProjectsForCurrentUser } from "@/lib/project-data"

interface EditorProjectPageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function EditorProjectPage({
  params,
}: EditorProjectPageProps) {
  const { roomId } = await params

  const identity = await getCurrentUserIdentity()
  if (!identity) {
    redirect(getSignInPath())
  }

  // Check project access
  const project = await checkProjectAccess(roomId)

  // If no access, show denied screen
  if (!project) {
    return <AccessDenied />
  }

  // Fetch all projects for the sidebar
  const { ownedProjects, sharedProjects } = await getEditorProjectsForCurrentUser()

  return (
    <EditorWorkspaceClient
      roomId={roomId}
      project={{
        id: project.id,
        name: project.name,
      }}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  )
}
