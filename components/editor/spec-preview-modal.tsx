"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
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

 

  const fetchContent = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Use the download endpoint to get the content (no direct Blob URL access)
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

   useEffect(() => {
    if (isOpen && specId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchContent()
    }
  }, [isOpen, specId])

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
            <article className="prose prose-sm prose-invert max-w-none
              [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:border-b [&_h1]:border-border/50 [&_h1]:pb-2
              [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-2 [&_h2]:mt-5
              [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground/90 [&_h3]:mb-2 [&_h3]:mt-4
              [&_p]:text-sm [&_p]:text-foreground/80 [&_p]:leading-relaxed [&_p]:mb-3
              [&_ul]:text-sm [&_ul]:text-foreground/80 [&_ul]:leading-relaxed [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5
              [&_ol]:text-sm [&_ol]:text-foreground/80 [&_ol]:leading-relaxed [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5
              [&_li]:mb-1
              [&_code]:bg-muted/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:text-[#62C073]
              [&_pre]:bg-muted/40 [&_pre]:border [&_pre]:border-border/50 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-4
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground/90
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#62C073]/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-3
              [&_table]:w-full [&_table]:text-sm [&_table]:mb-4 [&_table]:border-collapse
              [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_th]:border-b [&_th]:border-border/50 [&_th]:pb-2 [&_th]:pr-4
              [&_td]:text-foreground/80 [&_td]:border-b [&_td]:border-border/30 [&_td]:py-2 [&_td]:pr-4
              [&_hr]:border-border/40 [&_hr]:my-6
              [&_strong]:text-foreground [&_strong]:font-semibold
              [&_a]:text-[#62C073] [&_a]:underline [&_a]:underline-offset-2
            ">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
