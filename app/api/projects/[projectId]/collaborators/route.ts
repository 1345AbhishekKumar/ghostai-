import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

interface CollaboratorBody {
  email?: unknown
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

function isValidEmail(value: unknown) {
  return typeof value === "string" && /@/.test(value)
}

async function enrichWithClerk(email: string) {
  const apiKey = process.env.CLERK_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    const user = Array.isArray(data) ? data[0] : data
    if (!user) return null
    return { name: user.full_name ?? user.first_name ?? null, avatarUrl: user.profile_image_url ?? null }
  } catch {
    return null
  }
}

export async function GET(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await context.params

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 })

  const rows = await prisma.projectCollaborator.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } })

  const collaborators = await Promise.all(
    rows.map(async (r) => {
      const clerker = await enrichWithClerk(r.email)
      return { email: r.email, name: clerker?.name ?? null, avatarUrl: clerker?.avatarUrl ?? null }
    })
  )

  return Response.json({ collaborators })
}

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: CollaboratorBody
  try {
    body = (await request.json()) as CollaboratorBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { projectId } = await context.params
  const authorization = await getAuthorizedProject(projectId, userId)
  if ("error" in authorization) return authorization.error

  if (!isValidEmail(body.email)) return Response.json({ error: "Invalid email" }, { status: 400 })

  const email = (body.email as string).toLowerCase()

  try {
    const collaborator = await prisma.projectCollaborator.create({ data: { projectId, email } })
    const clerkMeta = await enrichWithClerk(email)
    return Response.json({ collaborator: { email: collaborator.email, name: clerkMeta?.name ?? null, avatarUrl: clerkMeta?.avatarUrl ?? null } }, { status: 201 })
  } catch (e) {
    return Response.json({ error: "Already invited or invalid" }, { status: 409 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: CollaboratorBody
  try {
    body = (await request.json()) as CollaboratorBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { projectId } = await context.params
  const authorization = await getAuthorizedProject(projectId, userId)
  if ("error" in authorization) return authorization.error

  if (!isValidEmail(body.email)) return Response.json({ error: "Invalid email" }, { status: 400 })

  const email = (body.email as string).toLowerCase()

  await prisma.projectCollaborator.deleteMany({ where: { projectId, email } })

  return Response.json({ success: true })
}
