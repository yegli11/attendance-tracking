-- Schema based on the ER diagram in dev/attachment/modelo-bbdd.jpg.
-- Deviations from the diagram, kept intentionally:
--   * person.contact.phone_number is text, not int (a phone number is not an
--     arithmetic value: it can have a leading zero, a "+" country code, or exceed
--     int32 range).
--   * "GENRE" in the diagram is a translation slip for gender; person.person
--     references a person.gender lookup table (not in the diagram) instead of a
--     free-text column, so the value set is closed and consistent across rows.
--   * event_date / attended_date use timestamptz instead of a bare date/datetime,
--     so a single point in time is stored unambiguously across time zones.
--   * every table gets a `created_at` audit column (not in the diagram).
-- Static values for person.gender and event.category are seeded in the
-- seed_data migration.

create schema if not exists person;
create schema if not exists event;

-- ── person.gender ────────────────────────────────────────────────────────────
create table person.gender (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique,
  created_at timestamptz not null default now()
);

-- ── event.category ──────────────────────────────────────────────────────────
create table event.category (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique,
  created_at timestamptz not null default now()
);

-- ── event.event ──────────────────────────────────────────────────────────────
create table event.event (
  id bigint generated always as identity primary key,
  name varchar(50) not null,
  event_date timestamptz not null,
  category_id bigint not null references event.category (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index event_event_category_id_idx on event.event (category_id);

-- ── person.person ────────────────────────────────────────────────────────────
create table person.person (
  id bigint generated always as identity primary key,
  name varchar(50) not null,
  last_name varchar(50) not null,
  gender_id bigint not null references person.gender (id) on delete restrict,
  birthdate date not null,
  created_at timestamptz not null default now()
);

create index person_person_gender_id_idx on person.person (gender_id);

-- ── person.contact ───────────────────────────────────────────────────────────
create table person.contact (
  id bigint generated always as identity primary key,
  person_id bigint not null references person.person (id) on delete cascade,
  phone_number text not null,
  created_at timestamptz not null default now()
);

create index person_contact_person_id_idx on person.contact (person_id);

-- ── event.registration ───────────────────────────────────────────────────────
-- A person's ticket for one event: attendance code, check-in state.
create table event.registration (
  id bigint generated always as identity primary key,
  person_id bigint not null references person.person (id) on delete cascade,
  event_id bigint not null references event.event (id) on delete cascade,
  attended boolean not null default false,
  attended_date timestamptz,
  code varchar(50) not null,
  created_at timestamptz not null default now(),
  unique (event_id, code)
);

create index event_registration_person_id_idx on event.registration (person_id);
create index event_registration_event_id_idx on event.registration (event_id);

-- ── person.authorized_representative ─────────────────────────────────────────
-- People (parent/guardian) allowed to drop off / pick up for a given registration.
create table person.authorized_representative (
  id bigint generated always as identity primary key,
  full_name varchar(100) not null,
  registration_id bigint not null references event.registration (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index person_authorized_representative_registration_id_idx
  on person.authorized_representative (registration_id);
