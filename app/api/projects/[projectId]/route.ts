import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

interface ProjectRouteContext {
  params: Promise<{
    projectId: string
  }>
}

interface RenameProjectBody {
  name?: unknown
}

function validateRenameProjectName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

async function getAuthorizedProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  })

  if (!project) {
    return { error: Response.json({ error: "Project not found" }, { status: 404 }) }
  }

  if (project.ownerId !== userId) {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { project }
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: RenameProjectBody

  try {
    body = (await request.json()) as RenameProjectBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = validateRenameProjectName(body.name)

  if (!name) {
    return Response.json({ error: "Project name is required" }, { status: 400 })
  }

  const { projectId } = await context.params
  const authorization = await getAuthorizedProject(projectId, userId)

  if ("error" in authorization) {
    return authorization.error
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  return Response.json({ project })
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await context.params
  const authorization = await getAuthorizedProject(projectId, userId)

  if ("error" in authorization) {
    return authorization.error
  }

  await prisma.project.delete({
    where: { id: projectId },
  })

  return Response.json({ success: true })
}
