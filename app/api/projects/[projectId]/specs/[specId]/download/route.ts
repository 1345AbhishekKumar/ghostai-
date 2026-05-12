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

    // Resolve by spec ID first. This prevents false 404s when a stale/mismatched
    // projectId appears in the URL while still enforcing access on the actual owner project.
    const spec = await prisma.projectSpec.findUnique({
      where: { id: specId },
      select: {
        id: true,
        projectId: true,
        filePath: true,
      },
    });

    if (!spec) {
      return NextResponse.json({ error: "Spec not found" }, { status: 404 });
    }

    // Verify access against the project that owns this spec.
    const project = await checkProjectAccess(spec.projectId);
    if (!project) {
      return NextResponse.json({ error: "Forbidden or Not Found" }, { status: 403 });
    }

    // 3. Fetch the blob content from Vercel Blob storage using the stored URL.
    //    Private blobs are fetched server-side using the BLOB_READ_WRITE_TOKEN
    //    set in the environment. Passing the token as a Bearer header gives access.
    const readWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
    const blobResponse = await fetch(spec.filePath, readWriteToken
      ? {
          headers: {
            Authorization: `Bearer ${readWriteToken}`,
          },
        }
      : undefined);

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
        "Content-Disposition": `attachment; filename="spec-${spec.projectId}-${specId}.md"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("Spec Download Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
