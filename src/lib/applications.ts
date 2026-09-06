import { redirect } from "next/navigation";
import { demoApplications } from "@/data/demo";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/types/application";

export async function getViewer() {
  if (!isSupabaseConfigured) {
    return { id: "preview-user", email: "preview@jobbr.app", preview: true };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return { id: data.user.id, email: data.user.email ?? "", preview: false };
}

export async function getApplications(): Promise<Application[]> {
  if (!isSupabaseConfigured) return demoApplications;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Application[];
}
