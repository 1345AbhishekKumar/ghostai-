"use client"

import { useEffect } from "react"
import { type ReactFlowInstance, type Node, type Edge } from "@xyflow/react"

export function useKeyboardShortcuts<TNode extends Node, TEdge extends Edge>({
  reactFlowInstance,
  undo,
  redo,
}: {
  reactFlowInstance: ReactFlowInstance<TNode, TEdge>
  undo: () => void
  redo: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (e.key === "+" || e.key === "=") {
        e.preventDefault()
        reactFlowInstance.zoomIn({ duration: 200 })
      } else if (e.key === "-") {
        e.preventDefault()
        reactFlowInstance.zoomOut({ duration: 200 })
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault()
        redo()
      } else if (e.key === "Backspace" || e.key === "Delete") {
        const selectedNodes = reactFlowInstance.getNodes().filter(n => n.selected)
        const selectedEdges = reactFlowInstance.getEdges().filter(e => e.selected)
        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          e.preventDefault()
          reactFlowInstance.deleteElements({ nodes: selectedNodes, edges: selectedEdges })
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [reactFlowInstance, undo, redo])
}
