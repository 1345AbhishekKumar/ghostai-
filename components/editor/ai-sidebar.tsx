"use client"

import { FileText, Send, Sparkles, MessageSquare, Loader2, User, Download, ExternalLink, Plus } from "lucide-react"
import Image from "next/image"
import { useState, useMemo, useRef, useEffect } from "react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { useStorage, useMutation, useSelf } from "@liveblocks/react/suspense"
import { LiveObject } from "@liveblocks/client"
import { useUser } from "@clerk/nextjs"
import { useReactFlow } from "@xyflow/react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AiStatusSchema, ChatMessageSchema, type ChatMessage } from "@/types/tasks"
import { SpecPreviewModal } from "@/components/editor/spec-preview-modal"

interface ProjectSpec {
  id: string
  projectId: string
  createdAt: string
  filename: string
  filePath: string
}

interface AiSidebarProps {
  className?: string
  roomId: string
  projectId: string
}

export function AiSidebar({ className, roomId, projectId }: AiSidebarProps) {
  const { user } = useUser()
  const { getNodes, getEdges } = useReactFlow()
  const [prompt, setPrompt] = useState("")
  const [isTriggering, setIsTriggering] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Specs state
  const [specs, setSpecs] = useState<ProjectSpec[]>([])
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false)
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<ProjectSpec | null>(null)

  const aiStatusFeed = useStorage((root) => root["ai-status-feed"])
  const aiChat = useStorage((root) => root["ai-chat"])
  
  const messages = useMemo(() => {
    if (!aiChat) return []
    return aiChat.map((msg) => {
      const result = ChatMessageSchema.safeParse(msg)
      return result.success ? result.data : null
    }).filter((msg): msg is ChatMessage => msg !== null)
  }, [aiChat])

  // Fetch specs on mount and when projectId changes
  useEffect(() => {
    fetchSpecs()
  }, [projectId])

  const fetchSpecs = async () => {
    setIsLoadingSpecs(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/specs`)
      if (response.ok) {
        const data = await response.json()
        setSpecs(data)
      }
    } catch (error) {
      console.error("Failed to fetch specs:", error)
    } finally {
      setIsLoadingSpecs(false)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = useMutation(({ storage }, message: ChatMessage) => {
    const chat = storage.get("ai-chat")
    chat.push(new LiveObject(message))
  }, [])

  const sharedAiStatus = useMemo(() => {
    if (!aiStatusFeed) return null
    const result = AiStatusSchema.safeParse(aiStatusFeed)
    return result.success ? result.data.text : null
  }, [aiStatusFeed])

  const { run } = useRealtimeRun(runId || "", {
    accessToken: token || "",
    enabled: !!runId && !!token,
  })

  // Push final AI message when run completes
  useEffect(() => {
    if (run?.status === "COMPLETED" && run.output && runId) {
      // Check if it was a design task or spec task
      if ((run.output as any).explanation) {
        const explanation = (run.output as any).explanation
        addMessage({
          id: `ai-${runId}-${Date.now()}`,
          senderId: "ghost-ai",
          senderName: "Ghost AI",
          senderAvatar: "",
          content: explanation,
          role: "assistant",
          timestamp: Date.now(),
        })
      } else if ((run.output as any).specId) {
        // It was a spec generation task
        fetchSpecs()
      }
      
      // Reset local run state so we don't post again and to clear the loading state
      setRunId(null)
      setToken(null)
    }
  }, [run?.status, run?.output, runId, addMessage])

  const handleSend = async () => {
    if (!prompt.trim() || isTriggering || !user) return

    const messageContent = prompt.trim()
    setPrompt("") // Clear input immediately for better UX

    // 1. Add message to collaborative chat
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      senderId: user.id,
      senderName: user.fullName || user.username || "Anonymous",
      senderAvatar: user.imageUrl,
      content: messageContent,
      role: "user",
      timestamp: Date.now(),
    }
    addMessage(newMessage)

    setIsTriggering(true)
    setRunId(null)
    setToken(null)

    try {
      // 2. Trigger the task and get token in one call
      const response = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: messageContent, roomId, projectId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to trigger design agent")
      }
      
      const { runId: newRunId, publicToken } = await response.json()
      setRunId(newRunId)
      setToken(publicToken)
    } catch (error) {
      console.error("AI Trigger Error:", error)
      // Push error message to chat
      addMessage({
        id: `err-${Date.now()}`,
        senderId: "system",
        senderName: "System",
        content: `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
        role: "assistant",
        timestamp: Date.now(),
      })
    } finally {
      setIsTriggering(false)
    }
  }

  const handleGenerateSpec = async () => {
    if (isGeneratingSpec || isAiWorking) return

    setIsGeneratingSpec(true)
    try {
      const response = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory: messages,
          nodes: getNodes(),
          edges: getEdges(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to trigger spec generation")
      }

      const { runId: newRunId } = await response.json()
      
      // Get a token for this run to monitor it
      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })

      if (tokenResponse.ok) {
        const { publicToken } = await tokenResponse.json()
        setRunId(newRunId)
        setToken(publicToken)
      }
    } catch (error) {
      console.error("Spec Generation Error:", error)
    } finally {
      setIsGeneratingSpec(false)
    }
  }

  const aiStatus = sharedAiStatus || (run?.metadata?.status as string) || (run?.status === "EXECUTING" ? "Processing..." : null)
  const isAiWorking = !!aiStatus || isTriggering || run?.status === "QUEUED" || run?.status === "EXECUTING"

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      <Tabs defaultValue="assistant" className="flex h-full flex-col">
        <div className="border-b border-border/50 px-4 py-2">
          <TabsList variant="line" className="w-full justify-start gap-4">
            <TabsTrigger value="assistant" className="gap-2 px-0 text-xs">
              <MessageSquare className="size-3.5" />
              Assistant
            </TabsTrigger>
            <TabsTrigger value="specs" className="gap-2 px-0 text-xs">
              <FileText className="size-3.5" />
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="assistant" className="m-0 flex flex-1 flex-col overflow-hidden">
          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
            <div className="space-y-6">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Sparkles className="size-4 text-[#62C073]" />
                    AI Assistant
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Describe the system architecture you want to build. I can generate nodes, connect services, and suggest improvements.
                  </p>
                  
                  {!isAiWorking && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                        Try asking:
                      </p>
                      <button 
                        onClick={() => setPrompt("Design a microservices architecture for an e-commerce platform with a payment gateway and inventory service.")}
                        className="block w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                      >
                        &quot;Design a microservices architecture for an e-commerce platform...&quot;
                      </button>
                      <button 
                        onClick={() => setPrompt("Add a Redis cache between the API gateway and the user service.")}
                        className="block w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/50"
                      >
                        &quot;Add a Redis cache between the API gateway and the user service.&quot;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex flex-col gap-2",
                    message.senderId === user?.id ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 px-1">
                    {message.senderId !== user?.id && (
                      <div className="size-5 overflow-hidden rounded-full bg-muted flex items-center justify-center">
                        {message.senderAvatar ? (
                          <Image src={message.senderAvatar} alt="" width={20} height={20} className="size-full object-cover rounded-full" />
                        ) : (
                          <User className="size-3 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {message.senderId === user?.id ? "You" : message.senderName}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div 
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm",
                      message.senderId === user?.id 
                        ? "bg-[#62C073] text-white rounded-tr-none" 
                        : "bg-muted/80 text-foreground border border-border/50 rounded-tl-none"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 p-4">
            {/* Status strip - shown only during active runs */}
            {isAiWorking && aiStatus && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-card border border-border/50 px-3 py-2 text-[10px] text-foreground shadow-sm animate-in fade-in slide-in-from-bottom-1">
                <Loader2 className="size-3 animate-spin text-[#62C073]" />
                <span className="flex-1 font-medium truncate">{aiStatus}</span>
              </div>
            )}

            <div className="relative">
              <Textarea
                placeholder="Ask Ghost AI..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isAiWorking}
                className="min-h-[100px] w-full resize-none rounded-xl border-border/80 bg-muted/30 pb-12 pr-12 text-xs focus-visible:ring-[#62C073]/50"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <Sparkles className="size-4" />
                </Button>
                <Button 
                  size="icon" 
                  className="size-8 rounded-lg bg-[#62C073] text-white hover:bg-[#62C073]/90"
                  disabled={!prompt.trim() || isAiWorking}
                  onClick={handleSend}
                >
                  {isTriggering || run?.status === "QUEUED" || run?.status === "EXECUTING" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-center text-muted-foreground/60">
              Ghost AI can make mistakes. Check important info.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="m-0 flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-2 shrink-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Generated Specifications
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-6 rounded-md hover:bg-muted"
              onClick={handleGenerateSpec}
              disabled={isAiWorking || isGeneratingSpec}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {isLoadingSpecs ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  <p className="text-[10px]">Loading specs...</p>
                </div>
              ) : specs.length > 0 ? (
                <div className="space-y-2">
                  {specs.map((spec) => (
                    <div 
                      key={spec.id}
                      className="group relative flex flex-col gap-1 rounded-xl border border-border/50 bg-card p-3 transition-colors hover:border-[#62C073]/50 hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                            {spec.filename}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(spec.createdAt).toLocaleDateString()} at {new Date(spec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedSpec(spec)}
                          >
                            <ExternalLink className="size-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/api/projects/${projectId}/specs/${spec.id}/download`;
                            }}
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <button 
                        className="absolute inset-0 z-0 cursor-pointer" 
                        onClick={() => setSelectedSpec(spec)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted/40">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">No specs generated yet</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Generate a technical specification once your architecture is ready.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full text-xs" 
                    onClick={handleGenerateSpec}
                    disabled={isAiWorking || isGeneratingSpec}
                  >
                    {isAiWorking ? (
                      <Loader2 className="size-3 animate-spin mr-2" />
                    ) : (
                      <Plus className="size-3 mr-2" />
                    )}
                    Generate Spec
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Status strip for spec generation */}
          {isAiWorking && aiStatus && (
            <div className="border-t border-border/50 p-4 shrink-0">
              <div className="flex items-center gap-2 rounded-lg bg-card border border-border/50 px-3 py-2 text-[10px] text-foreground shadow-sm animate-in fade-in slide-in-from-bottom-1">
                <Loader2 className="size-3 animate-spin text-[#62C073]" />
                <span className="flex-1 font-medium truncate">{aiStatus}</span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedSpec && (
        <SpecPreviewModal
          isOpen={!!selectedSpec}
          onClose={() => setSelectedSpec(null)}
          specId={selectedSpec.id}
          projectId={projectId}
          filename={selectedSpec.filename}
        />
      )}
    </div>
  )
}
