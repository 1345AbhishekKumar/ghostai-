import { auth } from "@clerk/nextjs/server"
import { tasks } from "@trigger.dev/sdk"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { checkProjectAccess } from "@/lib/project-access"
import type { generateSpec } from "@/trigger/generate-spec"

const RequestSchema = z.object({
  roomId: z.string(),
  chatHistory: z.array(z.any()),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
})

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: {
    roomId: string;
    chatHistory: any[];
    nodes: any[];
    edges: any[];
  }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const result = RequestSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ error: "Invalid request body", details: result.error.format() }, { status: 400 })
  }

  const { roomId, chatHistory, nodes, edges } = result.data

  // Resolve project access from roomId
  // In this system, roomId is the projectId
  const project = await checkProjectAccess(roomId)
  if (!project) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // Trigger the generate-spec task
  const handle = await tasks.trigger<typeof generateSpec>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  })

  // Save TaskRun record for ownership/access control
  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId,
    },
  })

  return Response.json({ runId: handle.id })
}
