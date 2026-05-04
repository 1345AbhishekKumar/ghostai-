import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

interface CollaboratorBody {
  email?: unknown
}

interface ProjectRouteContext {
  params: Promise<{
    projectId: string
  }>
}

interface ClerkProfile {
  email: string | null
  name: string | null
  avatarUrl: string | null
}

const CLERK_API_BASE = "https://api.clerk.com/v1"

async function getOwnerProject(projectId: string, userId: string) {
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

async function getProjectAccess(projectId: string, userId: string, emails: string[]) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
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

function parseEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const normalizedEmail = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return null
  }

  return normalizedEmail
}

function mapClerkName(user: Record<string, unknown>): string | null {
  const fullName = typeof user.full_name === "string" ? user.full_name : null
  if (fullName && fullName.trim().length > 0) {
    return fullName.trim()
  }

  const firstName = typeof user.first_name === "string" ? user.first_name : null
  const lastName = typeof user.last_name === "string" ? user.last_name : null
  const joinedName = [firstName, lastName].filter(Boolean).join(" ").trim()
  return joinedName.length > 0 ? joinedName : null
}

async function fetchClerkUserByEmail(email: string): Promise<ClerkProfile | null> {
  const apiKey = process.env.CLERK_API_KEY
  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(
      `${CLERK_API_BASE}/users?email_address=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as unknown
    const user = Array.isArray(data) ? data[0] : null

    if (!user || typeof user !== "object") {
      return null
    }

    const profileImageUrl =
      typeof user.profile_image_url === "string" ? user.profile_image_url : null

    return {
      email,
      name: mapClerkName(user),
      avatarUrl: profileImageUrl,
    }
  } catch {
    return null
  }
}

async function fetchClerkUserById(userId: string): Promise<ClerkProfile | null> {
  const apiKey = process.env.CLERK_API_KEY
  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch(`${CLERK_API_BASE}/users/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as unknown
    if (!data || typeof data !== "object") {
      return null
    }

    const emailAddressData =
      Array.isArray((data as { email_addresses?: unknown }).email_addresses)
        ? (data as { email_addresses: Array<{ email_address?: unknown }> }).email_addresses
        : []
    const primaryEmail = emailAddressData.find(
      (address) => typeof address.email_address === "string"
    )
    const profileImageUrl =
      typeof (data as { profile_image_url?: unknown }).profile_image_url === "string"
        ? (data as { profile_image_url: string }).profile_image_url
        : null

    return {
      email: typeof primaryEmail?.email_address === "string" ? primaryEmail.email_address : null,
      name: mapClerkName(data as Record<string, unknown>),
      avatarUrl: profileImageUrl,
    }
  } catch {
    return null
  }
}

export async function GET(_request: Request, context: ProjectRouteContext) {
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

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  })

  const collaborators = await Promise.all(
    rows.map(async (r) => {
      const clerkProfile = await fetchClerkUserByEmail(r.email)
      return {
        email: r.email,
        name: clerkProfile?.name ?? null,
        avatarUrl: clerkProfile?.avatarUrl ?? null,
      }
    })
  )

  const ownerProfile = await fetchClerkUserById(access.project.ownerId)

  return Response.json({
    viewerRole: access.isOwner ? "owner" : "collaborator",
    owner: {
      email: ownerProfile?.email ?? null,
      name: ownerProfile?.name ?? null,
      avatarUrl: ownerProfile?.avatarUrl ?? null,
    },
    collaborators,
  })
}

export async function POST(request: Request, context: ProjectRouteContext) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: CollaboratorBody
  try {
    body = (await request.json()) as CollaboratorBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { projectId } = await context.params
  const authorization = await getOwnerProject(projectId, userId)
  if ("error" in authorization) return authorization.error

  const email = parseEmail(body.email)
  if (!email) {
    return Response.json({ error: "Invalid email" }, { status: 400 })
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({ data: { projectId, email } })
    const clerkProfile = await fetchClerkUserByEmail(email)

    return Response.json(
      {
        collaborator: {
          email: collaborator.email,
          name: clerkProfile?.name ?? null,
          avatarUrl: clerkProfile?.avatarUrl ?? null,
        },
      },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: "Already invited or invalid" }, { status: 409 })
  }
}

export async function DELETE(request: Request, context: ProjectRouteContext) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: CollaboratorBody
  try {
    body = (await request.json()) as CollaboratorBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { projectId } = await context.params
  const authorization = await getOwnerProject(projectId, userId)
  if ("error" in authorization) return authorization.error

  const email = parseEmail(body.email)
  if (!email) {
    return Response.json({ error: "Invalid email" }, { status: 400 })
  }

  await prisma.projectCollaborator.deleteMany({ where: { projectId, email } })

  return Response.json({ success: true })
}
