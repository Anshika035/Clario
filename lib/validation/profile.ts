import { z } from "zod";

export const experienceLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const studentYearSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

const shortList = z
  .array(z.string().trim().min(1).max(40))
  .max(12);

export const profileSchema = z.object({
  year: studentYearSchema.nullable(),
  branch: z.string().trim().min(2).max(80).nullable(),
  experienceLevel: experienceLevelSchema.nullable(),
  interests: shortList,
  skills: shortList,
  goals: shortList,
});

export type ProfileInput = z.infer<typeof profileSchema>;
