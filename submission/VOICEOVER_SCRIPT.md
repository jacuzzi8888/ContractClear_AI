# AI Voiceover Script
## For ContractClear AI Demo Video (3 Minutes)

---

## Voiceover Script (Copy into ElevenLabs or Murf.ai)

**Voice Style:** Professional, warm, slightly conversational
**Duration:** ~2 minutes, 45 seconds (~400 words)

---

**[Scene: Screen showing a person looking confused at a dense 20-page legal PDF contract]**

Every day, millions of people sign contracts they don't fully understand. Rental agreements. Employment contracts. Freelance agreements. 

They click "I agree" without reading the fine print—and hidden clauses can cost them thousands. Auto-renewal traps. One-sided liability waivers. Insane late fee escalators.

These aren't rare. They're everywhere. And legal help? That's five hundred dollars an hour. Most people simply can't afford it.

**[Scene: Transition to the ContractClear AI homepage]**

That's why we built ContractClear AI. 

ContractClear is an AI agent that analyzes any contract in seconds, finds the predatory clauses, and then acts on your behalf to negotiate better terms.

**[Scene: Screen recording clicking the "Login" button, showing the Auth0 Universal Login screen]**

Because our AI acts on behalf of our users, security is our top priority. We integrated Auth0 Token Vault to handle external authorization securely.

Watch as I log in. We are using Auth0's step-up authorization to specifically request the "Gmail Compose" scope. 

**[Scene: Showing the Google OAuth consent screen asking for Gmail draft permissions]**

Auth0 Token Vault securely stores this external access token. Our frontend never sees it, and we don't have to build complex refresh-token rotation logic in our database.

**[Scene: User is logged into the dashboard. They drag and drop a PDF contract to upload]**

Now, I'll upload a standard freelance consulting agreement. 

Our application uses Next.js, Supabase, and Google's Gemini Flash model to analyze the document. 

**[Scene: The dashboard updates, showing the analysis results with a "Critical" risk highlighted]**

In seconds, Gemini extracts the risks. Look here—it found a critical issue on Page 3: a hidden "Non-Compete" clause that would prevent me from working with any other clients for two years. 

It provides the exact quote, the page number, and a recommended action. No hallucinations. Just the facts from the document.

**[Scene: Transitioning the screen to the Inngest background job dashboard or terminal logs (optional, but good for tech judges)]**

But ContractClear isn't just an analyzer; it's an Agent. 

When the analysis finished, our asynchronous background worker, powered by Inngest, woke up. It securely exchanged an M2M token with the Auth0 Management API to retrieve my active Google Access Token from the Token Vault.

**[Scene: Switching to the user's actual Gmail inbox, opening the "Drafts" folder]**

Let's check my Gmail. 

Without me doing a thing, the ContractClear Agent has already connected to the Gmail API and drafted a professional negotiation email. 

**[Scene: Opening the drafted email, showing the AI-generated text referencing the specific non-compete clause]**

It references the specific Non-Compete clause, quotes the exact text, and asks for it to be removed before signing. 

All I have to do is click send. 

**[Scene: Final splash screen with the ContractClear AI logo and a URL]**

ContractClear AI, powered by Auth0 Token Vault. 

Giving AI the authorization to act safely, and leveling the playing field, one contract at a time. 

---

**End of Script**

---

## Word Count: ~320 words
## Duration: 2 minutes at normal conversational pace

---

## Quick Voiceover Tools

| Tool | Free Tier | Quality | Link |
|------|-----------|---------|------|
| **ElevenLabs** | Yes (10k chars/month) | Excellent | elevenlabs.io |
| **Murf.ai** | Yes (10 min) | Very Good | murf.ai |
| **Play.ht** | Yes (limited) | Good | play.ht |
| **TTS Maker** | Yes | Decent | ttsmaker.com |

---

## ElevenLabs Quick Steps

1. Go to elevenlabs.io and sign up (free)
2. Click "Text to Speech"
3. Choose a voice (recommend: Rachel, Adam, or Antoni for professional tone)
4. Paste the script above
5. Click "Generate"
6. Download the MP3
7. Use in your video editor

---

## Video Editor Quick Steps (CapCut)

1. Import your screen recording
2. Import your AI voiceover MP3
3. Drag voiceover to audio track
4. Trim video to match voiceover length
5. Add simple transitions (fade in/out)
6. Export as MP4 (1080p)
7. Upload to YouTube as unlisted

---

## Matching Video to Voiceover

| Voiceover Section | Video Action |
|-------------------|--------------|
| "Welcome to ContractClear AI..." | Show landing page |
| "Every day, millions..." | Stay on landing, scroll if needed |
| "Legal help? That's five hundred..." | Optional: text overlay "$500/hr" |
| "ContractClear AI changes that..." | Transition to dashboard |
| "Upload any contract PDF..." | Show upload action |
| "Each risk is identified..." | Show completed analysis findings |
| "Risks are ranked by severity..." | Scroll through risk cards |
| "Need to negotiate?" | Show email draft modal |
| "All your analyses are saved..." | Show history page |
| "Built for consumers..." | Optional: icons/text |
| "ContractClear AI. Leveling..." | Show logo and URL |
