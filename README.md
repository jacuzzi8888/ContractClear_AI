# ContractClear AI

AI-powered contract risk analysis with strict evidence grounding. Upload any legal PDF and get instant risk assessments with exact quotes and page references.

## Features

- **Evidence-First Extraction** - Every risk is backed by a verbatim quote and page number. Issues without evidence are automatically dropped.
- **Streaming Risk Dashboard** - Watch risks appear in real-time as the AI analyzes your contract.
- **Severity Classification** - Issues are ranked by severity: critical, high, medium, low, and info.
- **Negotiation Email Generation** - Draft emails addressing identified risks, grouped by severity.
- **Export Reports** - Download full risk reports as formatted documents.
- **Analysis History** - Review past analyses, search by filename, filter by status or risk level.
- **Bulk Data Management** - Select and delete individual or all extractions from Data and Privacy settings.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database and Auth | Supabase (PostgreSQL + RLS) |
| AI | Gemini 3 Flash |
| Background Jobs | Inngest |
| Icons | Lucide React |
| Notifications | Sonner |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (https://supabase.com)
- A Gemini API key (https://aistudio.google.com/apikey)
- An Inngest account (https://www.inngest.com) for background jobs

### Installation

Clone the repo and install dependencies:

    git clone https://github.com/jacuzzi8888/ContractClear_AI.git
    cd ContractClear_AI/app
    npm install

### Environment Variables

Create app/.env.local with:

    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    GEMINI_API_KEY=your-gemini-api-key

See .env.example for the full list.

### Run Locally

    npm run dev

Open http://localhost:3000

### Build for Production

    npm run build
    npm start

## How It Works

1. **Upload** - Drag and drop a legal PDF (up to 50 MB).
2. **Analyze** - Gemini reads the full document, identifies risks, and extracts verbatim quotes with page references.
3. **Review** - Get a severity-ranked risk report with actionable recommendations and draft negotiation emails.

## Project Structure

    app/
      src/
        app/
          api/              # API routes (jobs, uploads, emails)
          auth/             # Auth callback and error pages
          dashboard/        # Main dashboard, history, settings, reports
          login/            # Login page
          signup/           # Signup page
          forgot-password/  # Password reset request
          reset-password/   # Password reset form
        components/
          dashboard/        # File upload, findings viewer, stats, navbar
        hooks/              # Real-time analysis subscription
        lib/
          supabase/         # Supabase client, server, middleware, admin
          inngest/          # Background job client and functions
          constants.ts      # App constants and risk level config
          gemini.ts         # Gemini AI integration
          grounding.ts      # Evidence validation
        types/              # TypeScript type definitions

## Database Schema

- **documents** - Uploaded contract metadata (owner, filename, status)
- **jobs** - Analysis job tracking (linked to documents)
- **issues** - Extracted risk issues with evidence quotes and severity

Row Level Security (RLS) ensures users can only access their own data.

## License

This project is for informational purposes only and is not a substitute for legal counsel.
