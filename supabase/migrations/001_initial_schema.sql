create type public.application_status as enum (
  'saved',
  'applied',
  'interviewing',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
  'no_response'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'Africa/Lagos',
  search_preferences jsonb not null default jsonb_build_object(
    'keywords', jsonb_build_array('devops', 'cloud engineer', 'software engineer', 'site reliability'),
    'remote_only', true,
    'candidate_location', 'Nigeria'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  company text not null check (char_length(company) between 1 and 160),
  role_title text not null check (char_length(role_title) between 1 and 200),
  location text not null default 'Remote',
  workplace_type text not null default 'remote' check (workplace_type in ('remote', 'hybrid', 'onsite')),
  job_url text,
  source text,
  status public.application_status not null default 'saved',
  applied_at date,
  next_action_at timestamptz,
  salary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  from_status public.application_status,
  to_status public.application_status not null,
  created_at timestamptz not null default now()
);

create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  external_id text not null,
  source text not null,
  title text not null,
  company text not null,
  location text not null default 'Remote',
  url text not null,
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, source, external_id)
);

create index applications_user_status_idx on public.applications(user_id, status);
create index applications_user_updated_idx on public.applications(user_id, updated_at desc);
create index application_events_application_idx on public.application_events(application_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.saved_jobs enable row level security;

create policy "Users manage their profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage their applications" on public.applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their application events" on public.application_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their saved jobs" on public.saved_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create or replace function public.record_application_status_change()
returns trigger
language plpgsql
security invoker
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.application_events (application_id, user_id, from_status, to_status)
    values (
      new.id,
      new.user_id,
      case when tg_op = 'INSERT' then null else old.status end,
      new.status
    );
  end if;
  return new;
end;
$$;

create trigger application_status_history
  after insert or update of status on public.applications
  for each row execute procedure public.record_application_status_change();
