
# excel.al - Smart Financial Modeling Tool

This project is a Next.js-based web application that allows entrepreneurs to transform their business ideas into professional financial models and Excel files within 5-10 minutes.

## 🚀 Features

- **AI-Powered Analysis**: Describe your business idea, and OpenAI (GPT-4o) will estimate your sector, revenue model, and expenses for you.
- **Detailed Financial Engine**: Social Security (SGK), Tax, and VAT calculations in compliance with Turkish regulations (2025).
- **Dynamic Dashboard**: 12-month (or 36-month) P&L (Profit & Loss), Cash Flow, and Red Flag (Risk) analyses.
- **Excel & PDF Export**: Downloadable files ready for investor presentations.
- **Cloud Storage (Supabase)**: Safely store and re-edit your models.
- **Reverse Engineering**: Calculate required sales and marketing budget based on your target net profit.
- **Input Validation**: Smart form validation with sector-specific benchmarks.
- **Benchmark Hints**: Real-time suggestions based on industry standards.

## 🌐 Live Demo

**Netlify:** [https://excel-al.netlify.app](https://excel-al.netlify.app)

## 📦 Deployment

For Netlify deployment instructions, see [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

## 🛠️ Installation

### 1. Requirements
- Node.js 18+ or 20+
- npm or pnpm

### 2. Clone the Project and Install Dependencies
```bash
npm install
```

### 3. Environment Variables (.env.local)
Ensure the following keys are defined in your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://nytrkhlaywcgtjmqsdxv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
OPENAI_API_KEY="sk-proj-..."
RESEND_API_KEY="re_..."
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. Database Setup (Supabase)
Database tables must be created for the application to function.
1. Go to the Supabase Dashboard.
2. Open the **SQL Editor** from the left menu.
3. Copy and paste the content of the `supabase/schema.sql` file in the project directory.
4. Click the **RUN** button to create the tables.

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

## 📁 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: UI components (Accordion, Button, Card, etc.) and the Wizard steps.
- `lib/engine/`: Financial calculation motor (Tax, SGK, P&L logic).
- `lib/ai/`: OpenAI integration logic.
- `lib/excel-generator.ts`: Excel file generation service.
- `lib/db.ts`: Supabase database operations.

## 📝 License
MIT License
