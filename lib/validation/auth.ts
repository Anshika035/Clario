import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Passwords can be at most 72 characters."),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
