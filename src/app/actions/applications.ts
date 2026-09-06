"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type JobOpening,
} from "@/types/application";

type MutationResult = {
  ok: boolean;
  message: string;
  preview?: boolean;
};

async function authenticatedClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Your session has expired. Sign in again.");
  return { supabase, user: data.user };
}

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function safeHttpUrl(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export async function createApplication(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/applications?preview=1");

  const company = String(formData.get("company") ?? "").trim();
  const roleTitle = String(formData.get("role_title") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "saved") as ApplicationStatus;
  const workplaceType = String(formData.get("workplace_type") ?? "remote");
  const rawJobUrl = optionalText(formData, "job_url");

  if (
    !company ||
    company.length > 160 ||
    !roleTitle ||
    roleTitle.length > 200 ||
    !APPLICATION_STATUSES.includes(rawStatus) ||
    !["remote", "hybrid", "onsite"].includes(workplaceType) ||
    (rawJobUrl && !safeHttpUrl(rawJobUrl))
  ) {
    redirect("/applications/new?error=invalid");
  }

  const { supabase, user } = await authenticatedClient();
  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company,
    role_title: roleTitle,
    location: optionalText(formData, "location") ?? "Remote",
    workplace_type: workplaceType,
    job_url: safeHttpUrl(rawJobUrl),
    source: optionalText(formData, "source"),
    status: rawStatus,
    applied_at: optionalText(formData, "applied_at"),
    next_action_at: optionalText(formData, "next_action_at"),
    salary: optionalText(formData, "salary"),
    notes: optionalText(formData, "notes"),
  });

  if (error) redirect(`/applications/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/applications");
  redirect("/applications?created=1");
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<MutationResult> {
  if (!APPLICATION_STATUSES.includes(status)) {
    return { ok: false, message: "That status is not supported." };
  }

  if (!isSupabaseConfigured) {
    return { ok: true, preview: true, message: "Status updated in preview mode." };
  }

  try {
    const { supabase, user } = await authenticatedClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/applications");
    return { ok: true, message: "Application status updated." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Update failed." };
  }
}

export async function deleteApplication(id: string): Promise<MutationResult> {
  if (!isSupabaseConfigured) {
    return { ok: true, preview: true, message: "Application removed in preview mode." };
  }

  try {
    const { supabase, user } = await authenticatedClient();
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/applications");
    return { ok: true, message: "Application deleted." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Delete failed." };
  }
}

export async function addJobToTracker(job: JobOpening): Promise<MutationResult> {
  if (
    !job ||
    !job.id ||
    !job.title?.trim() ||
    job.title.length > 200 ||
    !job.company?.trim() ||
    job.company.length > 160 ||
    !["Remotive", "Jobicy", "Adzuna"].includes(job.source) ||
    !safeHttpUrl(job.url)
  ) {
    return { ok: false, message: "This listing contains invalid data." };
  }

  if (!isSupabaseConfigured) {
    return { ok: true, preview: true, message: "Job added in preview mode." };
  }

  try {
    const { supabase, user } = await authenticatedClient();
    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      company: job.company,
      role_title: job.title,
      location: job.location,
      workplace_type: "remote",
      job_url: safeHttpUrl(job.url),
      source: job.source,
      status: "saved",
      notes: `Eligibility: ${job.eligibilityReason.slice(0, 240)}`,
    });

    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/applications");
    return { ok: true, message: "Job saved to your tracker." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Save failed." };
  }
}
