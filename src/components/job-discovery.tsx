"use client";

import {
  ArrowClockwiseIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { addJobToTracker } from "@/app/actions/applications";
import { EmptyState } from "@/components/empty-state";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { JobEligibility, JobOpening } from "@/types/application";

type SourceStatus = { name: string; status: "connected" | "unavailable" | "not_configured" };
type JobsResponse = {
  jobs: JobOpening[];
  sources: SourceStatus[];
  isFallback: boolean;
  fetchedAt: string;
  error?: string;
};

const eligibilityFilters: Array<{ value: "all" | JobEligibility; label: string }> = [
  { value: "all", label: "Best match" },
  { value: "eligible", label: "Nigeria compatible" },
  { value: "review", label: "Check eligibility" },
];

export function JobDiscovery() {
  const [payload, setPayload] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [eligibility, setEligibility] = useState<"all" | JobEligibility>("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  async function loadJobs(signal?: AbortSignal) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/jobs", { signal });
      if (!response.ok) throw new Error("The job feed could not be loaded.");
      const data = (await response.json()) as JobsResponse;
      setPayload(data);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(caught instanceof Error ? caught.message : "The job feed could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void loadJobs(controller.signal), 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const visibleJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (payload?.jobs ?? []).filter((job) => {
      const matchesQuery = !normalized || `${job.title} ${job.company}`.toLowerCase().includes(normalized);
      const matchesEligibility = eligibility === "all" || job.eligibility === eligibility;
      return matchesQuery && matchesEligibility;
    });
  }, [eligibility, payload, query]);

  function saveJob(job: JobOpening) {
    setSavingId(job.id);
    setNotice("");
    startTransition(async () => {
      const result = await addJobToTracker(job);
      setSavingId(null);
      setNotice(result.message);
      if (result.ok) setSaved((current) => new Set(current).add(job.id));
    });
  }

  if (loading) return <JobFeedSkeleton />;

  if (error && !payload) {
    return (
      <div className="surface">
        <EmptyState
          icon={WarningCircleIcon}
          title="The live feed is unavailable"
          description={error}
          action={<button type="button" className="button button-primary" onClick={() => loadJobs()}>Try again</button>}
        />
      </div>
    );
  }

  return (
    <>
      <section className="feed-toolbar surface" aria-label="Job feed controls">
        <label className="search-control feed-search">
          <MagnifyingGlassIcon size={18} aria-hidden="true" />
          <span className="sr-only">Search job openings</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search DevOps, cloud, or software roles" />
        </label>
        <div className="feed-filter-row">
          {eligibilityFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={cn("filter-button", eligibility === filter.value && "is-active")}
              onClick={() => setEligibility(filter.value)}
              aria-pressed={eligibility === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button type="button" className="icon-button" onClick={() => loadJobs()} aria-label="Refresh job feed" title="Refresh job feed">
          <ArrowClockwiseIcon size={18} />
        </button>
      </section>

      <div className="feed-meta">
        <div className="source-statuses" aria-label="Job sources">
          {(payload?.sources ?? []).map((source) => (
            <span className="source-state" data-state={source.status} key={source.name}>
              {source.name}: {source.status === "connected" ? "connected" : source.status === "not_configured" ? "add API key" : "unavailable"}
            </span>
          ))}
        </div>
        <span>{visibleJobs.length} matching roles</span>
      </div>

      {payload?.isFallback && (
        <div className="inline-notice feed-notice" data-tone="warning" role="status">
          Preview listings are shown because the live sources did not respond. Refresh to try again.
        </div>
      )}
      {notice && <div className="inline-notice feed-notice" role="status">{notice}</div>}

      {visibleJobs.length ? (
        <div className="job-list">
          {visibleJobs.map((job) => (
            <article className="job-card surface" key={job.id}>
              <div className="job-card-top">
                <div className="company-monogram job-logo" aria-hidden="true">{job.company.slice(0, 1).toUpperCase()}</div>
                <div className="job-title-block">
                  <h2>{job.title}</h2>
                  <p>{job.company}</p>
                </div>
                <span className="source-badge">{job.source}</span>
              </div>
              <div className="job-facts">
                <span><MapPinIcon size={15} /> {job.location}</span>
                {job.employmentType && <span><BriefcaseIcon size={15} /> {job.employmentType}</span>}
                <span>{formatRelativeDate(job.publishedAt)}</span>
              </div>
              <p className="job-description">{job.description || "Open the listing to review the full role details."}</p>
              <div className="job-card-bottom">
                <div>
                  <span className="eligibility-badge" data-tone={job.eligibility}>
                    {job.eligibility === "eligible" ? "Nigeria compatible" : job.eligibility === "restricted" ? "Likely restricted" : "Check eligibility"}
                  </span>
                  <small>{job.eligibilityReason}</small>
                </div>
                <div className="job-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => saveJob(job)}
                    disabled={isPending && savingId === job.id || saved.has(job.id)}
                  >
                    {saved.has(job.id) ? <CheckIcon size={16} weight="bold" /> : <PlusIcon size={16} weight="bold" />}
                    {saved.has(job.id) ? "Saved" : savingId === job.id ? "Saving..." : "Save"}
                  </button>
                  <a href={job.url} target="_blank" rel="noreferrer" className="button button-primary">
                    Apply
                    <ArrowUpRightIcon size={16} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface">
          <EmptyState
            title="No matching openings"
            description="Try a broader title or include roles that need an eligibility check."
            action={<button type="button" className="button button-secondary" onClick={() => { setQuery(""); setEligibility("all"); }}>Clear filters</button>}
          />
        </div>
      )}

      <p className="source-attribution">
        Listings link to their original source. Remotive and Adzuna results are displayed with required source attribution. Always confirm candidate location before applying.
      </p>
    </>
  );
}

function JobFeedSkeleton() {
  return (
    <div aria-label="Loading job openings">
      <div className="skeleton feed-toolbar surface" />
      <div className="job-list skeleton-list">
        {[0, 1, 2].map((item) => <div className="skeleton skeleton-job surface" key={item} />)}
      </div>
    </div>
  );
}
