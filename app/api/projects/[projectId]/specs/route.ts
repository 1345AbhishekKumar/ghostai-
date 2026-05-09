import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess } from "@/lib/project-access";

interface SpecsRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(_request: Request, context: SpecsRouteContext) {
  try {
    const { projectId } = await context.params;

    // 1. Verify project access
    const project = await checkProjectAccess(projectId);
    if (!project) {
      return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
    }

    // 2. Fetch specs for the project
    const specs = await prisma.projectSpec.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Return spec list with metadata
    // We'll synthesize a "filename" from the createdAt and projectId since it's not in the DB
    const formattedSpecs = specs.map((spec) => ({
      id: spec.id,
      projectId: spec.projectId,
      createdAt: spec.createdAt,
      filename: `spec-${spec.createdAt.getTime()}.md`,
      filePath: spec.filePath,
    }));

    return NextResponse.json(formattedSpecs);
  } catch (error) {
    console.error("Specs List Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
