import { auth, currentUser } from "@clerk/nextjs/server"
import { get, put } from "@vercel/blob"

import { prisma } from "@/lib/prisma"

interface CanvasRouteContext {
  params: Promise<{
    projectId: string
  }>
}

async function getProjectAccess(projectId: string, userId: string, emails: string[]) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true, canvasJsonPath: true },
  })

  if (!project) {
    return { error: Response.json({ error: "Project not found" }, { status: 404 }) }
  }

  if (project.ownerId === userId) {
    return { project, isOwner: true as const }
  }

  if (emails.length === 0) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }
  }

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: {
      projectId,
      email: {
        in: emails,
      },
    },
    select: { id: true },
  })

  if (!collaborator) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { project, isOwner: false as const }
}

export async function GET(_request: Request, context: CanvasRouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const userEmails = user?.emailAddresses.map((email) => email.emailAddress.toLowerCase()) ?? []

    const { projectId } = await context.params
    const access = await getProjectAccess(projectId, userId, userEmails)
    if ("error" in access) {
      return access.error
    }

    const blobUrl = access.project.canvasJsonPath
    if (!blobUrl) {
      return Response.json({ canvas: null })
    }

    try {
      const blob = await get(blobUrl, {
        access: "private",
      })

      if (!blob || blob.statusCode !== 200) {
        return Response.json({ error: "Failed to fetch canvas data" }, { status: 500 })
      }

      const canvas = await new Response(blob.stream).json()
      return Response.json({ canvas })
    } catch (error) {
      console.error("GET Canvas Blob Error:", error)
      return Response.json({ error: "Failed to fetch canvas data" }, { status: 500 })
    }
  } catch (error) {
    console.error("GET Canvas Error:", error)
    return Response.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, context: CanvasRouteContext) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    const userEmails = user?.emailAddresses.map((email) => email.emailAddress.toLowerCase()) ?? []

    const { projectId } = await context.params
    const access = await getProjectAccess(projectId, userId, userEmails)
    if ("error" in access) {
      return access.error
    }

    try {
      const body = await request.text()
      
      const filename = `projects/${projectId}/canvas-${Date.now()}.json`
      const blob = await put(filename, body, {
        access: "private",
        contentType: "application/json",
      })

      await prisma.project.update({
        where: { id: projectId },
        data: { canvasJsonPath: blob.url },
      })

      return Response.json({ success: true, url: blob.url })
    } catch (error) {
      console.error("PUT Canvas Blob/Prisma Error:", error)
      return Response.json({ error: "Failed to save canvas data" }, { status: 500 })
    }
  } catch (error) {
    console.error("PUT Canvas Error:", error)
    return Response.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
