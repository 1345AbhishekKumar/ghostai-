"use client"

import { useState, useRef, useEffect } from "react"
import { Handle, Position, NodeResizer, type NodeProps, useReactFlow } from "@xyflow/react"

import { NODE_COLORS, type CanvasNode, type CanvasNodeShape } from "@/types/canvas"

interface CanvasShapeSurfaceProps {
  shape: CanvasNodeShape
  fillColor: string
  borderColor: string
  textColor: string
  label: string
  onLabelChange?: (value: string) => void
}

function CanvasShapeSurface({
  shape,
  fillColor,
  borderColor,
  textColor,
  label,
  onLabelChange,
}: CanvasShapeSurfaceProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (!onLabelChange) return
    setIsEditing(true)
    setEditValue(label)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setEditValue(value)
    onLabelChange?.(value)
  }

  const handleBlur = () => setIsEditing(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" || e.key === "Enter" && e.shiftKey) {
      setIsEditing(false)
    }
  }

  const commonLabel = (
    <div
      className="absolute inset-0 flex items-center justify-center px-4"
      onDoubleClick={handleDoubleClick}
      style={{ color: textColor }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type something..."
          className="nodrag nopan m-0 w-full resize-none appearance-none overflow-hidden bg-transparent p-0 text-center text-sm outline-none placeholder:text-current/50"
          rows={Math.max(1, editValue.split("\n").length)}
        />
      ) : (
        <span className="pointer-events-none line-clamp-3 text-center text-sm">
          {label || <span className="opacity-50">Double-click to edit</span>}
        </span>
      )}
    </div>
  )

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    const shapeClass =
      shape === "pill"
        ? "rounded-full"
        : shape === "circle"
          ? "rounded-[9999px]"
          : "rounded-xl"

    return (
      <div className="relative h-full w-full overflow-hidden">
        <div
          className={`absolute inset-0 border ${shapeClass}`}
          style={{ backgroundColor: fillColor, borderColor }}
        />
        {commonLabel}
      </div>
    )
  }

  if (shape === "diamond") {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <polygon
            points="50,2 98,50 50,98 2,50"
            style={{ fill: fillColor, stroke: borderColor, strokeWidth: 1.6 }}
          />
        </svg>
        {commonLabel}
      </div>
    )
  }

  if (shape === "hexagon") {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <polygon
            points="25,4 75,4 98,50 75,96 25,96 2,50"
            style={{ fill: fillColor, stroke: borderColor, strokeWidth: 1.6 }}
          />
        </svg>
        {commonLabel}
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <path d="M6,14 H94 V86 H6 Z" style={{ fill: fillColor, stroke: borderColor, strokeWidth: 1.6 }} />
        <ellipse cx="50" cy="14" rx="44" ry="10" style={{ fill: fillColor, stroke: borderColor, strokeWidth: 1.6 }} />
        <ellipse cx="50" cy="86" rx="44" ry="10" style={{ fill: fillColor, stroke: borderColor, strokeWidth: 1.6 }} />
      </svg>
      {commonLabel}
    </div>
  )
}

function getTextColor(fillColor: string) {
  const color = NODE_COLORS.find((pair) => pair.fill === fillColor)
  return color?.text ?? NODE_COLORS[0].text
}

export interface CanvasShapePreviewProps {
  shape: CanvasNodeShape
  width: number
  height: number
  fillColor: string
}

export function CanvasShapePreview({ shape, width, height, fillColor }: CanvasShapePreviewProps) {
  return (
    <div
      className="pointer-events-none opacity-75"
      style={{
        width,
        height,
      }}
    >
      <CanvasShapeSurface
        shape={shape}
        fillColor={fillColor}
        borderColor="rgba(255, 255, 255, 0.48)"
        textColor={getTextColor(fillColor)}
        label=""
      />
    </div>
  )
}

export function CanvasBasicNode({ id, data, selected }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow()
  const borderColor = selected ? "rgba(255, 255, 255, 0.64)" : "rgba(255, 255, 255, 0.26)"
  const handleVisibilityClass = selected ? "opacity-100" : "opacity-0 transition-opacity group-hover:opacity-100"
  const handleClassName = `!h-2 !w-2 !border !border-base-900 !bg-white ${handleVisibilityClass}`

  const handleLabelChange = (value: string) => {
    updateNodeData(id, { label: value })
  }

  return (
    <div className="group relative h-full w-full">
      {selected && (
        <div className="nodrag nopan absolute -top-14 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1.5 shadow-xl">
          {NODE_COLORS.map((colorPair) => {
            const isActive = data.color === colorPair.fill
            return (
              <button
                key={colorPair.fill}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  updateNodeData(id, { color: colorPair.fill })
                }}
                className={`group/swatch relative h-6 w-6 shrink-0 rounded-full border border-white/10 transition-all ${
                  isActive ? "scale-110" : "hover:scale-110"
                }`}
                style={{ backgroundColor: colorPair.fill }}
              >
                <div
                  className={`pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 ${
                    isActive ? "" : "group-hover/swatch:opacity-100"
                  }`}
                  style={{ boxShadow: `0 0 6px 1px ${colorPair.text}66` }}
                />
                {isActive && (
                  <div
                    className="pointer-events-none absolute -inset-[3px] rounded-full border-2"
                    style={{ borderColor: colorPair.text }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        handleClassName="!h-2.5 !w-2.5 !rounded-sm !border-0 !bg-white/80"
        lineClassName="!border-white/20"
      />
      <CanvasShapeSurface
        shape={data.shape}
        fillColor={data.color}
        borderColor={borderColor}
        textColor={getTextColor(data.color)}
        label={data.label}
        onLabelChange={handleLabelChange}
      />
      <Handle type="source" position={Position.Top} id="top" className={handleClassName} />
      <Handle type="source" position={Position.Right} id="right" className={handleClassName} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClassName} />
      <Handle type="source" position={Position.Left} id="left" className={handleClassName} />
    </div>
  )
}
