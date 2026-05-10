import { useState, useEffect, useRef } from "react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

export function useCanvasAutosave(
  projectId: string,
  nodes: CanvasNode[],
  edges: CanvasEdge[]
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setSaveStatus("saving")

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodes, edges }),
        })

        if (!response.ok) {
          // 404 means the project was deleted — silently stop saving
          if (response.status === 404) {
            setSaveStatus("idle")
            return
          }
          throw new Error(`Save failed (${response.status})`)
        }

        setSaveStatus("saved")
        
        // Reset to idle after a few seconds
        setTimeout(() => {
          setSaveStatus((current) => current === "saved" ? "idle" : current)
        }, 3000)
      } catch (error) {
        console.error("Autosave error:", error)
        setSaveStatus("error")
      }
    }, 2000) // Debounce 2s

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [nodes, edges, projectId])

  return saveStatus
}
