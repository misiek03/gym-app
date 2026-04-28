-- Minimalny model domenowy dla śledzenia treningów.
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  location text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_name text not null,
  exercise_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  set_order integer not null default 0,
  reps integer not null default 0,
  weight_kg numeric(8,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);

create index if not exists session_exercises_session_idx
  on public.session_exercises (session_id, exercise_order);

create index if not exists exercise_sets_exercise_idx
  on public.exercise_sets (session_exercise_id, set_order);
