import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

interface CreateProjectBody {
  name?: unknown
  id?: unknown
}

const DEFAULT_PROJECT_NAME = "Untitled Project"
const PROJECT_ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function normalizeProjectName(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_PROJECT_NAME
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : DEFAULT_PROJECT_NAME
}

function normalizeProjectId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length < 3 || trimmedValue.length > 120) {
    return null
  }

  if (!PROJECT_ID_REGEX.test(trimmedValue)) {
    return null
  }

  return trimmedValue
}

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  })

  return Response.json({ projects })
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: CreateProjectBody

  try {
    body = (await request.json()) as CreateProjectBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const name = normalizeProjectName(body.name)
  const projectId = normalizeProjectId(body.id)

  if (typeof body.id !== "undefined" && !projectId) {
    return Response.json({ error: "Invalid project id" }, { status: 400 })
  }

  if (projectId) {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    })

    if (existingProject) {
      return Response.json({ error: "Project id already exists" }, { status: 409 })
    }
  }

  const project = await prisma.project.create({
    data: {
      ...(projectId ? { id: projectId } : {}),
      ownerId: userId,
      name,
    },
  })

  return Response.json({ project }, { status: 201 })
}
