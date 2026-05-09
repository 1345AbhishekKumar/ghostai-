"use client"

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react"
import { type CanvasEdge } from "@/types/canvas"
import { useState, useRef, useEffect } from "react"

export function CanvasBasicEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data?.label ?? "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(data?.label ?? "")
  }

  const handleBlur = () => {
    setIsEditing(false)
    updateEdgeData(id, { label: editValue })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
      e.preventDefault()
      setIsEditing(false)
      updateEdgeData(id, { label: editValue })
    }
  }

  const label = data?.label ?? ""
  const longestLineLength = Math.max(1, ...editValue.split("\n").map((line) => line.length))
  const editWidth = Math.min(220, Math.max(60, longestLineLength * 7 + 16))

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        interactionWidth={18}
        className={`transition-colors duration-200 ${
          selected ? "stroke-white" : "stroke-white/40 hover:stroke-white/70"
        }`}
        style={{ strokeWidth: 2, strokeDasharray: "none", strokeLinecap: "round" }}
        markerEnd="url(#arrowhead)"
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto absolute z-10 flex min-w-[20px] items-center justify-center"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          onDoubleClick={handleDoubleClick}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="nodrag nopan w-auto resize-none overflow-hidden rounded bg-white/10 px-1 py-0.5 text-center text-xs text-white outline-none"
              style={{ width: editWidth }}
              rows={Math.max(1, editValue.split("\n").length)}
            />
          ) : (
            <div className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80 transition-opacity hover:bg-white/20">
              {label || (selected ? <span className="text-white/40">Double-click to label</span> : null)}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
