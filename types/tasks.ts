import { z } from "zod";

export const AiStatusSchema = z.object({
  text: z.string().optional(),
});

export type AiStatus = z.infer<typeof AiStatusSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderAvatar: z.string().optional(),
  content: z.string(),
  role: z.enum(["user", "assistant"]),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export interface DesignTaskOutput {
  success: boolean
  explanation: string
  actionCount: number
}

export interface SpecTaskOutput {
  specId: string
  filePath: string
}
