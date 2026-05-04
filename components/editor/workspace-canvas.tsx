"use client"

import { type DragEvent, type ReactNode, Component, useMemo, useRef } from "react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type NodeChange,
  useReactFlow,
} from "@xyflow/react"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"

import { CanvasBasicNode } from "@/components/editor/canvas-basic-node"
import { ShapePanel } from "@/components/editor/shape-panel"
import {
  CANVAS_NODE_TYPE,
  CANVAS_SHAPE_DRAG_MIME,
  DEFAULT_NODE_COLOR,
  parseCanvasShapeDragPayload,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas"

interface WorkspaceCanvasProps {
  roomId: string
}

interface CanvasErrorBoundaryState {
  hasError: boolean
}

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  CanvasErrorBoundaryState
> {
  public state: CanvasErrorBoundaryState = { hasError: false }

  public static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center bg-background px-6 text-center">
          <div className="rounded-2xl border border-border/80 bg-card/70 px-6 py-5 shadow-xl shadow-background/30">
            <p className="text-sm font-medium text-foreground">
              Unable to connect to the collaborative canvas.
            </p>
            <p className="text-xs text-muted-foreground">
              Please refresh and try again.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="rounded-2xl border border-border/80 bg-card/70 px-5 py-4">
        <p className="text-sm text-muted-foreground">Loading collaborative canvas...</p>
      </div>
    </div>
  )
}

function SyncedCanvasContent() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>()
  const nodeCounterRef = useRef(0)
  const nodeTypes = useMemo(() => ({ [CANVAS_NODE_TYPE]: CanvasBasicNode }), [])

  const onCanvasDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  const onCanvasDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()

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
    <div className="relative h-full w-full bg-base" onDragOver={onCanvasDragOver} onDrop={onCanvasDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        onDragOver={onCanvasDragOver}
        onDrop={onCanvasDrop}
        className="h-full w-full bg-base"
      >
        <MiniMap
          className="!rounded-xl !border !border-border/70 !bg-card/90"
          maskColor="color-mix(in oklab, var(--background) 74%, transparent)"
        />
        <Controls
          showInteractive={false}
          className="!overflow-hidden !rounded-xl !border !border-border/70 !bg-card/90"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          className="opacity-55"
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  )
}

function SyncedCanvas() {
  return (
    <ReactFlowProvider>
      <SyncedCanvasContent />
    </ReactFlowProvider>
  )
}

export function WorkspaceCanvas({ roomId }: WorkspaceCanvasProps) {
  return (
    <div className="h-full w-full">
      <CanvasErrorBoundary>
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
          <RoomProvider
            id={roomId}
            initialPresence={{
              cursor: null,
              isThinking: false,
            }}
          >
            <ClientSideSuspense fallback={<CanvasLoadingState />}>
              {() => <SyncedCanvas />}
            </ClientSideSuspense>
          </RoomProvider>
        </LiveblocksProvider>
      </CanvasErrorBoundary>
    </div>
  )
}
