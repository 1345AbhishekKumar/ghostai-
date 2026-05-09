"use client"

import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react"
import { type DragEvent } from "react"

import {
  CANVAS_SHAPE_DRAG_MIME,
  type CanvasShapeDragPayload,
  DEFAULT_SHAPE_SIZES,
  NODE_SHAPES,
  serializeCanvasShapeDragPayload,
} from "@/types/canvas"

const shapeIcons = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
} as const

interface ShapePanelProps {
  onShapeDragStart?: (payload: CanvasShapeDragPayload, position: { x: number; y: number }) => void
  onShapeDragEnd?: () => void
}

const transparentDragImage =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="

export function ShapePanel({
  onShapeDragStart: handleShapeDragStart,
  onShapeDragEnd: handleShapeDragEnd,
}: ShapePanelProps) {
  const onShapeDragStart = (event: DragEvent<HTMLButtonElement>, shape: (typeof NODE_SHAPES)[number]) => {
    const dragPayload: CanvasShapeDragPayload = {
      shape,
      size: DEFAULT_SHAPE_SIZES[shape],
    }
    const payload = serializeCanvasShapeDragPayload(dragPayload)

    const image = new Image()
    image.src = transparentDragImage

    event.dataTransfer.setDragImage(image, 0, 0)
    event.dataTransfer.setData(CANVAS_SHAPE_DRAG_MIME, payload)
    event.dataTransfer.setData("text/plain", payload)
    event.dataTransfer.effectAllowed = "copy"

    handleShapeDragStart?.(dragPayload, { x: event.clientX, y: event.clientY })
  }

  const onShapeDragEnd = () => {
    handleShapeDragEnd?.()
  }

  return (
    <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/90 bg-card/95 p-1 shadow-2xl shadow-background/70 backdrop-blur">
        {NODE_SHAPES.map((shape) => {
          const Icon = shapeIcons[shape]

          return (
            <button
              key={shape}
              type="button"
              draggable
              onDragStart={(event) => onShapeDragStart(event, shape)}
              onDragEnd={onShapeDragEnd}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:border-border hover:bg-background hover:text-foreground"
              aria-label={`Drag ${shape} shape onto canvas`}
              title={`Drag ${shape}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
