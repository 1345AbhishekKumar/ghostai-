import { EditorHomeClient } from "@/components/editor/editor-home-client"
import { getEditorProjectsForCurrentUser } from "@/lib/project-data"

export default async function EditorPage() {
  const { ownedProjects, sharedProjects } = await getEditorProjectsForCurrentUser()

  return <EditorHomeClient ownedProjects={ownedProjects} sharedProjects={sharedProjects} />
}
