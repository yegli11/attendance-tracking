-- Only signed-in staff (Supabase Auth `authenticated` role) may read or write
-- person/event data; there is no public or anonymous access path. Accounts are
-- created manually (dashboard invite), so any authenticated user is staff.

grant usage on schema person to authenticated;
grant usage on schema event to authenticated;

grant select, insert, update, delete on all tables in schema person to authenticated;
grant select, insert, update, delete on all tables in schema event to authenticated;

alter table event.category enable row level security;
alter table event.event enable row level security;
alter table event.registration enable row level security;
alter table person.gender enable row level security;
alter table person.person enable row level security;
alter table person.contact enable row level security;
alter table person.authorized_representative enable row level security;

create policy "Staff can manage genders" on person.gender
  for all to authenticated using (true) with check (true);

create policy "Staff can manage categories" on event.category
  for all to authenticated using (true) with check (true);

create policy "Staff can manage events" on event.event
  for all to authenticated using (true) with check (true);

create policy "Staff can manage registrations" on event.registration
  for all to authenticated using (true) with check (true);

create policy "Staff can manage people" on person.person
  for all to authenticated using (true) with check (true);

create policy "Staff can manage contacts" on person.contact
  for all to authenticated using (true) with check (true);

create policy "Staff can manage authorized representatives" on person.authorized_representative
  for all to authenticated using (true) with check (true);
