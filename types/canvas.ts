import { type Edge, type Node } from "@xyflow/react"

export const NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED" },
  { fill: "#10233D", text: "#52A8FF" },
  { fill: "#2E1938", text: "#BF7AF0" },
  { fill: "#331B00", text: "#FF990A" },
  { fill: "#3C1618", text: "#FF6166" },
  { fill: "#3A1726", text: "#F75F8F" },
  { fill: "#0F2E18", text: "#62C073" },
  { fill: "#062822", text: "#0AC7B4" },
] as const

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const

export type CanvasNodeShape = (typeof NODE_SHAPES)[number]

export const CANVAS_NODE_TYPE = "canvasNode" as const
export const CANVAS_EDGE_TYPE = "canvasEdge" as const
export const CANVAS_SHAPE_DRAG_MIME = "application/x-ghostai-shape" as const
export const DEFAULT_NODE_COLOR = NODE_COLORS[0].fill

export interface CanvasNodeSize {
  width: number
  height: number
}

export interface CanvasShapeDragPayload {
  shape: CanvasNodeShape
  size: CanvasNodeSize
}

export const DEFAULT_SHAPE_SIZES: Readonly<Record<CanvasNodeShape, CanvasNodeSize>> = {
  rectangle: { width: 240, height: 120 },
  diamond: { width: 240, height: 150 },
  circle: { width: 160, height: 160 },
  pill: { width: 240, height: 112 },
  cylinder: { width: 220, height: 132 },
  hexagon: { width: 220, height: 132 },
}

export function isCanvasNodeShape(value: string): value is CanvasNodeShape {
  return NODE_SHAPES.includes(value as CanvasNodeShape)
}

export function serializeCanvasShapeDragPayload(payload: CanvasShapeDragPayload): string {
  return `shape=${payload.shape};width=${payload.size.width};height=${payload.size.height}`
}

export function parseCanvasShapeDragPayload(
  payload: string,
): CanvasShapeDragPayload | null {
  const match = /^shape=([a-z]+);width=(\d+);height=(\d+)$/.exec(payload)

  if (!match) {
    return null
  }

  const [, shape, widthValue, heightValue] = match

  if (!isCanvasNodeShape(shape)) {
    return null
  }

  const width = Number(widthValue)
  const height = Number(heightValue)

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null
  }

  return {
    shape,
    size: { width, height },
  }
}

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: (typeof NODE_COLORS)[number]["fill"]
  shape: CanvasNodeShape
}

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>
export type CanvasEdge = Edge<{ label: string }, typeof CANVAS_EDGE_TYPE>
