-- Deleting a registration (removing someone from an event's roster) is
-- restricted to a single staff account. Every other action on registrations
-- (view, register, edit) stays open to any authenticated staff, matching the
-- rest of the app's access model.
drop policy "Staff can manage registrations" on event.registration;

create policy "Staff can view registrations" on event.registration
  for select to authenticated using (true);

create policy "Staff can create registrations" on event.registration
  for insert to authenticated with check (true);

create policy "Staff can update registrations" on event.registration
  for update to authenticated using (true) with check (true);

create policy "Only authorized staff can delete registrations" on event.registration
  for delete to authenticated using (auth.email() = 'montanezyeglimar4@gmail.com');
