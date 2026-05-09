import { auth } from "@clerk/nextjs/server"
import { tasks, auth as triggerAuth } from "@trigger.dev/sdk"

import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"
import type { designAgent } from "@/trigger/design-agent"

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { prompt: string; roomId: string; projectId: string }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { prompt, roomId, projectId } = body

  if (!prompt || !roomId || !projectId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Verify access
  const project = await checkProjectAccess(projectId)
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // Trigger task
  // Note: We use the task ID "design-agent" which matches the ID defined in trigger/design-agent.ts
  const handle = await tasks.trigger<typeof designAgent>("design-agent", {
    prompt,
    roomId,
  })

  // Track run in Prisma to verify ownership later
  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId,
    },
  })

  // Generate a Trigger.dev public token scoped to that run
  // This allows the client to subscribe to the run status and metadata in the same request
  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [handle.id],
      },
    },
    expirationTime: "1h",
  })

  return Response.json({ 
    runId: handle.id,
    publicToken 
  })
}
