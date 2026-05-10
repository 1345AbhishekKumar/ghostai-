import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface SpecsRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(_request: Request, context: SpecsRouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;

    // 1. Find project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: { select: { email: true } } },
    });

    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Verify access — owner fast path, then collaborator check
    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      const user = await currentUser();
      const userEmails =
        user?.emailAddresses.map((e) => e.emailAddress.toLowerCase()) ?? [];
      const isCollaborator = project.collaborators.some((c) =>
        userEmails.includes(c.email.toLowerCase())
      );
      if (!isCollaborator) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // 3. Fetch specs for the project
    const specs = await prisma.projectSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    // 4. Return spec list with synthesized filename
    const formattedSpecs = specs.map((spec) => ({
      id: spec.id,
      projectId: spec.projectId,
      createdAt: spec.createdAt,
      filename: `spec-${spec.createdAt.getTime()}.md`,
      filePath: spec.filePath,
    }));

    return Response.json(formattedSpecs);
  } catch (error) {
    console.error("Specs List Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
