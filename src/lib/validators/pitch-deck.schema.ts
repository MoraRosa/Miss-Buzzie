/**
 * Pitch Deck validation schemas
 */
import { z } from "zod";

export const SlideImageSchema = z.object({
  url: z.string(),
  size: z.enum(["small", "medium", "large", "full"]),
  alignment: z.enum(["left", "center", "right"]),
});

export const SlideSchema = z.object({
  title: z.string(),
  content: z.string(),
  images: z.array(SlideImageSchema).optional(),
});
export type Slide = z.infer<typeof SlideSchema>;

export const PitchDeckDataSchema = z.array(SlideSchema);

