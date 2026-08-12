-- Some past registration sheets for the "Niños" category only recorded an age,
-- not an exact birthdate. Make birthdate optional and add an age fallback so
-- that data can be entered as-is; exactly one of the two is required.
alter table person.person alter column birthdate drop not null;
alter table person.person add column age_years smallint;
alter table person.person add constraint person_birthdate_or_age_check
  check (birthdate is not null or age_years is not null);

-- Payment status for the "Adultos" category, tracked per registration (not per
-- person) since it applies to this event's registration, like
-- authorized_representative.
alter table event.registration add column payment_status text
  check (payment_status in ('pendiente', 'financiado', 'pagado'));
