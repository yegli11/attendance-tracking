-- "Equipo de trabajo": general event staff, distinct from event.team_leader
-- (which is always tied to a color). Same per-event, day-by-day attendance
-- shape as team_leader/team_leader_attendance, just without a team column.

create table event.staff_member (
  id bigint generated always as identity primary key,
  event_id bigint not null references event.event (id) on delete cascade,
  full_name varchar(100) not null,
  created_at timestamptz not null default now()
);

create index event_staff_member_event_id_idx on event.staff_member (event_id);

create table event.staff_member_attendance (
  id bigint generated always as identity primary key,
  staff_member_id bigint not null references event.staff_member (id) on delete cascade,
  day_id bigint not null references event.day (id) on delete cascade,
  attended_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (staff_member_id, day_id)
);

create index event_staff_member_attendance_staff_member_id_idx
  on event.staff_member_attendance (staff_member_id);
create index event_staff_member_attendance_day_id_idx
  on event.staff_member_attendance (day_id);

grant select, insert, update, delete on event.staff_member to authenticated;
grant select, insert, update, delete on event.staff_member_attendance to authenticated;

alter table event.staff_member enable row level security;
alter table event.staff_member_attendance enable row level security;

create policy "Staff can manage staff members" on event.staff_member
  for all to authenticated using (true) with check (true);

create policy "Staff can manage staff member attendance" on event.staff_member_attendance
  for all to authenticated using (true) with check (true);
