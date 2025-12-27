/**
 * Org Chart validation schemas
 */
import { z } from "zod";

export const RoleSchema = z.object({
  id: z.string(),
  title: z.string(),
  name: z.string().default(""),
  department: z.string(),
  responsibilities: z.string(),
  reportsTo: z.string(),
  photoAssetId: z.string().optional(),
  bio: z.string().default(""),
  linkedinUrl: z.string().default(""),
});
export type Role = z.infer<typeof RoleSchema>;

export const OrgChartDataSchema = z.array(RoleSchema).default([]);

