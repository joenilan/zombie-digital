-- Create enum for user roles
create type user_level as enum ('owner', 'admin', 'moderator', 'user');

-- Add roles table
create table site_roles (
  id uuid primary key default uuid_generate_v4(),
  name user_level not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add role column to twitch_users
alter table twitch_users
add column site_role user_level default 'user'::user_level not null;

-- Create index on role column
create index twitch_users_site_role_idx on twitch_users(site_role);

-- Insert default roles
insert into site_roles (name, description) values
  ('owner', 'Full system access and control'),
  ('admin', 'Administrative access to manage users and content'),
  ('moderator', 'Moderation capabilities for content and users'),
  ('user', 'Standard user access');

-- Create function to set first user as owner
create or replace function set_first_user_as_owner()
returns trigger as $$
begin
  if not exists (select 1 from twitch_users where site_role = 'owner') then
    new.site_role := 'owner';
  end if;
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically set first user as owner
create trigger set_owner_role
  before insert on twitch_users
  for each row
  execute function set_first_user_as_owner(); 