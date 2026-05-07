import { auth, currentUser } from "@clerk/nextjs/server";

import { checkProjectAccess } from "@/lib/project-access";
import { getCursorColorForUser, getLiveblocksClient } from "@/lib/liveblocks";

interface LiveblocksAuthBody {
  projectId?: unknown;
  room?: unknown;
}

function parseProjectId(body: LiveblocksAuthBody): string | null {
  const source = typeof body.projectId === "string" ? body.projectId : body.room;
  if (typeof source !== "string") {
    return null;
  }

  const projectId = source.trim();
  return projectId.length > 0 ? projectId : null;
}

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>): string {
  const fullName = user?.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const firstAndLast = [user?.firstName, user?.lastName]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .join(" ")
    .trim();
  if (firstAndLast) {
    return firstAndLast;
  }

  const username = user?.username?.trim();
  if (username) {
    return username;
  }

  const email = user?.primaryEmailAddress?.emailAddress?.trim();
  if (email) {
    return email;
  }

  return "Unknown User";
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: LiveblocksAuthBody;
    try {
      body = (await request.json()) as LiveblocksAuthBody;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const projectId = parseProjectId(body);
    if (!projectId) {
      return Response.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await checkProjectAccess(projectId);
    if (!project) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await currentUser();
    const displayName = getDisplayName(user);
    const avatarUrl = user?.imageUrl ?? "";
    const cursorColor = getCursorColorForUser(userId);
    const liveblocks = getLiveblocksClient();

    await liveblocks.getOrCreateRoom(project.id, {
      defaultAccesses: [],
    });

    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        displayName,
        avatarUrl,
        cursorColor,
      },
    });

    session.allow(project.id, session.FULL_ACCESS);

    const { status, body: responseBody } = await session.authorize();
    return new Response(responseBody, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Liveblocks Auth Error:", error);
    return Response.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
