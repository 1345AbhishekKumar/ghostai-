import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { type EditorProject } from "@/types/editor-project"

interface EditorProjectsResult {
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
}

function mapProject(project: { id: string; name: string }, isOwned: boolean): EditorProject {
  return {
    id: project.id,
    name: project.name,
    roomId: project.id,
    isOwned,
  }
}

export async function getEditorProjectsForCurrentUser(): Promise<EditorProjectsResult> {
  const { userId } = await auth()

  if (!userId) {
    return { ownedProjects: [], sharedProjects: [] }
  }

  const user = await currentUser()
  const userEmails = user?.emailAddresses.map((email) => email.emailAddress) ?? []

  const ownedProjectsQuery = prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  })

  const sharedProjectsQuery =
    userEmails.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: {
                email: {
                  in: userEmails,
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true },
        })
      : Promise.resolve([])

  const [ownedProjects, sharedProjects] = await Promise.all([
    ownedProjectsQuery,
    sharedProjectsQuery,
  ])

  return {
    ownedProjects: ownedProjects.map((project) => mapProject(project, true)),
    sharedProjects: sharedProjects.map((project) => mapProject(project, false)),
  }
}
