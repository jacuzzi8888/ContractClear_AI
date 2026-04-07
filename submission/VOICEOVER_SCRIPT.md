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

Watch as I log in. We are using Auth0 to specifically request the "Gmail Compose" scope. 

**[Scene: Showing the Google OAuth consent screen asking for Gmail draft permissions]**

Auth0 Token Vault securely stores this authorization. Our frontend never sees the refresh token, and we don't have to build complex token rotation logic in our database.

**[Scene: User is logged into the dashboard. They drag and drop a PDF contract to upload]**

Now, I'll upload a standard freelance consulting agreement. 

Our application uses Next.js, Supabase, and Google's Gemini Flash model to analyze the document. 

**[Scene: The dashboard updates, showing the analysis results with a "Critical" risk highlighted]**

In seconds, Gemini extracts the risks. Look here—it found a critical issue on Page 3: a hidden "Non-Compete" clause that would prevent me from working with any other clients for two years. 

It provides the exact quote, the page number, and a recommended action. No hallucinations. Just the facts from the document.

**[Scene: User clicks the "Draft Summary Email" button, then the "Create Gmail Draft" button]**

Now here's where it gets powerful. When I find a clause I want to push back on, I just click "Create Gmail Draft".

Our backend securely uses Auth0 Token Vault to exchange an M2M token for a fresh Google Access Token—all without exposing sensitive credentials to our frontend.

**[Scene: Switching to the user's actual Gmail inbox, opening the "Drafts" folder]**

Let's check my Gmail. 

**[Scene: Opening the drafted email, showing the AI-generated text referencing the specific non-compete clause]**

The ContractClear Agent has created a professional negotiation email directly in my drafts folder. It references the specific Non-Compete clause, quotes the exact text, and asks for it to be removed before signing. 

All I have to do is click send. 

**[Scene: Final splash screen with the ContractClear AI logo and a URL]**

ContractClear AI, powered by Auth0 Token Vault. 

Securely authorizing AI agents to act on your behalf, and leveling the playing field—one contract at a time. 

---

**End of Script**

---

## Word Count: ~380 words
## Duration: ~2 minutes 45 seconds at normal conversational pace

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
| "Every day, millions..." | Show confused person with PDF |
| "That's why we built ContractClear AI..." | Transition to landing page |
| "Watch as I log in..." | Show Auth0 login screen |
| "Auth0 Token Vault securely stores..." | Show Google OAuth consent screen |
| "Now, I'll upload..." | Show drag-and-drop upload |
| "In seconds, Gemini extracts..." | Show completed analysis findings |
| "Now here's where it gets powerful..." | Show clicking "Create Gmail Draft" button |
| "Let's check my Gmail..." | Switch to Gmail drafts folder |
| "The ContractClear Agent has created..." | Show opened draft email |
| "ContractClear AI, powered by Auth0..." | Show logo and URL |
