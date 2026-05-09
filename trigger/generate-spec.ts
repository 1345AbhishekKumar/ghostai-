import { schemaTask, metadata, logger } from "@trigger.dev/sdk";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const LIVEBLOCKS_SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY;
const LIVEBLOCKS_API_BASE = "https://api.liveblocks.io/v2";

const AI_CURSOR_COLOR = "#6457f9";

async function updatePresence(roomId: string, status: string, isThinking: boolean, ttl: number = 30) {
  if (!LIVEBLOCKS_SECRET_KEY) return;

  try {
    await fetch(`${LIVEBLOCKS_API_BASE}/rooms/${roomId}/presence`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LIVEBLOCKS_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "ghost-ai",
        data: {
          cursor: { x: 100, y: 100 },
          thinking: isThinking,
        },
        userInfo: {
          displayName: `Ghost AI (${status})`,
          cursorColor: AI_CURSOR_COLOR,
        },
        ttl,
      }),
    });
  } catch (error) {
    logger.error("Failed to update AI presence", { error });
  }
}

async function updateAiStatus(roomId: string, text: string | null) {
  if (!LIVEBLOCKS_SECRET_KEY) return;

  try {
    await fetch(`${LIVEBLOCKS_API_BASE}/rooms/${roomId}/storage/json-patch`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${LIVEBLOCKS_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          op: "add",
          path: "/ai-status-feed/text",
          value: text || "",
        },
      ]),
    });
  } catch (error) {
    logger.error("Failed to update AI status feed", { error });
  }
}

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: z.object({
    projectId: z.string(),
    roomId: z.string(),
    chatHistory: z.array(z.any()),
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
  run: async (payload) => {
    const { projectId, roomId, chatHistory, nodes, edges } = payload;

    logger.info("Generate spec task started", { projectId, roomId });
    const initStatus = "Initializing spec generator...";
    metadata.set("status", initStatus);
    await updateAiStatus(roomId, initStatus);
    await updatePresence(roomId, "Waking up", true);

    const brainstormStatus = "Analyzing architecture and generating spec...";
    metadata.set("status", brainstormStatus);
    await updateAiStatus(roomId, brainstormStatus);
    await updatePresence(roomId, "Thinking...", true);

    const { text: specContent } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `
        You are Ghost AI, a senior software engineer. 
        Your goal is to generate a comprehensive technical specification in Markdown format based on the current system design canvas and conversation history.

        CONVERSATION HISTORY:
        ${JSON.stringify(chatHistory)}

        CURRENT CANVAS STATE:
        Nodes: ${JSON.stringify(nodes)}
        Edges: ${JSON.stringify(edges)}

        INSTRUCTIONS:
        - Generate a professional, high-quality technical specification.
        - Include sections like:
          - Executive Summary
          - System Architecture (referencing the nodes and edges)
          - Component Deep Dive
          - Data Flow & Integration Points
          - Security & Scalability Considerations
          - Implementation Roadmap
        - Use Markdown formatting for headings, lists, tables, and code blocks.
        - Be specific and reference the actual services and connections defined in the canvas.
        - Incorporate context from the chat history to ensure all user requirements are addressed.
        - Do not include conversational filler; return only the Markdown content.
      `,
    });

    logger.info("Generated technical spec", { length: specContent.length });

    const savingStatus = "Saving technical specification...";
    metadata.set("status", savingStatus);
    await updateAiStatus(roomId, savingStatus);

    try {
      const filename = `projects/${projectId}/spec-${Date.now()}.md`;
      const blob = await put(filename, specContent, {
        access: "private",
        contentType: "text/markdown",
      });

      const spec = await prisma.projectSpec.create({
        data: {
          projectId,
          filePath: blob.url,
        },
      });

      logger.info("Saved technical spec to Blob and DB", {
        specId: spec.id,
        url: blob.url,
      });

      metadata.set("status", "Spec generated and saved!");
      await updateAiStatus(roomId, null);
      await updatePresence(roomId, "Finished", false, 5);

      return {
        specId: spec.id,
        filePath: blob.url,
      };
    } catch (error) {
      logger.error("Failed to save technical spec", { error });
      metadata.set("status", "Failed to save spec");
      await updateAiStatus(roomId, "Failed to save spec");
      throw error;
    }
  },
});
