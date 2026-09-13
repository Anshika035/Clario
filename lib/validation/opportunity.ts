import { z } from "zod";
import type { OpportunityCategory } from "@/types/common";

const opportunityCategorySchema = z.enum([
  "internship",
  "hackathon",
  "course",
  "competition",
  "certification",
  "club",
  "event",
  "other",
]) satisfies z.ZodType<OpportunityCategory>;

export const opportunityInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Add a title for the opportunity.")
    .max(120, "Keep the title under 120 characters."),
  description: z
    .string()
    .trim()
    .min(20, "Add at least a short description of the opportunity.")
    .max(8000, "Keep the details under 8,000 characters."),
  organization: z.string().trim().max(160, "Keep the organization under 160 characters.").optional(),
  category: opportunityCategorySchema,
  url: z.string().trim().url("Enter a valid URL.").max(500).optional(),
});

export type OpportunityInputValues = z.infer<typeof opportunityInputSchema>;

export function normalizeOpportunityInput(input: OpportunityInputValues): OpportunityInputValues {
  return {
    title: input.title.replace(/\s+/g, " ").trim(),
    description: input.description.replace(/\s+/g, " ").trim(),
    organization: input.organization?.replace(/\s+/g, " ").trim() || undefined,
    category: input.category,
    url: input.url?.trim() || undefined,
  };
}
