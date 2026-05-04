"use client"

import { Handle, Position, type NodeProps } from "@xyflow/react"

import { type CanvasNode } from "@/types/canvas"

export function CanvasBasicNode({ data }: NodeProps<CanvasNode>) {
  return (
    <div
      className="group relative flex h-full w-full items-center justify-center rounded-xl border border-border/70 bg-card px-3 text-center text-sm text-foreground"
      style={{ backgroundColor: data.color }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!h-2 !w-2 !border-0 !bg-white opacity-0 transition-opacity group-hover:opacity-100"
      />
      <span className="pointer-events-none line-clamp-2">{data.label || " "}</span>
    </div>
  )
}
