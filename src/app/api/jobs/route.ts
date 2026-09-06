import { NextRequest, NextResponse } from "next/server";
import { fallbackJobs } from "@/data/demo";
import { getJobOpenings } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const eligibility = request.nextUrl.searchParams.get("eligibility") ?? "all";

  try {
    const result = await getJobOpenings();
    const jobs = result.jobs.filter((job) => {
      const matchesQuery = !query || `${job.title} ${job.company}`.toLowerCase().includes(query);
      const matchesEligibility = eligibility === "all" || job.eligibility === eligibility;
      return matchesQuery && matchesEligibility;
    });

    return NextResponse.json({
      jobs: jobs.length ? jobs : result.jobs.length ? [] : fallbackJobs,
      sources: result.sources,
      isFallback: result.jobs.length === 0,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      jobs: fallbackJobs,
      sources: [
        { name: "Remotive", status: "unavailable" },
        { name: "Jobicy", status: "unavailable" },
        { name: "Adzuna", status: "unavailable" },
      ],
      isFallback: true,
      error: error instanceof Error ? error.message : "Job sources are unavailable.",
      fetchedAt: new Date().toISOString(),
    });
  }
}
