import { stripHtml } from "@/lib/utils";
import type { JobEligibility, JobOpening } from "@/types/application";

type RemotiveJob = {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo?: string;
  job_type?: string;
  publication_date: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
};

type JobicyJob = {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobType?: string[];
  jobGeo?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
};

type AdzunaJob = {
  id: string;
  redirect_url: string;
  title: string;
  description?: string;
  created: string;
  location?: { display_name?: string };
  company?: { display_name?: string };
  contract_time?: string;
  salary_min?: number;
  salary_max?: number;
};

const roleMatchers = [
  /devops/i,
  /cloud/i,
  /platform engineer/i,
  /site reliability/i,
  /\bsre\b/i,
  /infrastructure engineer/i,
  /software engineer/i,
  /software developer/i,
  /backend engineer/i,
  /full.?stack/i,
  /systems engineer/i,
  /release engineer/i,
];

function roleScore(title: string) {
  return roleMatchers.reduce((score, matcher, index) => {
    if (!matcher.test(title)) return score;
    return score + Math.max(7, 24 - index);
  }, 0);
}

function isRelevant(title: string) {
  return roleMatchers.some((matcher) => matcher.test(title));
}

function inferEligibility(location: string, description = ""): {
  eligibility: JobEligibility;
  eligibilityReason: string;
} {
  const locationText = location.toLowerCase();
  const descriptionText = description.slice(0, 1800).toLowerCase();
  const eligibleLocations = ["worldwide", "anywhere", "africa", "emea", "nigeria"];
  const explicitDescriptionTerms = [
    "open to candidates worldwide",
    "open to applicants worldwide",
    "work from anywhere",
    "based anywhere",
    "remote worldwide",
    "candidates in africa",
    "applicants in africa",
    "open to emea",
  ];
  const restrictedLocations = [
    "europe",
    "european union",
    "united states",
    "usa",
    "u.s.",
    "canada",
    "united kingdom",
    "uk",
    "apac",
    "latin america",
    "latam",
    "australia",
  ];

  if (
    eligibleLocations.some((term) => locationText.includes(term)) ||
    explicitDescriptionTerms.some((term) => descriptionText.includes(term))
  ) {
    return {
      eligibility: "eligible",
      eligibilityReason: locationText.includes("nigeria")
        ? "Nigeria is named in the listing"
        : locationText.includes("africa") || locationText.includes("emea")
          ? "Open to Africa or EMEA"
          : "Open worldwide",
    };
  }

  if (restrictedLocations.some((term) => locationText.includes(term))) {
    return {
      eligibility: "restricted",
      eligibilityReason: `The listing is limited to ${location}`,
    };
  }

  return {
    eligibility: "review",
    eligibilityReason: "Confirm location eligibility before applying",
  };
}

function freshnessScore(date: string) {
  const ageInDays = Math.max(0, (Date.now() - new Date(date).getTime()) / 86_400_000);
  return Math.max(0, 20 - Math.floor(ageInDays));
}

function makeScore(title: string, publishedAt: string, eligibility: JobEligibility) {
  const eligibilityScore = eligibility === "eligible" ? 50 : eligibility === "review" ? 15 : 0;
  return eligibilityScore + roleScore(title) + freshnessScore(publishedAt);
}

function salaryRange(min?: number, max?: number, currency?: string) {
  if (!min && !max) return null;
  const formatter = new Intl.NumberFormat("en-NG", {
    style: currency ? "currency" : "decimal",
    currency: currency || undefined,
    maximumFractionDigits: 0,
  });
  if (min && max) return `${formatter.format(min)}-${formatter.format(max)}`;
  return formatter.format(min ?? max ?? 0);
}

async function getRemotiveJobs(): Promise<JobOpening[]> {
  const response = await fetch("https://remotive.com/api/remote-jobs", {
    next: { revalidate: 21_600 },
    headers: { "User-Agent": "jobbr-personal-job-tracker/1.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Remotive returned ${response.status}`);
  const payload = (await response.json()) as { jobs?: RemotiveJob[] };

  return (payload.jobs ?? []).filter((job) => isRelevant(job.title)).map((job) => {
    const description = stripHtml(job.description ?? "");
    const location = job.candidate_required_location || "Remote, eligibility not specified";
    const eligibility = inferEligibility(location, description);
    return {
      id: `remotive-${job.id}`,
      source: "Remotive",
      title: job.title,
      company: job.company_name,
      location,
      url: job.url,
      description,
      publishedAt: job.publication_date,
      salary: job.salary || null,
      employmentType: job.job_type?.replaceAll("_", " ") ?? null,
      logoUrl: job.company_logo || null,
      ...eligibility,
      score: makeScore(job.title, job.publication_date, eligibility.eligibility),
    };
  });
}

async function getJobicyJobs(): Promise<JobOpening[]> {
  const response = await fetch("https://jobicy.com/api/v2/remote-jobs?count=100", {
    next: { revalidate: 21_600 },
    headers: { "User-Agent": "jobbr-personal-job-tracker/1.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Jobicy returned ${response.status}`);
  const payload = (await response.json()) as { jobs?: JobicyJob[] };

  return (payload.jobs ?? []).filter((job) => isRelevant(job.jobTitle)).map((job) => {
    const description = stripHtml(job.jobDescription || job.jobExcerpt || "");
    const location = job.jobGeo || "Remote, eligibility not specified";
    const eligibility = inferEligibility(location, description);
    return {
      id: `jobicy-${job.id}`,
      source: "Jobicy",
      title: job.jobTitle,
      company: job.companyName,
      location,
      url: job.url,
      description,
      publishedAt: job.pubDate,
      salary: salaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency),
      employmentType: job.jobType?.join(", ") ?? null,
      logoUrl: job.companyLogo || null,
      ...eligibility,
      score: makeScore(job.jobTitle, job.pubDate, eligibility.eligibility),
    };
  });
}

async function getAdzunaJobs(): Promise<JobOpening[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const countries = (process.env.ADZUNA_COUNTRIES || "za,gb,us")
    .split(",")
    .map((country) => country.trim())
    .filter(Boolean)
    .slice(0, 3);

  const results = await Promise.allSettled(
    countries.map(async (country) => {
      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: "40",
        what: "remote engineer",
        category: "it-jobs",
        sort_by: "date",
      });
      const response = await fetch(
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
        { next: { revalidate: 21_600 }, signal: AbortSignal.timeout(8_000) },
      );
      if (!response.ok) throw new Error(`Adzuna ${country} returned ${response.status}`);
      const payload = (await response.json()) as { results?: AdzunaJob[] };
      return payload.results ?? [];
    }),
  );

  return results
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((job) => isRelevant(job.title))
    .map((job) => {
      const description = stripHtml(job.description ?? "");
      const location = job.location?.display_name || "Remote, eligibility not specified";
      const eligibility = inferEligibility(location, description);
      return {
        id: `adzuna-${job.id}`,
        source: "Adzuna" as const,
        title: job.title,
        company: job.company?.display_name || "Company not listed",
        location,
        url: job.redirect_url,
        description,
        publishedAt: job.created,
        salary: salaryRange(job.salary_min, job.salary_max),
        employmentType: job.contract_time?.replaceAll("_", " ") ?? null,
        logoUrl: null,
        ...eligibility,
        score: makeScore(job.title, job.created, eligibility.eligibility),
      };
    });
}

function deduplicateJobs(jobs: JobOpening[]) {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.company}-${job.title}`.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getJobOpenings() {
  const sourceResults = await Promise.allSettled([
    getRemotiveJobs(),
    getJobicyJobs(),
    getAdzunaJobs(),
  ]);
  const sourceNames = ["Remotive", "Jobicy", "Adzuna"];
  const jobs = deduplicateJobs(
    sourceResults.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
  ).sort((a, b) => b.score - a.score || Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  return {
    jobs,
    sources: sourceResults.map((result, index) => ({
      name: sourceNames[index],
      status:
        sourceNames[index] === "Adzuna" && !process.env.ADZUNA_APP_ID
          ? "not_configured"
          : result.status === "fulfilled"
            ? "connected"
            : "unavailable",
    })),
  };
}
