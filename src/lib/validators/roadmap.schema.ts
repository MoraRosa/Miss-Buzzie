/**
 * Roadmap validation schemas
 */
import { z } from "zod";

export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  timeframe: z.string(),
  category: z.enum(["1-year", "5-year", "10-year"]),
});
export type Milestone = z.infer<typeof MilestoneSchema>;

export const RoadmapDataSchema = z.array(MilestoneSchema).default([]);

