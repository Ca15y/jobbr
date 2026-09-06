import type { Metadata } from "next";
import { ApplicationTracker } from "@/components/application-tracker";
import { PageHeader } from "@/components/page-header";
import { getApplications } from "@/lib/applications";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; preview?: string }>;
}) {
  const [applications, params] = await Promise.all([getApplications(), searchParams]);
  const initialMessage = params.created
    ? "Application added to your tracker."
    : params.preview
      ? "Connect Supabase before adding persistent records."
      : undefined;

  return (
    <div className="page-wrap">
      <PageHeader
        title="Applications"
        description="Track each role from first save through the final decision."
      />
      <ApplicationTracker initialApplications={applications} initialMessage={initialMessage} />
    </div>
  );
}
