"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function saveSearchPreferences(formData: FormData) {
  if (!isSupabaseConfigured) return;

  const keywords = String(formData.get("keywords") ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((keyword) => keyword.slice(0, 80));
  const candidateLocation = String(formData.get("candidate_location") ?? "Nigeria").trim().slice(0, 120);

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  await supabase.from("profiles").upsert({
    id: data.user.id,
    timezone: "Africa/Lagos",
    search_preferences: {
      keywords,
      remote_only: true,
      candidate_location: candidateLocation || "Nigeria",
    },
  });

  revalidatePath("/settings");
}
