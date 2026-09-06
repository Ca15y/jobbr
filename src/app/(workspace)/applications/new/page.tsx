import type { Metadata } from "next";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { createApplication } from "@/app/actions/applications";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PageHeader } from "@/components/page-header";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/types/application";

export const metadata: Metadata = { title: "Add application" };

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page-wrap narrow-page">
      <PageHeader
        title="Add application"
        description="Record the essentials now. You can update the outcome as the process moves."
        actions={
          <Link href="/applications" className="button button-secondary">
            <ArrowLeftIcon size={17} />
            Back
          </Link>
        }
      />

      {params.error && (
        <div className="inline-notice form-page-notice" data-tone="error" role="alert">
          {params.error === "invalid" ? "Company and role title are required." : decodeURIComponent(params.error)}
        </div>
      )}

      <form action={createApplication} className="application-form surface">
        <section className="form-section">
          <div className="form-section-heading">
            <h2>Role details</h2>
            <p>The company and role are the only required fields.</p>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" className="input" placeholder="Company name" required maxLength={160} />
            </div>
            <div className="field">
              <label htmlFor="role_title">Role title</label>
              <input id="role_title" name="role_title" className="input" placeholder="Cloud Platform Engineer" required maxLength={200} />
            </div>
            <div className="field">
              <label htmlFor="location">Location</label>
              <input id="location" name="location" className="input" placeholder="Worldwide or Remote, EMEA" defaultValue="Remote" />
            </div>
            <div className="field">
              <label htmlFor="workplace_type">Workplace type</label>
              <select id="workplace_type" name="workplace_type" className="select" defaultValue="remote">
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div className="field form-span-2">
              <label htmlFor="job_url">Job link</label>
              <input id="job_url" name="job_url" className="input" type="url" inputMode="url" placeholder="https://company.com/careers/role" />
              <span className="field-hint">Keep the original listing or application link for reference.</span>
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-heading">
            <h2>Application progress</h2>
            <p>Add dates that help you plan the next action.</p>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" className="select" defaultValue="applied">
                {APPLICATION_STATUSES.map((status) => (
                  <option value={status} key={status}>{STATUS_LABELS[status]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="applied_at">Date applied</label>
              <input id="applied_at" name="applied_at" className="input" type="date" />
            </div>
            <div className="field">
              <label htmlFor="next_action_at">Next follow-up</label>
              <input id="next_action_at" name="next_action_at" className="input" type="datetime-local" />
            </div>
            <div className="field">
              <label htmlFor="source">Source</label>
              <input id="source" name="source" className="input" placeholder="Company site, referral, or job board" />
            </div>
            <div className="field">
              <label htmlFor="salary">Salary</label>
              <input id="salary" name="salary" className="input" placeholder="Optional range and currency" />
            </div>
            <div className="field form-span-2">
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" className="textarea" placeholder="Key requirements, contact names, interview preparation, or follow-up context" />
            </div>
          </div>
        </section>

        <footer className="form-footer">
          <Link href="/applications" className="button button-quiet">Cancel</Link>
          <FormSubmitButton />
        </footer>
      </form>
    </div>
  );
}
