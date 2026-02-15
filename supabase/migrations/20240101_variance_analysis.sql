-- Create table for storing monthly actuals (realized data)
create table if not exists monthly_actuals (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references financial_models(id) on delete cascade not null,
  month integer not null, -- 1 to 36 corresponding to projection months
  revenue numeric default 0,
  cogs numeric default 0,
  gross_profit numeric default 0,
  marketing_spend numeric default 0,
  personnel_cost numeric default 0,
  other_expenses numeric default 0,
  net_income numeric default 0,
  cash_balance numeric default 0, -- Cash on hand at end of month
  customers integer default 0,
  marketing_visits integer default 0,
  marketing_leads integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Unique constraint to prevent duplicate entries for same month/model
create unique index if not exists idx_monthly_actuals_model_month on monthly_actuals(model_id, month);

-- RLS Policies
alter table monthly_actuals enable row level security;

create policy "Users can view their own actuals"
  on monthly_actuals for select
  using ( auth.uid() in ( select user_id from financial_models where id = monthly_actuals.model_id ) );

create policy "Users can insert their own actuals"
  on monthly_actuals for insert
  with check ( auth.uid() in ( select user_id from financial_models where id = monthly_actuals.model_id ) );

create policy "Users can update their own actuals"
  on monthly_actuals for update
  using ( auth.uid() in ( select user_id from financial_models where id = monthly_actuals.model_id ) );

create policy "Users can delete their own actuals"
  on monthly_actuals for delete
  using ( auth.uid() in ( select user_id from financial_models where id = monthly_actuals.model_id ) );
