import type { Metadata } from "next";
import { JobDiscovery } from "@/components/job-discovery";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Find jobs" };

export default function OpportunitiesPage() {
  return (
    <div className="page-wrap opportunities-page">
      <PageHeader
        title="Find remote work"
        description="Fresh engineering roles ranked by relevance and candidate eligibility from Nigeria."
      />
      <JobDiscovery />
    </div>
  );
}
