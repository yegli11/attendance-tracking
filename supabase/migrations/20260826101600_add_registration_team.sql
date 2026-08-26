-- Team assignment (Naranja/Rojo/Verde/Azul) for the "Niños" category, tracked
-- per registration (like payment_status) since it's specific to this event's
-- sign-up, not a permanent attribute of the person.
alter table event.registration add column team text
  check (team in ('naranja', 'rojo', 'verde', 'azul'));
