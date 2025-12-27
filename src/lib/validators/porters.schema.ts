/**
 * Porter's Five Forces validation schemas
 */
import { z } from "zod";

export const FactorSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type Factor = z.infer<typeof FactorSchema>;

export const ForceSchema = z.object({
  rating: z.enum(["low", "medium", "high", ""]).default(""),
  factors: z.array(FactorSchema).default([]),
  notes: z.string().default(""),
});

export const PortersDataSchema = z.object({
  competitiveRivalry: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  supplierPower: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  buyerPower: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  threatOfSubstitutes: ForceSchema.default({ rating: "", factors: [], notes: "" }),
  threatOfNewEntrants: ForceSchema.default({ rating: "", factors: [], notes: "" }),
});
export type PortersData = z.infer<typeof PortersDataSchema>;

