-- Marks whether a registration came in through the online form vs. in person,
-- tracked per registration (like payment_status/team) since it describes how
-- this particular sign-up happened, not an attribute of the person.
alter table event.registration add column is_online boolean not null default false;
