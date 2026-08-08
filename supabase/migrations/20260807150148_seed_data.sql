-- Static lookup values. `on conflict do nothing` keeps this migration safe to
-- re-run (both tables have a unique constraint on `name`).

insert into person.gender (name) values
  ('Femenino'),
  ('Masculino')
on conflict (name) do nothing;

insert into event.category (name) values
  ('Todas las edades'),
  ('Adultos'),
  ('Niños')
on conflict (name) do nothing;
