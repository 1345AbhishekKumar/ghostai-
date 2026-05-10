"use client"

import {
  type DragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  type NodeChange,
  useReactFlow,
  type Connection,
} from "@xyflow/react"
import { LiveObject, LiveMap } from "@liveblocks/client"
import {
  useMyPresence,
  useOthers,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useMutation,
} from "@liveblocks/react/suspense"
import { ZoomIn, ZoomOut, Maximize, Undo2, Redo2, Loader2 } from "lucide-react"

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useCanvasAutosave, type SaveStatus } from "@/hooks/use-canvas-autosave"

import { CanvasBasicNode, CanvasShapePreview } from "@/components/editor/canvas-basic-node"
import { CanvasBasicEdge } from "@/components/editor/canvas-basic-edge"
import { ShapePanel } from "@/components/editor/shape-panel"
import { ParticipantAvatars } from "@/components/editor/participant-avatars"
import {
  CANVAS_NODE_TYPE,
  CANVAS_EDGE_TYPE,
  CANVAS_SHAPE_DRAG_MIME,
  type CanvasShapeDragPayload,
  DEFAULT_NODE_COLOR,
  parseCanvasShapeDragPayload,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas"

interface WorkspaceCanvasProps {
  roomId: string
  onSaveStatusChange?: (status: SaveStatus) => void
}

interface ShapeDragPreviewState {
  payload: CanvasShapeDragPayload
  x: number
  y: number
}

function normalizeHandleId(handleId: string | null | undefined): string | null {
  if (!handleId) {
    return handleId ?? null
  }

  if (handleId.startsWith("source-")) {
    return handleId.slice("source-".length)
  }

  if (handleId.startsWith("target-")) {
    return handleId.slice("target-".length)
  }

  return handleId
}

function normalizeConnection(connection: Connection): Connection {
  return {
    ...connection,
    sourceHandle: normalizeHandleId(connection.sourceHandle),
    targetHandle: normalizeHandleId(connection.targetHandle),
  }
}

function sanitizeLoadedEdges(loadedEdges: CanvasEdge[]): CanvasEdge[] {
  return loadedEdges.map((edge) => ({
    ...edge,
    sourceHandle: normalizeHandleId(edge.sourceHandle),
    targetHandle: normalizeHandleId(edge.targetHandle),
  }))
}

function SyncedCanvasContent({ roomId, onSaveStatusChange }: { roomId: string, onSaveStatusChange?: (status: SaveStatus) => void }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>()
  const [, updateMyPresence] = useMyPresence()
  const others = useOthers()
  const nodeCounterRef = useRef(0)
  const hasLoadedRef = useRef(false)
  const nodeTypes = useMemo(() => ({ [CANVAS_NODE_TYPE]: CanvasBasicNode }), [])
  const edgeTypes = useMemo(() => ({ [CANVAS_EDGE_TYPE]: CanvasBasicEdge }), [])
  const renderedEdges = useMemo(() => sanitizeLoadedEdges(edges), [edges])
  const [dragPreview, setDragPreview] = useState<ShapeDragPreviewState | null>(null)

  const saveStatus = useCanvasAutosave(roomId, nodes, edges)

  useEffect(() => {
    onSaveStatusChange?.(saveStatus)
  }, [saveStatus, onSaveStatusChange])

  // Write blob-persisted canvas data into Liveblocks storage so all collaborators see it.
  // Must use a mutation — NOT setNodes/setEdges from useReactFlow — because useLiveblocksFlow
  // drives <ReactFlow nodes={}> from Liveblocks storage and ignores local React Flow state.
  const initFlowFromBlob = useMutation(
    ({ storage }, blobNodes: CanvasNode[], blobEdges: CanvasEdge[]) => {
      let flow = storage.get("flow")
      // useLiveblocksFlow may not have initialised the "flow" key yet on very first render;
      // create it if absent so we can write into it.
      if (!flow) {
        storage.set(
          "flow",
          new LiveObject({
            nodes: new LiveMap<string, LiveObject<any>>(),
            edges: new LiveMap<string, LiveObject<any>>(),
          })
        )
        flow = storage.get("flow")!
      }
      const nodesMap = flow.get("nodes") as LiveMap<string, LiveObject<any>>
      const edgesMap = flow.get("edges") as LiveMap<string, LiveObject<any>>
      for (const node of blobNodes) {
        nodesMap.set(node.id, new LiveObject(node as any))
      }
      for (const edge of blobEdges) {
        edgesMap.set(edge.id, new LiveObject(edge as any))
      }
    },
    []
  )

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    async function loadCanvas() {
      // If Liveblocks already has data (e.g. a collaborator added nodes), skip blob load.
      if (nodes.length > 0 || edges.length > 0) {
        return
      }

      try {
        const response = await fetch(`/api/projects/${roomId}/canvas`)
        if (response.ok) {
          const data = await response.json()
          if (data.canvas && Array.isArray(data.canvas.nodes) && data.canvas.nodes.length > 0) {
            const sanitizedEdges = Array.isArray(data.canvas.edges)
              ? sanitizeLoadedEdges(data.canvas.edges as CanvasEdge[])
              : []
            // Write into Liveblocks storage — this propagates to all collaborators in real-time
            initFlowFromBlob(data.canvas.nodes as CanvasNode[], sanitizedEdges)
          }
        }
      } catch (error) {
        console.error("Failed to load canvas:", error)
      }
    }

    loadCanvas()
  }, [roomId, nodes.length, edges.length, initFlowFromBlob])

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      updateMyPresence({ cursor: { x: event.clientX, y: event.clientY } })
    },
    [updateMyPresence]
  )

  const onMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null })
  }, [updateMyPresence])

  const handleConnect = useCallback(
    (connection: Connection) => {
      const normalizedConnection = normalizeConnection(connection)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const edge: any = {
        ...normalizedConnection,
        type: CANVAS_EDGE_TYPE,
        data: { label: "" },
      }
      onConnect(edge)
    },
    [onConnect]
  )

  const startShapeDragPreview = useCallback(
    (payload: CanvasShapeDragPayload, position: { x: number; y: number }) => {
      setDragPreview({ payload, x: position.x, y: position.y })
    },
    [],
  )

  const endShapeDragPreview = useCallback(() => {
    setDragPreview(null)
  }, [])

  const onCanvasDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    if (dragPreview) {
      setDragPreview((current) => {
        if (!current) {
          return current
        }

        return { ...current, x: event.clientX, y: event.clientY }
      })
    }
  }

  const onCanvasDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragPreview(null)

    const serializedPayload =
      event.dataTransfer.getData(CANVAS_SHAPE_DRAG_MIME) ||
      event.dataTransfer.getData("text/plain")
    const payload = parseCanvasShapeDragPayload(serializedPayload)

    if (!payload) {
      return
    }

    nodeCounterRef.current += 1
    const id = `${payload.shape}-${Date.now()}-${nodeCounterRef.current}`
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })
    const newNode: CanvasNode = {
      id,
      type: CANVAS_NODE_TYPE,
      position,
      style: {
        width: payload.size.width,
        height: payload.size.height,
      },
      data: {
        label: "",
        color: DEFAULT_NODE_COLOR,
        shape: payload.shape,
      },
    }

    onNodesChange([
      {
        type: "add",
        item: newNode,
      } satisfies NodeChange<CanvasNode>,
    ])
  }

  return (
    <div className="h-full w-full bg-background" onDragOver={onCanvasDragOver} onDrop={onCanvasDrop}>
      <ReactFlow
        nodes={nodes}
        edges={renderedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="h-full w-full"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = "copy"
        }}
      >
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <marker id="arrowhead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
              <path d="M0,0 L12,6 L0,12 L3,6 Z" fill="currentColor" />
            </marker>
          </defs>
        </svg>
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          className="opacity-[0.15] dark:opacity-[0.12]"
        />
        
        {/* Live Cursors */}
        {others.map(({ connectionId, presence, info }) => {
          if (!presence.cursor) return null
          const cursorColor = info?.cursorColor || "#71717a"
          return (
            <div
              key={connectionId}
              className="pointer-events-none absolute left-0 top-0 z-50 transition-all duration-100"
              style={{ transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)` }}
            >
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <polygon points="0,0 12,6 0,12" fill={cursorColor} />
                </svg>
                <div
                  className="rounded-full px-2 py-1 text-xs text-white shadow-sm flex items-center gap-1.5"
                  style={{ backgroundColor: cursorColor }}
                >
                  {presence.thinking && <Loader2 className="size-2.5 animate-spin" />}
                  {info?.displayName || "Collaborator"}
                </div>
              </div>
            </div>
          )
        })}
      </ReactFlow>
      
      {/* Control Bar */}
      <div className="absolute bottom-5 left-5 z-40">
        <CanvasControlBar />
      </div>

      {/* Avatars */}
      <div className="absolute right-4 top-4 z-40">
        <ParticipantAvatars />
      </div>

      {dragPreview ? (
        <div
          className="pointer-events-none absolute z-40"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <CanvasShapePreview
            shape={dragPreview.payload.shape}
            width={dragPreview.payload.size.width}
            height={dragPreview.payload.size.height}
            fillColor={DEFAULT_NODE_COLOR}
          />
        </div>
      ) : null}
      <ShapePanel onShapeDragStart={startShapeDragPreview} onShapeDragEnd={endShapeDragPreview} />
    </div>
  )
}

function CanvasControlBar() {
  const reactFlowInstance = useReactFlow<CanvasNode, CanvasEdge>()
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useKeyboardShortcuts({ reactFlowInstance, undo, redo })

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/90 p-1 shadow-lg backdrop-blur">
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => reactFlowInstance.zoomOut({ duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => reactFlowInstance.fitView({ duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Fit View"
        >
          <Maximize className="h-4 w-4" />
        </button>
        <button
          onClick={() => reactFlowInstance.zoomIn({ duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>
      <div className="mx-1 h-4 w-[1px] bg-border/70" />
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
          title="Undo (Cmd/Ctrl + Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
          title="Redo (Cmd/Ctrl + Shift + Z)"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function WorkspaceCanvas({ roomId, onSaveStatusChange }: WorkspaceCanvasProps) {
  return (
    <SyncedCanvasContent roomId={roomId} onSaveStatusChange={onSaveStatusChange} />
  )
}
