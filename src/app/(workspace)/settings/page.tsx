import type { Metadata } from "next";
import {
  CheckCircleIcon,
  CloudCheckIcon,
  DatabaseIcon,
  EnvelopeSimpleIcon,
  KeyIcon,
} from "@phosphor-icons/react/ssr";
import { saveSearchPreferences } from "@/app/actions/settings";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PageHeader } from "@/components/page-header";
import { getViewer } from "@/lib/applications";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

type SearchPreferences = {
  keywords?: string[];
  remote_only?: boolean;
  candidate_location?: string;
};

export default async function SettingsPage() {
  const viewer = await getViewer();
  let preferences: SearchPreferences = {
    keywords: ["devops", "cloud engineer", "software engineer", "site reliability"],
    remote_only: true,
    candidate_location: "Nigeria",
  };

  if (isSupabaseConfigured && !viewer.preview) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("search_preferences")
      .eq("id", viewer.id)
      .maybeSingle();
    if (data?.search_preferences) preferences = data.search_preferences as SearchPreferences;
  }

  const adzunaConfigured = Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);

  return (
    <div className="page-wrap settings-page">
      <PageHeader
        title="Settings"
        description="Manage your search preferences, sign-in method, and data connections."
      />

      <div className="settings-layout">
        <form action={saveSearchPreferences} className="settings-panel surface">
          <div className="settings-panel-heading">
            <span className="settings-icon" aria-hidden="true"><CloudCheckIcon size={20} /></span>
            <div>
              <h2>Job search preferences</h2>
              <p>These defaults keep the feed focused while allowing broader searches.</p>
            </div>
          </div>
          <div className="settings-fields">
            <div className="field">
              <label htmlFor="candidate_location">Candidate location</label>
              <input
                id="candidate_location"
                name="candidate_location"
                className="input"
                defaultValue={preferences.candidate_location ?? "Nigeria"}
              />
              <span className="field-hint">Used to rank roles by stated geographic eligibility.</span>
            </div>
            <div className="field">
              <label htmlFor="keywords">Priority roles and keywords</label>
              <textarea
                id="keywords"
                name="keywords"
                className="textarea"
                defaultValue={(preferences.keywords ?? []).join(", ")}
              />
              <span className="field-hint">Separate terms with commas. You can add more categories later.</span>
            </div>
          </div>
          <div className="settings-submit">
            <FormSubmitButton idleLabel="Save preferences" />
          </div>
        </form>

        <div className="settings-side">
          <section className="settings-panel surface">
            <div className="settings-panel-heading">
              <span className="settings-icon" aria-hidden="true"><DatabaseIcon size={20} /></span>
              <div>
                <h2>Connections</h2>
                <p>Your secrets remain in local environment variables.</p>
              </div>
            </div>
            <div className="connection-list">
              <div className="connection-row">
                <div>
                  <strong>Supabase</strong>
                  <span>Authentication and synced application data</span>
                </div>
                <span className="connection-state" data-ready={isSupabaseConfigured}>
                  {isSupabaseConfigured ? "Connected" : "Setup needed"}
                </span>
              </div>
              <div className="connection-row">
                <div>
                  <strong>Remotive and Jobicy</strong>
                  <span>Worldwide remote job sources</span>
                </div>
                <span className="connection-state" data-ready="true">Included</span>
              </div>
              <div className="connection-row">
                <div>
                  <strong>Adzuna</strong>
                  <span>Supplemental country-based listings</span>
                </div>
                <span className="connection-state" data-ready={adzunaConfigured}>
                  {adzunaConfigured ? "Connected" : "Optional"}
                </span>
              </div>
            </div>
          </section>

          <section className="settings-panel surface">
            <div className="settings-panel-heading">
              <span className="settings-icon" aria-hidden="true"><EnvelopeSimpleIcon size={20} /></span>
              <div>
                <h2>Passwordless sign-in</h2>
                <p>Magic links are sent to your account email.</p>
              </div>
            </div>
            <div className="account-setting">
              <span>Account</span>
              <strong>{viewer.email}</strong>
            </div>
          </section>

          {!isSupabaseConfigured && (
            <section className="settings-panel setup-panel surface">
              <div className="settings-panel-heading">
                <span className="settings-icon" aria-hidden="true"><KeyIcon size={20} /></span>
                <div>
                  <h2>Enable syncing</h2>
                  <p>Complete these project setup tasks once.</p>
                </div>
              </div>
              <ul className="setup-list">
                <li><CheckCircleIcon size={17} /> Create a Supabase project.</li>
                <li><CheckCircleIcon size={17} /> Run the included SQL migration.</li>
                <li><CheckCircleIcon size={17} /> Copy the environment template to .env.local.</li>
                <li><CheckCircleIcon size={17} /> Add the project URL and publishable key.</li>
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
