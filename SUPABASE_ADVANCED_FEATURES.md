# 🚀 Supabase Advanced Features Setup Guide

This guide explains how to enable the advanced features (Industry Templates, Timeline, Reports, Checklists) in your Supabase project.

## 1. Run Migration Script

Navigate to the `supabase/` directory in your project. You will find a file named `advanced-features-migration.sql`.

1. Open your **Supabase Dashboard**.
2. Go to the **SQL Editor** tab.
3. Click "New Query".
4. Copy the entire content of `supabase/advanced-features-migration.sql`.
5. Paste it into the SQL Editor.
6. Click **Run**.

**What this does:**
- Creates `industry_templates` table and seeds it with 5 templates (SaaS, E-commerce, Consulting, Marketplace, Mobile App).
- Creates `model_events` table for the Timeline feature.
- Creates `monthly_reports` table for the Growth Reports feature.
- Creates `monthly_checklists` table for the Engagement feature.
- Sets up Row Level Security (RLS) policies for all new tables.
- Adds necessary indexes for performance.

## 2. Verify Data

After running the script, you can verify that the templates are loaded:

1. Go to the **Table Editor**.
2. Select the `industry_templates` table.
3. You should see 5 rows (SaaS, E-commerce, etc.).

## 3. Environment Variables

Ensure your `.env.local` file has the standard Supabase keys:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Features Enabled

Once the migration is run, the following features will be active in the application:

### 🏭 Industry Templates (Step 1)
- Users can select a pre-defined business model in the first step of the wizard.
- This auto-populates optimal revenue and cost structures.

### 📅 Timeline Events (Dashboard)
- Users can add "Events" like hiring, salary changes, or product launches.
- These events are saved to the database and serve as a record of changes.
  *(Note: Calculation logic to apply these events to financial projections requires further integration with the calculation engine)*.

### ✅ Monthly Checklists (Dashboard)
- A monthly task list is generated for each model to encourage user engagement.
- Users can check off tasks, and progress is saved.

### 📈 Growth Reports (Dashboard)
- Users can generate monthly reports.
- Reports are saved to the database and can be retrieved later.

## Troubleshooting

- **Error: relation "financial_models" does not exist**: Ensure you have run the initial schema migration before running this one.
- **RLS Policy Error**: Make sure you are logged in when testing these features, as RLS policies restrict access to authenticated users only.
