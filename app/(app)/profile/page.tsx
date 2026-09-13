import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentUser } from "@/lib/auth/server";
import { getProfileForUser } from "@/lib/db/profile";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileForUser(user.id) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Your profile</p>
        <h1 className="mt-2 font-display text-4xl">Help Clario understand your goals</h1>
        <p className="mt-3 text-ink-muted">These details are used to personalize your opportunity feed and assistant guidance.</p>
      </div>
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
