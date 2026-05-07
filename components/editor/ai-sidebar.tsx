"use client"

import { FileText, Send, Sparkles, MessageSquare } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AiSidebarProps {
  className?: string
}

export function AiSidebar({ className }: AiSidebarProps) {
  const [prompt, setPrompt] = useState("")

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
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="size-4 text-accent-ai" />
                  AI Assistant
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Describe the system architecture you want to build. I can generate nodes, connect services, and suggest improvements.
                </p>
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
              </div>
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 p-4">
            <div className="relative">
              <Textarea
                placeholder="Ask Ghost AI..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] w-full resize-none rounded-xl border-border/80 bg-muted/30 pb-12 pr-12 text-xs focus-visible:ring-accent-ai/50"
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
                  className="size-8 rounded-lg bg-accent-ai text-white hover:bg-accent-ai/90"
                  disabled={!prompt.trim()}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-center text-muted-foreground/60">
              Ghost AI can make mistakes. Check important info.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="m-0 flex flex-1 flex-col overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted/40">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground">No specs generated yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generate a technical specification once your architecture is ready.
                </p>
                <Button variant="outline" className="mt-4 w-full text-xs" disabled>
                  Generate Spec
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
