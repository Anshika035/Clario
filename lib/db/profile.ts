import { createServiceRoleClient } from "@/lib/db/server";
import type { ProfileInput } from "@/lib/validation/profile";
import type { Profile } from "@/types/profile";

function mapProfile(data: {
  id: string;
  year: number | null;
  branch: string | null;
  experience_level: Profile["experienceLevel"];
  interests: string[] | null;
  skills: string[] | null;
  goals: string[] | null;
  created_at: string;
  updated_at: string;
}): Profile {
  return {
    id: data.id,
    year: data.year as Profile["year"],
    branch: data.branch,
    experienceLevel: data.experience_level,
    interests: data.interests ?? [],
    skills: data.skills ?? [],
    goals: data.goals ?? [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getProfileForUser(userId: string): Promise<Profile | null> {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Database is not configured.");
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, year, branch, experience_level, interests, skills, goals, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load the student profile.");
  }
  return data ? mapProfile(data) : null;
}

export async function saveProfileForUser(userId: string, input: ProfileInput): Promise<Profile> {
  const client = createServiceRoleClient();
  if (!client) {
    throw new Error("Database is not configured.");
  }

  const { data, error } = await client
    .from("profiles")
    .upsert({
      id: userId,
      year: input.year,
      branch: input.branch,
      experience_level: input.experienceLevel,
      interests: input.interests,
      skills: input.skills,
      goals: input.goals,
      updated_at: new Date().toISOString(),
    })
    .select("id, year, branch, experience_level, interests, skills, goals, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error("Could not save the student profile.");
  }
  return mapProfile(data);
}
