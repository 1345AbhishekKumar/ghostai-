import { NextResponse } from "next/server";
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

    // 3. Fetch the blob content from Vercel Blob storage using the stored URL.
    //    Private blobs are fetched server-side using the BLOB_READ_WRITE_TOKEN
    //    set in the environment. Passing the token as a Bearer header gives access.
    const blobResponse = await fetch(spec.filePath, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobResponse.ok) {
      console.error("Blob fetch failed:", blobResponse.status, blobResponse.statusText);
      return NextResponse.json(
        { error: "Failed to fetch spec from storage" },
        { status: 500 }
      );
    }

    // 4. Return as downloadable Markdown file, streaming the response body
    return new Response(blobResponse.body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="spec-${projectId}-${specId}.md"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Spec Download Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
