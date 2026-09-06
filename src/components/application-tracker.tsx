"use client";

import {
  ArrowUpRightIcon,
  CaretDownIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteApplication, updateApplicationStatus } from "@/app/actions/applications";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { cn, formatDate } from "@/lib/utils";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from "@/types/application";

const filters: Array<{ value: "all" | ApplicationStatus; label: string }> = [
  { value: "all", label: "All" },
  ...APPLICATION_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

export function ApplicationTracker({
  initialApplications,
  initialMessage,
}: {
  initialApplications: Application[];
  initialMessage?: string;
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState(initialMessage ?? "");
  const [isPending, startTransition] = useTransition();

  const visibleApplications = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesFilter = filter === "all" || application.status === filter;
      const matchesQuery =
        !normalized ||
        `${application.role_title} ${application.company} ${application.location}`
          .toLowerCase()
          .includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [applications, filter, query]);

  function changeStatus(id: string, status: ApplicationStatus) {
    const previous = applications;
    setApplications((items) =>
      items.map((item) => (item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item)),
    );
    setNotice("");

    startTransition(async () => {
      const result = await updateApplicationStatus(id, status);
      if (!result.ok) {
        setApplications(previous);
        setNotice(result.message);
      } else {
        setNotice(result.preview ? "Preview updated for this session." : result.message);
      }
    });
  }

  function removeApplication(id: string, label: string) {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    const previous = applications;
    setApplications((items) => items.filter((item) => item.id !== id));
    setNotice("");

    startTransition(async () => {
      const result = await deleteApplication(id);
      if (!result.ok) {
        setApplications(previous);
        setNotice(result.message);
      } else {
        setNotice(result.preview ? "Preview item removed for this session." : result.message);
      }
    });
  }

  return (
    <>
      {notice && (
        <div className="inline-notice tracker-notice" role="status" data-tone="neutral">
          {notice}
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">Dismiss</button>
        </div>
      )}

      <div className="tracker-toolbar">
        <label className="search-control">
          <MagnifyingGlassIcon size={18} aria-hidden="true" />
          <span className="sr-only">Search applications</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search company, role, or location"
          />
        </label>
        <div className="filter-scroll" aria-label="Filter applications by status">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={cn("filter-button", filter === item.value && "is-active")}
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
            >
              {item.label}
              <span>
                {item.value === "all"
                  ? applications.length
                  : applications.filter((application) => application.status === item.value).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {visibleApplications.length ? (
        <div className={cn("tracker-table surface", isPending && "is-updating")}>
          <div className="tracker-head" aria-hidden="true">
            <span>Role</span>
            <span>Status</span>
            <span>Applied</span>
            <span>Next action</span>
            <span />
          </div>
          {visibleApplications.map((application) => (
            <div className="tracker-entry" key={application.id}>
              <div className="tracker-row">
                <button
                  type="button"
                  className="application-identity"
                  onClick={() => setExpanded(expanded === application.id ? null : application.id)}
                  aria-expanded={expanded === application.id}
                >
                  <span className="company-monogram" aria-hidden="true">
                    {application.company.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <strong>{application.role_title}</strong>
                    <small>{application.company} / {application.location}</small>
                  </span>
                  <CaretDownIcon className={cn("expand-caret", expanded === application.id && "is-open")} size={15} />
                </button>

                <label className="status-control">
                  <span className="sr-only">Status for {application.role_title}</span>
                  <StatusBadge status={application.status} />
                  <select
                    value={application.status}
                    onChange={(event) => changeStatus(application.id, event.target.value as ApplicationStatus)}
                    disabled={isPending}
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option value={status} key={status}>{STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </label>
                <span className="tracker-date">{formatDate(application.applied_at, { year: undefined })}</span>
                <span className="tracker-date">{formatDate(application.next_action_at, { year: undefined })}</span>
                <div className="row-actions">
                  {application.job_url && (
                    <a href={application.job_url} target="_blank" rel="noreferrer" className="icon-button" aria-label="Open job listing">
                      <ArrowUpRightIcon size={17} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="icon-button delete-button"
                    onClick={() => removeApplication(application.id, `${application.role_title} at ${application.company}`)}
                    aria-label="Delete application"
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
              </div>

              {expanded === application.id && (
                <div className="tracker-details">
                  <div>
                    <span>Source</span>
                    <strong>{application.source || "Not recorded"}</strong>
                  </div>
                  <div>
                    <span>Salary</span>
                    <strong>{application.salary || "Not provided"}</strong>
                  </div>
                  <div className="tracker-note">
                    <span>Notes</span>
                    <p>{application.notes || "No notes yet."}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="surface">
          <EmptyState
            title={applications.length ? "No matching applications" : "Your tracker is ready"}
            description={applications.length ? "Try another search or status filter." : "Add your first application to begin tracking progress."}
            action={
              applications.length ? (
                <button type="button" className="button button-secondary" onClick={() => { setQuery(""); setFilter("all"); }}>
                  Clear filters
                </button>
              ) : (
                <Link href="/applications/new" className="button button-primary">Add application</Link>
              )
            }
          />
        </div>
      )}
    </>
  );
}
