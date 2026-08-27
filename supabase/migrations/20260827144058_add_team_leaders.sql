-- Team leaders (adult volunteers), one row per leader per team per event —
-- mirrors event.registration.team: fixed to a single color, specific to this
-- event, not a permanent attribute of the person. Leaders have no code, but
-- get day-by-day attendance the same way children do (event.attendance),
-- just keyed by team_leader_id instead of registration_id.

create table event.team_leader (
  id bigint generated always as identity primary key,
  event_id bigint not null references event.event (id) on delete cascade,
  team text not null check (team in ('naranja', 'rojo', 'verde', 'azul')),
  full_name varchar(100) not null,
  created_at timestamptz not null default now()
);

create index event_team_leader_event_id_idx on event.team_leader (event_id);

create table event.team_leader_attendance (
  id bigint generated always as identity primary key,
  team_leader_id bigint not null references event.team_leader (id) on delete cascade,
  day_id bigint not null references event.day (id) on delete cascade,
  attended_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (team_leader_id, day_id)
);

create index event_team_leader_attendance_team_leader_id_idx
  on event.team_leader_attendance (team_leader_id);
create index event_team_leader_attendance_day_id_idx
  on event.team_leader_attendance (day_id);

grant select, insert, update, delete on event.team_leader to authenticated;
grant select, insert, update, delete on event.team_leader_attendance to authenticated;

alter table event.team_leader enable row level security;
alter table event.team_leader_attendance enable row level security;

create policy "Staff can manage team leaders" on event.team_leader
  for all to authenticated using (true) with check (true);

create policy "Staff can manage team leader attendance" on event.team_leader_attendance
  for all to authenticated using (true) with check (true);
