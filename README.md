# ContractClear AI - Auth0 Hackathon Submission

**An AI agent that analyzes predatory contracts and securely acts on your behalf to negotiate better terms.**

Built for the **"Authorized to Act: Auth0 for AI Agents"** hackathon on Devpost.

---

## Auth0 Token Vault Integration

The defining feature of this project is giving our AI Agent the secure authorization to act on the user's behalf — creating negotiation emails in their personal Gmail account — **without our application managing complex OAuth refresh token rotation.**

### How It Works

```
User Login → Auth0 captures Google Refresh Token → Token Vault stores securely
                                                                    ↓
User clicks "Create Gmail Draft" → Backend requests token exchange
                                                                    ↓
Auth0 Token Vault → Returns fresh Google Access Token → Gmail API creates draft
```

1. User logs in via Auth0 and grants the `https://www.googleapis.com/auth/gmail.compose` scope
2. Auth0 captures the Google Refresh Token and stores it securely in **Token Vault**
3. When the user requests a negotiation draft, our Next.js backend uses an Auth0 M2M client to request a token exchange
4. **Auth0 Token Vault** validates the request and returns a fresh, short-lived Google Access Token
5. The backend uses this token to create a draft directly in the user's Gmail via the Gmail API

**Our database never manages the Google refresh token lifecycle. Auth0 handles all the security.**

---

## Who It Helps

| User | Problem | How We Help |
|------|---------|-------------|
| **Consumers** | Signing terms without understanding | Identify hidden fees, auto-renewals, liability waivers |
| **Tenants** | Leases with unfair clauses | Spot illegal terms, hidden costs, one-sided rules |
| **Freelancers** | Client contracts with traps | Find scope creep, IP grabs, non-compete clauses |
| **Small Businesses** | Vendor agreements they can't negotiate | Get leverage with clear risk analysis |

---

## Features

- **Evidence-First Extraction** - Every risk is backed by a verbatim quote and page number. Issues without evidence are automatically dropped.
- **Streaming Risk Dashboard** - Watch risks appear in real-time as the AI analyzes your contract.
- **Severity Classification** - Issues are ranked by severity: critical, high, medium, low, and info.
- **Gmail Draft Integration** - AI agent creates negotiation emails directly in your Gmail drafts folder via Auth0 Token Vault.
- **Analysis History** - Review past analyses, search by filename, filter by status or risk level.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Auth & Authorization** | Auth0 SDK, Auth0 Token Vault, Google OAuth |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL + RLS) |
| **AI Model** | Google Gemini 3 Flash |
| **Background Jobs** | Inngest |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Auth0 account with Token Vault enabled
- Google Cloud project with Gmail API enabled
- Supabase project (https://supabase.com)
- Gemini API key (https://aistudio.google.com/apikey)

### Installation

```bash
git clone https://github.com/jacuzzi8888/ContractClear_AI.git
cd ContractClear_AI/app
npm install
```

### Environment Variables

Create `app/.env.local` with:

```env
# Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=32-byte-hex-secret
AUTH0_M2M_CLIENT_ID=your-m2m-client-id
AUTH0_M2M_CLIENT_SECRET=your-m2m-client-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# App
APP_BASE_URL=https://your-app.vercel.app
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## How It Works

1. **Upload** - Drag and drop a legal PDF (up to 50 MB)
2. **Analyze** - Gemini reads the full document, identifies risks, and extracts verbatim quotes with page references
3. **Review** - Get a severity-ranked risk report with actionable recommendations
4. **Act** - Click "Create Gmail Draft" to have the AI agent draft a negotiation email in your Gmail

---

## Project Structure

```
app/
  src/
    app/
      api/
        gmail-draft/     # Gmail draft creation via Token Vault
        auth/            # Auth routes
        jobs/            # Analysis job endpoints
      dashboard/         # Main dashboard, history, settings
    lib/
      auth0.ts           # Auth0 client with Token Vault hooks
      auth0-vault.ts     # Token exchange helper
      gmail-api.ts       # Gmail API integration
      supabase/          # Database clients
      inngest/           # Background jobs
```

---

## Auth0 Setup for Token Vault

1. **Enable Token Vault** on your Google social connection:
   - Go to Authentication > Social Connections > google-oauth2
   - Toggle ON "Connected Accounts for Token Vault"
   - Add `offline_access` and `https://www.googleapis.com/auth/gmail.compose` to scopes

2. **Create an M2M Application**:
   - Applications > Create Application > Machine to Machine
   - Authorize for the Auth0 Management API

3. **Configure your main Application**:
   - Add `https://www.googleapis.com/auth/gmail.compose` to allowed scopes
   - Set callback and logout URLs

---

## Live Demo

- **App:** https://contract-clear-ai.vercel.app/
- **GitHub:** https://github.com/jacuzzi8888/ContractClear_AI

---

## License

This project is for informational purposes only and is not a substitute for legal counsel.
