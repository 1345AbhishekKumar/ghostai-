import { task, metadata, logger } from "@trigger.dev/sdk";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

import {
  NODE_COLORS,
  NODE_SHAPES,
  CANVAS_NODE_TYPE,
  CANVAS_EDGE_TYPE,
  DEFAULT_SHAPE_SIZES,
  type CanvasNodeShape,
} from "../types/canvas";

interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

const LIVEBLOCKS_SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY;
const LIVEBLOCKS_API_BASE = "https://api.liveblocks.io/v2";

const AI_CURSOR_COLOR = "#6457f9"; // AI accent color from UI context

async function updatePresence(
  roomId: string,
  status: string,
  isThinking: boolean,
  ttl: number = 30,
) {
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
          cursor: { x: 100, y: 100 }, // Fixed placeholder for agent cursor
          thinking: isThinking,
        },
        userInfo: {
          displayName: `Ghost AI (${status})`,
          avatarUrl: "", // Optional AI avatar
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

async function getCanvasStorage(roomId: string) {
  if (!LIVEBLOCKS_SECRET_KEY) return null;

  try {
    const response = await fetch(
      `${LIVEBLOCKS_API_BASE}/rooms/${roomId}/storage`,
      {
        headers: {
          Authorization: `Bearer ${LIVEBLOCKS_SECRET_KEY}`,
        },
      },
    );

    if (!response.ok) return null;
    const raw = await response.json();
    // useLiveblocksFlow stores everything under storage["flow"] = { nodes: {}, edges: {} }
    // The REST API returns: { data: { flow: { nodes: {...}, edges: {...} }, ... } }
    return raw;
  } catch (error) {
    logger.error("Failed to fetch canvas storage", { error });
    return null;
  }
}

async function applyJsonPatch(roomId: string, patch: any[]) {
  if (!LIVEBLOCKS_SECRET_KEY || patch.length === 0) return;

  try {
    const response = await fetch(
      `${LIVEBLOCKS_API_BASE}/rooms/${roomId}/storage/json-patch`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${LIVEBLOCKS_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to apply JSON patch", { error: errorText, patch });
      throw new Error(`Liveblocks patch failed: ${errorText}`);
    }
  } catch (error) {
    logger.error("Error applying JSON patch", { error });
    throw error;
  }
}

const actionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("addNode"),
    id: z.string(),
    shape: z.enum(NODE_SHAPES),
    label: z.string(),
    x: z.number(),
    y: z.number(),
    color: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  z.object({
    type: z.literal("updateNode"),
    id: z.string(),
    label: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    color: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  z.object({
    type: z.literal("deleteNode"),
    id: z.string(),
  }),
  z.object({
    type: z.literal("addEdge"),
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
  }),
  z.object({
    type: z.literal("deleteEdge"),
    id: z.string(),
  }),
]);

export const designAgent = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    const { prompt, roomId } = payload;

    logger.info("Design agent started", { prompt, roomId });
    const initStatus = "Initializing Ghost AI...";
    metadata.set("status", initStatus);
    await updateAiStatus(roomId, initStatus);
    await updatePresence(roomId, "Waking up", true);

    // 1. Get current state
    const fetchStatus = "Fetching canvas state...";
    metadata.set("status", fetchStatus);
    await updateAiStatus(roomId, fetchStatus);
    const storage = await getCanvasStorage(roomId);
    // useLiveblocksFlow stores under storage["flow"] = LiveObject({ nodes: LiveMap, edges: LiveMap })
    // REST API serialises this as: data.flow.nodes = { id: {...}, ... }, data.flow.edges = { id: {...}, ... }
    const flowObj = storage?.data?.flow;
    const flowData = flowObj?.data || flowObj;

    const nodesObj = flowData?.nodes;
    const nodes = nodesObj?.data || nodesObj || {};

    const edgesObj = flowData?.edges;
    const edgesRaw = edgesObj?.data || edgesObj;
    const edges = edgesRaw && !Array.isArray(edgesRaw) ? edgesRaw : {};

    // 2. Generate design actions
    const brainstormStatus = "Brainstorming design...";
    metadata.set("status", brainstormStatus);
    await updateAiStatus(roomId, brainstormStatus);
    await updatePresence(roomId, "Thinking...", true);

    const { object: result } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        actions: z.array(actionSchema),
        explanation: z.string(),
      }),
      prompt: `
        You are Ghost AI, an elite system architect and diagram generation engine specialized in creating production-grade architecture diagrams for collaborative canvases.

Your job is to transform the user's request into a BEAUTIFUL, CLEAN, SEMANTICALLY ORGANIZED architecture diagram using structured canvas actions.

━━━━━━━━━━━━━━━━━━━━
USER REQUEST
━━━━━━━━━━━━━━━━━━━━

${prompt}

━━━━━━━━━━━━━━━━━━━━
CURRENT CANVAS STATE
━━━━━━━━━━━━━━━━━━━━

Nodes:
${JSON.stringify(nodes)}

Edges:
${JSON.stringify(edges)}

━━━━━━━━━━━━━━━━━━━━
CORE OBJECTIVE
━━━━━━━━━━━━━━━━━━━━

Generate visually stunning, highly readable, spatially organized architecture diagrams.

The output MUST:
- look professionally designed
- avoid overlaps entirely
- maintain architectural flow
- use consistent spacing
- preserve existing work
- intelligently group related systems
- create aesthetically balanced layouts
- maximize readability

━━━━━━━━━━━━━━━━━━━━
STRICT OUTPUT RULES
━━━━━━━━━━━━━━━━━━━━

- Return a valid JSON object with "actions" and "explanation" fields.
- The "explanation" should be a brief, professional summary of your design decisions.
- NEVER include markdown in the explanation.
- NEVER include prose outside the JSON object.
- NEVER return comments.
- NEVER return invalid JSON.

━━━━━━━━━━━━━━━━━━━━
SUPPORTED ACTIONS
━━━━━━━━━━━━━━━━━━━━

- addNode
- updateNode
- deleteNode
- addEdge
- deleteEdge

━━━━━━━━━━━━━━━━━━━━
NODE SHAPE SYSTEM
━━━━━━━━━━━━━━━━━━━━

Use shapes consistently and semantically:

- cylinder
  Databases, storage, cache, persistent systems

- diamond
  Gateways, routers, branching systems

- circle
  Events, queues, triggers, endpoints

- pill
  APIs, services, functions, workers

- hexagon
  External providers and third-party systems

- rectangle
  UI layers and general systems

━━━━━━━━━━━━━━━━━━━━
COLOR SYSTEM
━━━━━━━━━━━━━━━━━━━━

Allowed colors:
${NODE_COLORS.map((c) => c.fill).join(", ")}

Apply colors consistently by architecture domain.

Example:
- frontend systems → same color family
- backend systems → same color family
- databases → same color family
- AI systems → same color family
- external providers → same color family

DO NOT randomly assign colors.

━━━━━━━━━━━━━━━━━━━━
LAYOUT RULES
━━━━━━━━━━━━━━━━━━━━

Use a clean LEFT → RIGHT architecture flow.

Preferred positioning:

LEFT:
- clients
- frontend
- users
- dashboards

CENTER-LEFT:
- API gateways
- authentication
- routing

CENTER:
- services
- business logic
- orchestration

CENTER-RIGHT:
- queues
- workers
- processing

RIGHT:
- databases
- storage
- analytics

OUTER EDGES:
- external systems
- integrations

━━━━━━━━━━━━━━━━━━━━
SPACING RULES
━━━━━━━━━━━━━━━━━━━━

Use professional spacing.

- horizontal spacing = 420px
- vertical spacing = 300px

Minimum allowed distance:
- x distance >= 320px
- y distance >= 220px

NEVER:
- overlap nodes
- stack nodes
- place nodes at identical coordinates
- create chaotic layouts

━━━━━━━━━━━━━━━━━━━━
VISUAL COMPOSITION
━━━━━━━━━━━━━━━━━━━━

The diagram should feel balanced and premium.

- Align related nodes
- Minimize edge crossing
- Keep connected systems near each other
- Maintain whitespace
- Use visual hierarchy
- Avoid excessive empty space
- Create visually distinct clusters

━━━━━━━━━━━━━━━━━━━━
COLLISION PREVENTION
━━━━━━━━━━━━━━━━━━━━

Each node occupies virtual space:

- width = 260px
- height = 140px

Before placing a node:
- check all existing positions
- prevent overlap
- if collision happens:
  - shift right by 420px
  - retry placement

━━━━━━━━━━━━━━━━━━━━
PRESERVATION RULES
━━━━━━━━━━━━━━━━━━━━

NEVER:
- delete existing nodes
- delete existing edges
- overwrite layouts
- move existing systems

UNLESS the user explicitly says:
- delete
- remove
- clear
- replace
- reset

━━━━━━━━━━━━━━━━━━━━
UPDATE SAFETY
━━━━━━━━━━━━━━━━━━━━

Only update nodes explicitly mentioned by the user.

Do NOT:
- randomly move systems
- recolor unrelated nodes
- restructure existing diagrams

━━━━━━━━━━━━━━━━━━━━
EDGE RULES
━━━━━━━━━━━━━━━━━━━━

Edges must:
- connect logically
- minimize crossing
- follow architecture direction

NEVER:
- create duplicate edges
- create self-loops
- create unnecessary bidirectional edges

━━━━━━━━━━━━━━━━━━━━
ID RULES
━━━━━━━━━━━━━━━━━━━━

For new nodes:
- generate unique IDs
- NEVER reuse existing IDs

Example:
- node-auth-1
- node-api-2
- node-db-3

━━━━━━━━━━━━━━━━━━━━
NODE LABEL RULES
━━━━━━━━━━━━━━━━━━━━

Labels should:
- be short
- be professional
- use architecture terminology

GOOD:
- Auth Service
- API Gateway
- Redis Cache
- Event Bus

BAD:
- Service that handles authentication and users

━━━━━━━━━━━━━━━━━━━━
REQUIRED BEHAVIOR
━━━━━━━━━━━━━━━━━━━━

CRITICAL:
You MUST generate visual architecture actions.

DO NOT describe systems in plain text.

The renderer depends on:
- addNode
- addEdge
- updateNode

━━━━━━━━━━━━━━━━━━━━
ACTION SCHEMAS (FLAT)
━━━━━━━━━━━━━━━━━━━━

addNode:
{
  "type": "addNode",
  "id": "node-auth-1",
  "shape": "pill",
  "label": "Auth Service",
  "x": 0,
  "y": 0,
  "color": "#HEX"
}

addEdge:
{
  "type": "addEdge",
  "id": "edge-1",
  "source": "node-a",
  "target": "node-b",
  "label": "optional label"
}

updateNode:
{
  "type": "updateNode",
  "id": "existing-node-id",
  "label": "New Label",
  "x": 100,
  "y": 200,
  "color": "#HEX"
}

━━━━━━━━━━━━━━━━━━━━
FINAL RULE
━━━━━━━━━━━━━━━━━━━━

Return ONLY a structured JSON object containing "actions" and "explanation" for a beautiful, professional, readable architecture diagram.
      `,
      // prompt: `
      //   You are Ghost AI, a senior system architect and designer.
      //   Your goal is to update a collaborative system design canvas based on the user's prompt.

      //   USER PROMPT: "${prompt}"

      //   CURRENT CANVAS STATE:
      //   Nodes: ${JSON.stringify(nodes)}
      //   Edges: ${JSON.stringify(edges)}

      //   CONSTRAINTS & RULES:
      //   - Use the following shapes correctly:
      //     - 'cylinder': database, storage, stateful services.
      //     - 'diamond': decision points, gateways, routers.
      //     - 'circle': events, endpoints, start/end points.
      //     - 'pill': services, processes, functions.
      //     - 'hexagon': external systems, boundaries.
      //     - 'rectangle': general purpose, default.
      //   - Color Palette (hex fills): ${NODE_COLORS.map(c => c.fill).join(", ")}. Use these for semantic grouping.
      //   - Layout: Spread nodes out WIDELY in a grid-like fashion (e.g., increments of 400px horizontally and 300px vertically). NEVER place nodes at the exact same coordinates. Strictly avoid any overlapping.
      //   - Consistency: If updating existing nodes, keep their IDs. For new nodes, generate strictly unique IDs (e.g., 'node-service-12345' with random numbers). NEVER reuse an existing node ID for a newly created node.
      //   - Preservation: DO NOT delete or overwrite existing nodes and edges unless the user explicitly asks you to remove, replace, or clear them. If the user asks for a new diagram, build it alongside the existing one by choosing coordinates that are far away from any existing nodes.
      //   - Edges: Connect services logically.
      //   - CRITICAL: You MUST generate 'addNode' and 'addEdge' actions to visually represent the architecture requested by the user. Do NOT just explain it in text. The canvas needs the structured data to render the diagram.

      //   ACTIONS SUPPORTED:
      //   - addNode: Add a new node.
      //   - updateNode: Update an existing node (position, label, color).
      //   - deleteNode: Remove a node.
      //   - addEdge: Connect two nodes.
      //   - deleteEdge: Remove a connection.

      //   Return a sequence of actions to fulfill the user's request.
      // `,
    });

    logger.info("Generated design actions", {
      count: result.actions.length,
      explanation: result.explanation,
    });
    const applyStatus = "Applying changes to canvas...";
    metadata.set("status", applyStatus);
    await updateAiStatus(roomId, applyStatus);
    await updatePresence(roomId, "Drawing...", true);

    const userWantsDelete = /delete|remove|clear|reset|replace/i.test(prompt);

    // 3. Convert actions to JSON patches
    // IMPORTANT: useLiveblocksFlow stores everything under storage["flow"] = { nodes: LiveMap, edges: LiveMap }
    // So all paths must be /flow/nodes/{id} and /flow/edges/{id}, NOT /nodes/{id}
    const patches: any[] = [];
    const currentEdgesMap: Record<string, any> = { ...edges };

    // Ensure /flow container exists before writing into it.
    // If the room is brand-new, storage.data.flow will be undefined.
    if (!flowObj) {
      patches.push({
        op: "add",
        path: "/flow",
        value: { nodes: {}, edges: {} },
      });
    } else {
      // Ensure sub-keys exist if they were somehow missing
      if (!nodesObj)
        patches.push({ op: "add", path: "/flow/nodes", value: {} });
      if (!edgesObj)
        patches.push({ op: "add", path: "/flow/edges", value: {} });
    }

    for (const action of result.actions) {
      if (action.type === "addNode") {
        const width = action.width || DEFAULT_SHAPE_SIZES[action.shape].width;
        const height =
          action.height || DEFAULT_SHAPE_SIZES[action.shape].height;

        patches.push({
          op: "add",
          path: `/flow/nodes/${action.id}`,
          value: {
            id: action.id,
            type: CANVAS_NODE_TYPE,
            position: { x: action.x, y: action.y },
            data: {
              label: action.label,
              shape: action.shape,
              color: action.color || NODE_COLORS[0].fill,
            },
            style: { width, height },
          },
        });
      } else if (action.type === "updateNode") {
        const node = nodes[action.id];

        if (action.label !== undefined)
          patches.push({
            op: "add",
            path: `/flow/nodes/${action.id}/data/label`,
            value: action.label,
          });
        if (action.color !== undefined)
          patches.push({
            op: "add",
            path: `/flow/nodes/${action.id}/data/color`,
            value: action.color,
          });
        if (action.x !== undefined)
          patches.push({
            op: "add",
            path: `/flow/nodes/${action.id}/position/x`,
            value: action.x,
          });
        if (action.y !== undefined)
          patches.push({
            op: "add",
            path: `/flow/nodes/${action.id}/position/y`,
            value: action.y,
          });

        if (action.width !== undefined || action.height !== undefined) {
          if (node && !node.style) {
            patches.push({
              op: "add",
              path: `/flow/nodes/${action.id}/style`,
              value: {
                width:
                  action.width ??
                  DEFAULT_SHAPE_SIZES[node.data?.shape as CanvasNodeShape]
                    ?.width ??
                  240,
                height:
                  action.height ??
                  DEFAULT_SHAPE_SIZES[node.data?.shape as CanvasNodeShape]
                    ?.height ??
                  120,
              },
            });
            node.style = {}; // local mutation so next checks see it
          } else {
            if (action.width !== undefined)
              patches.push({
                op: "add",
                path: `/flow/nodes/${action.id}/style/width`,
                value: action.width,
              });
            if (action.height !== undefined)
              patches.push({
                op: "add",
                path: `/flow/nodes/${action.id}/style/height`,
                value: action.height,
              });
          }
        }
      } else if (action.type === "deleteNode") {
        if (!userWantsDelete) {
          logger.warn(
            `Ignoring deleteNode for ${action.id} because user didn't explicitly ask to delete`,
          );
          continue;
        }
        if (nodes[action.id]) {
          patches.push({ op: "remove", path: `/flow/nodes/${action.id}` });
        } else {
          logger.warn(`Node not found for deletion: ${action.id}`);
        }
      } else if (action.type === "addEdge") {
        const newEdge = {
          id: action.id,
          type: CANVAS_EDGE_TYPE,
          source: action.source,
          target: action.target,
          data: { label: action.label || "" },
        };
        patches.push({
          op: "add",
          path: `/flow/edges/${action.id}`,
          value: newEdge,
        });
        currentEdgesMap[action.id] = newEdge;
      } else if (action.type === "deleteEdge") {
        if (!userWantsDelete) {
          logger.warn(
            `Ignoring deleteEdge for ${action.id} because user didn't explicitly ask to delete`,
          );
          continue;
        }
        if (currentEdgesMap[action.id]) {
          patches.push({ op: "remove", path: `/flow/edges/${action.id}` });
          delete currentEdgesMap[action.id];
        } else {
          logger.warn(`Edge not found for deletion: ${action.id}`);
        }
      }
    }

    // 4. Apply patches
    if (patches.length > 0) {
      await applyJsonPatch(roomId, patches);
    }

    const doneStatus = "Design updated!";
    metadata.set("status", doneStatus);
    await updateAiStatus(roomId, null); // Clear shared status
    await updatePresence(roomId, "Finished", false, 5); // Short TTL to cleanup

    return {
      success: true,
      explanation: result.explanation,
      actionCount: result.actions.length,
    };
  },
});
