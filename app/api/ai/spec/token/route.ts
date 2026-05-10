import { auth } from "@clerk/nextjs/server"
import { auth as triggerAuth } from "@trigger.dev/sdk"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const RequestSchema = z.object({
  runId: z.string(),
})

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = RequestSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Invalid request body", details: result.error.format() }, { status: 400 })
  }

  const { runId } = result.data

  // Verify the TaskRun belongs to the user
  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  })

  if (!taskRun || taskRun.userId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // Issue a Trigger.dev public access token scoped to that run
  const token = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  })

  return Response.json({ publicToken: token })
}
