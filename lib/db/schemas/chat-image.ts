import { z } from "zod";

/**
 * Chat Image Schema
 * Stores images uploaded in AI chat conversations
 * Images are stored separately and referenced by ID in messages
 */
export const ChatImageSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  conversationId: z.string(),
  messageId: z.string(),
  // Image data
  filename: z.string(),
  mediaType: z.string(), // e.g., "image/png", "image/jpeg"
  data: z.string(), // Base64 encoded image data
  size: z.number(), // Size in bytes
  // Metadata
  createdAt: z.date(),
});

export type ChatImage = z.infer<typeof ChatImageSchema>;
export type CreateChatImage = Omit<ChatImage, "_id" | "createdAt">;
