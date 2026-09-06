import {
  ArrowUpRightIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getApplications, getViewer } from "@/lib/applications";
import { formatDate, formatRelativeDate } from "@/lib/utils";

export default async function OverviewPage() {
  const [applications, viewer] = await Promise.all([getApplications(), getViewer()]);
  const activeStatuses = new Set(["saved", "applied", "interviewing", "offer"]);
  const active = applications.filter((application) => activeStatuses.has(application.status)).length;
  const interviews = applications.filter((application) => application.status === "interviewing").length;
  const decisions = applications.filter((application) => ["accepted", "rejected"].includes(application.status));
  const accepted = decisions.filter((application) => application.status === "accepted").length;
  const outcomeRate = decisions.length ? `${Math.round((accepted / decisions.length) * 100)}%` : "No data";
  const recent = applications.slice(0, 5);
  const nextActions = applications
    .filter((application) => application.next_action_at && new Date(application.next_action_at) >= new Date())
    .sort((a, b) => Date.parse(a.next_action_at!) - Date.parse(b.next_action_at!))
    .slice(0, 3);

  const hour = Number(
    new Intl.DateTimeFormat("en-NG", { hour: "2-digit", hour12: false, timeZone: "Africa/Lagos" })
      .formatToParts(new Date())
      .find((part) => part.type === "hour")?.value ?? 12,
  );
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-wrap">
      <PageHeader
        title={`${greeting}.`}
        description={viewer.preview ? "Here is a realistic preview of your job search." : "Here is the latest movement in your job search."}
      />

      <section className="metric-strip surface" aria-label="Application summary">
        <div className="metric">
          <span>Tracked</span>
          <strong>{applications.length}</strong>
          <small>All applications</small>
        </div>
        <div className="metric">
          <span>Active</span>
          <strong>{active}</strong>
          <small>Still in progress</small>
        </div>
        <div className="metric">
          <span>Interviews</span>
          <strong>{interviews}</strong>
          <small>Current conversations</small>
        </div>
        <div className="metric">
          <span>Acceptance rate</span>
          <strong>{outcomeRate}</strong>
          <small>From recorded decisions</small>
        </div>
      </section>

      <div className="overview-grid">
        <section className="overview-main">
          <div className="section-heading">
            <h2 className="section-title">Recent applications</h2>
            <Link href="/applications" className="text-link">View all</Link>
          </div>
          <div className="application-list surface">
            {recent.map((application) => (
              <article className="application-row" key={application.id}>
                <div className="company-monogram" aria-hidden="true">
                  {application.company.slice(0, 1).toUpperCase()}
                </div>
                <div className="application-primary">
                  <h3>{application.role_title}</h3>
                  <p>{application.company} <span>/</span> {application.location}</p>
                </div>
                <StatusBadge status={application.status} />
                <time dateTime={application.updated_at}>{formatDate(application.updated_at, { year: undefined })}</time>
                {application.job_url ? (
                  <a
                    className="row-action"
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${application.role_title} listing`}
                  >
                    <ArrowUpRightIcon size={17} />
                  </a>
                ) : <span className="row-action-placeholder" />}
              </article>
            ))}
          </div>
        </section>

        <aside className="next-actions">
          <div className="section-heading">
            <h2 className="section-title">Next actions</h2>
          </div>
          <div className="next-action-panel surface">
            {nextActions.length ? (
              nextActions.map((application) => (
                <div className="next-action-item" key={application.id}>
                  <span className="next-action-icon" aria-hidden="true">
                    <CalendarBlankIcon size={18} />
                  </span>
                  <div>
                    <strong>{application.company}</strong>
                    <span>{application.role_title}</span>
                    <time dateTime={application.next_action_at!}>{formatRelativeDate(application.next_action_at!)}</time>
                  </div>
                </div>
              ))
            ) : (
              <div className="next-action-empty">
                <CheckCircleIcon size={24} />
                <strong>You are up to date</strong>
                <span>Add a follow-up date to keep momentum.</span>
              </div>
            )}
            <Link href="/applications" className="next-action-footer">
              <ClockIcon size={16} />
              Review your pipeline
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
