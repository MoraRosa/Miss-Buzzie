/**
 * SWOT Analysis validation schemas
 */
import { z } from "zod";

export const SWOTItemSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type SWOTItem = z.infer<typeof SWOTItemSchema>;

export const SWOTDataSchema = z.object({
  strengths: z.array(SWOTItemSchema).default([]),
  weaknesses: z.array(SWOTItemSchema).default([]),
  opportunities: z.array(SWOTItemSchema).default([]),
  threats: z.array(SWOTItemSchema).default([]),
});
export type SWOTData = z.infer<typeof SWOTDataSchema>;

