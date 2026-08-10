-- Multi-day events: an event can now span several consecutive days, and
-- attendance is tracked separately per day instead of once per registration.
--
-- event.event_day: one row per day of an event (day 1, day 2, day 3...).
-- event.attendance: presence table. A row's existence means "attended that
-- day" for that registration; marking = insert, undoing = delete. This
-- replaces the single `attended` / `attended_date` pair that used to live on
-- event.registration.

create table event.event_day (
  id bigint generated always as identity primary key,
  event_id bigint not null references event.event (id) on delete cascade,
  day_number smallint not null,
  event_date timestamptz not null,
  created_at timestamptz not null default now(),
  unique (event_id, day_number)
);

create index event_event_day_event_id_idx on event.event_day (event_id);

create table event.attendance (
  id bigint generated always as identity primary key,
  registration_id bigint not null references event.registration (id) on delete cascade,
  event_day_id bigint not null references event.event_day (id) on delete cascade,
  attended_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (registration_id, event_day_id)
);

create index event_attendance_registration_id_idx on event.attendance (registration_id);
create index event_attendance_event_day_id_idx on event.attendance (event_day_id);

-- Backfill: every existing event becomes a 1-day event using its current
-- event_date, and every existing "attended" registration gets its day-1
-- attendance row using its old attended_date.
insert into event.event_day (event_id, day_number, event_date)
select id, 1, event_date from event.event;

insert into event.attendance (registration_id, event_day_id, attended_at)
select r.id, d.id, r.attended_date
from event.registration r
join event.event_day d on d.event_id = r.event_id and d.day_number = 1
where r.attended = true;

alter table event.registration drop column attended;
alter table event.registration drop column attended_date;

grant select, insert, update, delete on event.event_day to authenticated;
grant select, insert, update, delete on event.attendance to authenticated;

alter table event.event_day enable row level security;
alter table event.attendance enable row level security;

create policy "Staff can manage event days" on event.event_day
  for all to authenticated using (true) with check (true);

create policy "Staff can manage attendance" on event.attendance
  for all to authenticated using (true) with check (true);
