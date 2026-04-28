-- Notatnik: jeden rekord na użytkownika.
create table if not exists public.notepad_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

-- Dla istniejących instalacji, gdzie user_id nie jest PK/UNIQUE.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notepad_state_user_id_key'
      and conrelid = 'public.notepad_state'::regclass
  ) then
    alter table public.notepad_state
      add constraint notepad_state_user_id_key unique (user_id);
  end if;
end $$;
