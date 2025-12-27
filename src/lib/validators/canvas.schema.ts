/**
 * Business Model Canvas validation schemas
 */
import { z } from "zod";

export const CanvasDataSchema = z.object({
  keyPartners: z.string().default(""),
  keyActivities: z.string().default(""),
  keyResources: z.string().default(""),
  valuePropositions: z.string().default(""),
  customerRelationships: z.string().default(""),
  channels: z.string().default(""),
  customerSegments: z.string().default(""),
  costStructure: z.string().default(""),
  revenueStreams: z.string().default(""),
});
export type CanvasData = z.infer<typeof CanvasDataSchema>;

