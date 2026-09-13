import { z } from "zod";
import { studentYearSchema } from "./profile";

export const seniorReviewSchema = z.object({
  opportunityId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(50, "Share a bit more so other students can learn from it.")
    .max(1000, "Keep reviews under 1,000 characters."),
  studentYear: studentYearSchema,
  branch: z.string().trim().min(2).max(80),
  experienceDuration: z.string().trim().max(80).optional(),
  rating: z.number().min(0).max(10).optional(),
});

export type SeniorReviewInput = z.infer<typeof seniorReviewSchema>;
