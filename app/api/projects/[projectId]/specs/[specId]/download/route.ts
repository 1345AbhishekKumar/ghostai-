import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { checkProjectAccess } from "@/lib/project-access";

interface DownloadRouteContext {
  params: Promise<{
    projectId: string;
    specId: string;
  }>;
}

export async function GET(_request: Request, context: DownloadRouteContext) {
  try {
    const { projectId, specId } = await context.params;

    // 1. Verify project access
    const project = await checkProjectAccess(projectId);
    if (!project) {
      return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
    }

    // 2. Verify the spec belongs to the project
    const spec = await prisma.projectSpec.findFirst({
      where: {
        id: specId,
        projectId: projectId,
      },
    });

    if (!spec) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    // 3. Fetch from Vercel Blob
    const blob = await get(spec.filePath, {
      access: "private",
    });

    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json({ error: "Failed to fetch spec from storage" }, { status: 500 });
    }

    if (!blob.stream) {
        return NextResponse.json({ error: "No stream available for spec" }, { status: 500 });
    }

    // 4. Return as downloadable file
    const response = new Response(blob.stream);
    response.headers.set("Content-Type", "text/markdown");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="spec-${projectId}-${specId}.md"`
    );

    return response;
  } catch (error) {
    console.error("Spec Download Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
