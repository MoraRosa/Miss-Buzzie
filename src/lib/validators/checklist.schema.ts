/**
 * Checklist validation schemas
 */
import { z } from "zod";

export const ChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  category: z.string(),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const ChecklistDataSchema = z.array(ChecklistItemSchema).default([]);

