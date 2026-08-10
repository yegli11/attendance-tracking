-- event.attendance.event_day_id is renamed to day_id, matching the day_id name
-- already used elsewhere now that the table it references is event.day.
--
-- Guarded with a check instead of a plain ALTER: on this project the column was
-- already renamed by hand, so this must be a no-op here while still renaming it
-- on any environment where it's applied from scratch (column still named
-- event_day_id).

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'event' and table_name = 'attendance' and column_name = 'event_day_id'
  ) then
    alter table event.attendance rename column event_day_id to day_id;
  end if;
end $$;
