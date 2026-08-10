-- event.event_day is renamed to event.day for a shorter, clearer name now that
-- it's clear from the schema (event.*) which entity a "day" belongs to.
-- Foreign keys (event.attendance.event_day_id) keep working automatically;
-- Postgres does not require them to be recreated on a table rename.
--
-- IF EXISTS: on this project the table was already renamed by hand before this
-- migration was written, so it must be a no-op here while still renaming it on
-- any environment where it's applied from scratch (table still named event_day).

alter table if exists event.event_day rename to day;
