import type { ExperienceLevel, StudentYear } from "./common";

export type Profile = {
  id: string;
  year: StudentYear | null;
  branch: string | null;
  experienceLevel: ExperienceLevel | null;
  interests: string[];
  skills: string[];
  goals: string[];
  createdAt: string;
  updatedAt: string;
};
