# AI Voiceover Script
## For ContractClear AI Demo Video (3+ Minutes)

---

## Voiceover Script (Copy into ElevenLabs or Murf.ai)

**Voice Style:** Professional, warm, slightly conversational
**Duration:** ~3 minutes, 30 seconds (~550 words)

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

Auth0 Token Vault securely stores this authorization. Our frontend never sees the refresh token, and we don't have to build complex token rotation logic in our database. This is zero-trust security by design.

**[Scene: User is logged into the dashboard. They drag and drop a PDF contract to upload]**

Now, I'll upload a standard freelance consulting agreement. 

Behind the scenes, our application uses Next.js on the frontend, Supabase for secure multi-tenant storage with row-level security, and Google's Gemini Flash model to analyze the document.

**[Scene: The upload completes, analysis starts. Show the streaming progress as findings appear one by one]**

The analysis is now running. Watch as risks appear in real-time using Supabase Realtime channels. The AI reads through the entire document, identifies potential issues, and cross-references each one against the actual contract text.

This evidence-grounding approach is critical. Every finding must have a verbatim quote and page number. If Gemini can't find the exact text in the document, the risk is automatically rejected. Zero hallucinations.

**[Scene: The dashboard shows completed analysis with several findings. Highlight a Critical risk]**

In just seconds, the analysis is complete. Look here—it found a critical issue on Page 3: a hidden "Non-Compete" clause that would prevent me from working with any other clients for two years. 

It provides the exact quote, the page number, a plain-language explanation of why this is risky, and a recommended action. 

Scrolling down, we also see a high-severity unlimited liability clause and a medium-severity automatic renewal trap. Each one is backed by evidence I can verify myself.

**[Scene: User clicks the "Draft Summary Email" button to preview the email, then clicks "Create Gmail Draft"]**

Now here's where ContractClear becomes a true AI agent—not just an analyzer, but an actor on your behalf.

When I find a clause I want to push back on, I can click "Draft Summary Email" to preview the negotiation message. Then I click "Create Gmail Draft" to have the agent create this directly in my Gmail account.

**[Scene: Show a brief loading indicator as the Gmail draft is being created]**

Behind the scenes, our backend is performing a secure token exchange. It uses an Auth0 Machine-to-Machine credential to request access from the Token Vault. Token Vault validates the request and returns a fresh, short-lived Google Access Token—without ever exposing the long-lived refresh token to our application.

**[Scene: Switching to the user's actual Gmail inbox, opening the "Drafts" folder]**

Let's check my Gmail. 

**[Scene: Opening the drafted email, showing the AI-generated text referencing the specific non-compete clause]**

The ContractClear Agent has created a professional negotiation email directly in my drafts folder. It references the specific Non-Compete clause, quotes the exact text, and politely asks for it to be removed before signing. 

All I have to do is review it and click send. 

**[Scene: Final splash screen with the ContractClear AI logo and a URL]**

This is the future of AI agents—securely authorized to act on your behalf.

ContractClear AI, powered by Auth0 Token Vault. 

Leveling the playing field, one contract at a time. 

---

**End of Script**

---

## Word Count: ~580 words
## Duration: ~3 minutes 30 seconds at normal conversational pace

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
| "Behind the scenes, our application..." | Show upload progress |
| "The analysis is now running..." | Show real-time findings appearing |
| "This evidence-grounding approach..." | Continue showing findings streaming in |
| "In just seconds, the analysis is complete..." | Show completed analysis |
| "Scrolling down..." | Scroll through risk cards |
| "Now here's where ContractClear becomes..." | Show "Draft Summary Email" button |
| "Behind the scenes, our backend..." | Show loading indicator during draft creation |
| "Let's check my Gmail..." | Switch to Gmail drafts folder |
| "The ContractClear Agent has created..." | Show opened draft email |
| "This is the future of AI agents..." | Show logo and URL |
