-- Create table for model shares
create table if not exists model_shares (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references financial_models(id) on delete cascade not null,
  token text unique not null,
  password_hash text, -- Plain text for now as per frontend/api simplified logic, or hash if we update API
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- RLS for model_shares
alter table model_shares enable row level security;

-- Only owner can view/create shares
create policy "Users can view shares of own models"
  on model_shares for select
  using ( auth.uid() in ( select user_id from financial_models where id = model_shares.model_id ) );

create policy "Users can create shares for own models"
  on model_shares for insert
  with check ( auth.uid() in ( select user_id from financial_models where id = model_shares.model_id ) );

-- Function to get shared model securely (bypassing RLS for public access if token matches)
create or replace function get_shared_model(token_uuid text, password_input text default null)
returns table (
  id uuid,
  user_id uuid,
  name text,
  currency text, 
  inputs jsonb,
  business_name text,
  business_description text,
  sector text,
  created_at timestamptz,
  updated_at timestamptz
) 
security definer
as $$
declare
  share_record record;
  model_record record;
begin
  -- Find valid share
  select * into share_record 
  from model_shares 
  where token = token_uuid
  and (expires_at is null or expires_at > now());

  if not found then
    return; -- Return empty
  end if;

  -- Verify password if set
  if share_record.password_hash is not null and share_record.password_hash <> '' then
     if password_input is null or password_input <> share_record.password_hash then
        -- We can't easily throw specific error codes in setof return, but returning nothing implies failure/auth error
        -- Alternatively raise exception 'Invalid Password';
        return; 
     end if;
  end if;

  -- Return model
  return query 
  select m.id, m.user_id, m.name, m.currency, m.inputs, m.business_name, m.business_description, m.sector, m.created_at, m.updated_at
  from financial_models m
  where m.id = share_record.model_id;
end;
$$ language plpgsql;
