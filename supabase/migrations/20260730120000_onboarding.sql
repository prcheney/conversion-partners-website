-- Client onboarding questionnaires (first use: CES Academy at /onboarding-ces).
--
-- Access model: no browser ever touches these tables. Every read and write goes
-- through the Next.js server using the service-role key, so RLS is enabled with
-- zero policies — anon and authenticated get nothing.

create extension if not exists "pgcrypto";

-- ── respondents ────────────────────────────────────────────────────────────
-- One row per person per questionnaire. Identified by email, not by login:
-- entering a known email resumes that person's progress.
create table public.respondents (
  id                 uuid primary key default gen_random_uuid(),
  questionnaire_slug text not null,
  name               text not null,
  email              text not null,
  resume_token       text not null unique,
  created_at         timestamptz not null default now(),
  last_seen_at       timestamptz not null default now()
);

create unique index respondents_slug_email_idx
  on public.respondents (questionnaire_slug, lower(email));

-- ── question_events ────────────────────────────────────────────────────────
-- What each person did with each question. One row per (question, person), so
-- revisiting and editing updates in place, while two different people answering
-- the same question both survive into the export. Nobody overwrites anybody.
create table public.question_events (
  id                 uuid primary key default gen_random_uuid(),
  questionnaire_slug text not null,
  question_id        text not null,
  respondent_id      uuid not null references public.respondents(id) on delete cascade,
  kind               text not null check (kind in ('answered', 'skipped')),
  body               text,
  via_assignment_id  uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index question_events_unique_idx
  on public.question_events (questionnaire_slug, question_id, respondent_id);

create index question_events_slug_idx
  on public.question_events (questionnaire_slug);

-- ── assignments ────────────────────────────────────────────────────────────
-- A single question handed to a teammate by email. The token is the only key
-- to that question's page; it grants access to that one question and nothing else.
create table public.assignments (
  id                 uuid primary key default gen_random_uuid(),
  questionnaire_slug text not null,
  question_id        text not null,
  assignee_name      text,
  assignee_email     text not null,
  note               text,
  assigned_by        uuid not null references public.respondents(id) on delete cascade,
  token              text not null unique,
  status             text not null default 'pending'
                       check (status in ('pending', 'completed', 'declined')),
  created_at         timestamptz not null default now(),
  email_sent_at      timestamptz,
  completed_at       timestamptz
);

create index assignments_slug_idx on public.assignments (questionnaire_slug);

-- Backs the per-respondent hourly send cap. /onboarding-ces is a public URL with
-- an outbound email form on it; without the cap it is an open relay pointed at
-- our verified sending domain.
create index assignments_rate_limit_idx
  on public.assignments (assigned_by, created_at desc);

alter table public.question_events
  add constraint question_events_assignment_fk
  foreign key (via_assignment_id) references public.assignments(id) on delete set null;

-- ── lock everything down ───────────────────────────────────────────────────
alter table public.respondents     enable row level security;
alter table public.question_events enable row level security;
alter table public.assignments     enable row level security;

revoke all on public.respondents     from anon, authenticated;
revoke all on public.question_events from anon, authenticated;
revoke all on public.assignments     from anon, authenticated;
