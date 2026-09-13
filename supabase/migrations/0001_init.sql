-- Vibethon initial schema
-- Apply in the Supabase SQL editor or via the CLI. RLS stays enabled.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  year smallint,
  branch text,
  experience_level text,
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  goals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_year_check check (year is null or year between 1 and 4),
  constraint profiles_experience_level_check check (
    experience_level is null
    or experience_level in ('beginner', 'intermediate', 'advanced')
  )
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  raw_text text not null,
  parsed_input jsonb,
  title text,
  category text,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  constraint opportunities_verification_status_check check (
    verification_status in (
      'unverified',
      'community_supported',
      'flagged',
      'insufficient_evidence'
    )
  )
);

create table if not exists public.opportunity_analyses (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  schema_version integer not null default 1,
  model text,
  overall_score numeric(4, 1),
  result jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.opportunity_analyses
  alter column overall_score type numeric(4, 1);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  student_year smallint not null,
  branch text not null,
  experience_duration text,
  rating numeric(3, 1),
  created_at timestamptz not null default now(),
  constraint reviews_student_year_check check (student_year between 1 and 4),
  constraint reviews_rating_check check (rating is null or (rating >= 0 and rating <= 10)),
  constraint reviews_one_per_author unique (opportunity_id, author_id)
);

create table if not exists public.review_votes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  voter_id uuid not null references public.profiles (id) on delete cascade,
  value text not null,
  created_at timestamptz not null default now(),
  primary key (review_id, voter_id),
  constraint review_votes_value_check check (value in ('useful', 'not_useful'))
);

create table if not exists public.assistant_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.assistant_threads (id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint assistant_messages_role_check check (role in ('user', 'assistant'))
);

create index if not exists opportunities_created_by_idx on public.opportunities (created_by);
create index if not exists opportunity_analyses_opportunity_id_idx
  on public.opportunity_analyses (opportunity_id, created_at desc);
create index if not exists reviews_opportunity_id_idx on public.reviews (opportunity_id);
create index if not exists assistant_messages_thread_id_idx
  on public.assistant_messages (thread_id, created_at);

alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_analyses enable row level security;
alter table public.reviews enable row level security;
alter table public.review_votes enable row level security;
alter table public.assistant_threads enable row level security;
alter table public.assistant_messages enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "opportunities_select_authenticated"
  on public.opportunities for select
  to authenticated
  using (true);

create policy "opportunities_insert_own"
  on public.opportunities for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "opportunity_analyses_select_authenticated"
  on public.opportunity_analyses for select
  to authenticated
  using (
    exists (
      select 1
      from public.opportunities o
      where o.id = opportunity_id
    )
  );

-- Analysis writes are server-side only; the service role bypasses RLS.

create policy "reviews_select_authenticated"
  on public.reviews for select
  to authenticated
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "reviews_update_own"
  on public.reviews for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "review_votes_select_authenticated"
  on public.review_votes for select
  to authenticated
  using (true);

create policy "review_votes_insert_own"
  on public.review_votes for insert
  to authenticated
  with check (voter_id = auth.uid());

create policy "review_votes_update_own"
  on public.review_votes for update
  to authenticated
  using (voter_id = auth.uid())
  with check (voter_id = auth.uid());

create policy "assistant_threads_select_own"
  on public.assistant_threads for select
  to authenticated
  using (user_id = auth.uid());

create policy "assistant_threads_insert_own"
  on public.assistant_threads for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "assistant_messages_select_own"
  on public.assistant_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.assistant_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

create policy "assistant_messages_insert_own"
  on public.assistant_messages for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.assistant_threads t
      where t.id = thread_id and t.user_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
