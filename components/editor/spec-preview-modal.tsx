"use client"

import { useEffect, useState } from "react"
import { Download, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SpecPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  specId: string
  projectId: string
  filename: string
}

export function SpecPreviewModal({
  isOpen,
  onClose,
  specId,
  projectId,
  filename,
}: SpecPreviewModalProps) {
  const [content, setContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && specId) {
      fetchContent()
    }
  }, [isOpen, specId])

  const fetchContent = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Use the download endpoint to get the content
      const response = await fetch(`/api/projects/${projectId}/specs/${specId}/download`)
      if (!response.ok) throw new Error("Failed to fetch spec content")
      
      const text = await response.text()
      setContent(text)
    } catch (err) {
      console.error("Error fetching spec:", err)
      setError("Failed to load specification content.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    window.location.href = `/api/projects/${projectId}/specs/${specId}/download`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border/50 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between shrink-0">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {filename}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Technical Specification Preview
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 pr-8">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={handleDownload}
              disabled={isLoading || !!error}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-[#62C073]" />
              <p className="text-xs font-medium">Loading specification...</p>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-destructive">
              <X className="size-8" />
              <p className="text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchContent} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {content}
              </pre>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
