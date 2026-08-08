-- Optional "place" field for an event, shown on the event card/detail panel and
-- collected (optionally) on the create-event form.
alter table event.event add column location text;
