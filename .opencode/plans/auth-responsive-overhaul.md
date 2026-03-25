# ContractClear AI — Auth Bugs + Responsive Overhaul Plan

## Context

The login flow is **broken** — entering correct credentials results in an infinite loading spinner with no redirect to the dashboard. Additionally, the app has responsive design issues across all screen sizes: missing viewport meta tag, touch targets below 44px minimum, excessive mobile padding, and overflow-prone layouts. This plan addresses all critical auth bugs and a full responsive overhaul.

---

## Part 1: Critical Auth Bugs (Fix Login Infinite Loading)

### Step 1: Fix `login/page.tsx` — Add try/catch + setLoading(false)

**File:** `app/src/app/login/page.tsx`

Wrap `signInWithPassword` in try/catch and add `setLoading(false)` in both branches:

```tsx
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      // setLoading intentionally omitted — page will unmount on redirect
    }
  } catch (err) {
    setError("An unexpected error occurred. Please try again.");
    setLoading(false);
  }
};
```

### Step 2: Fix `signup/page.tsx` — Add try/catch

**File:** `app/src/app/signup/page.tsx`

Same pattern — wrap `signUp` in try/catch:

```tsx
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  } catch (err) {
    setError("An unexpected error occurred. Please try again.");
    setLoading(false);
  }
};
```

### Step 3: Fix `forgot-password/page.tsx` — Add try/catch + fix redirect

**File:** `app/src/app/forgot-password/page.tsx`

- Add try/catch around `resetPasswordForEmail`
- Fix redirect URL from `/login` to `/reset-password`

```tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

### Step 4: Add null check for `createClient()` in login, signup, forgot-password

**Files:** `app/src/app/login/page.tsx`, `app/src/app/signup/page.tsx`, `app/src/app/forgot-password/page.tsx`

Add a guard before calling Supabase methods:

```tsx
if (!supabase) {
  setError("Configuration error. Please try again later.");
  setLoading(false);
  return;
}
```

### Step 5: Add `/forgot-password` and `/reset-password` to middleware allowlist

**File:** `app/src/lib/supabase/middleware.ts`

Add to the allowlist (line 40-44):
```tsx
!request.nextUrl.pathname.startsWith("/forgot-password") &&
!request.nextUrl.pathname.startsWith("/reset-password") &&
```

### Step 6: Create `/reset-password` page

**File:** `app/src/app/reset-password/page.tsx` (NEW)

A page where users land after clicking the password reset email link. Contains:
- New password input
- Confirm password input
- Calls `supabase.auth.updateUser({ password })`
- Redirects to `/login` on success
- Wrapped in try/catch
- Validates passwords match and are ≥ 8 characters

### Step 7: Redirect authenticated users away from `/login` and `/signup` in middleware

**File:** `app/src/lib/supabase/middleware.ts`

After the `getUser()` call, add a redirect for authenticated users on auth pages:

```tsx
if (
  user &&
  (request.nextUrl.pathname.startsWith("/login") ||
   request.nextUrl.pathname.startsWith("/signup") ||
   request.nextUrl.pathname.startsWith("/forgot-password") ||
   request.nextUrl.pathname.startsWith("/reset-password"))
) {
  const url = request.nextUrl.clone();
  url.pathname = "/dashboard";
  return NextResponse.redirect(url);
}
```

### Step 8: Add client-side password validation on signup

**File:** `app/src/app/signup/page.tsx`

Add validation before calling `signUp`:
```tsx
if (password.length < 8) {
  setError("Password must be at least 8 characters long.");
  setLoading(false);
  return;
}
```

---

## Part 2: Responsive Overhaul

### Step 9: Add viewport meta tag to root layout

**File:** `app/src/app/layout.tsx`

Add viewport export:
```tsx
export const viewport = {
  width: "device-width",
  initialScale: 1,
};
```

### Step 10: Fix global CSS — touch targets and responsive sizing

**File:** `app/src/app/globals.css`

| Class | Change |
|-------|--------|
| `.btn-primary`, `.btn-secondary` | Increase padding to `0.75rem 1.25rem` for ~44px touch height |
| `.stat-number` | Change to `font-size: clamp(1.5rem, 4vw, 2.5rem)` |
| `.stat-label` | Change to `font-size: 0.75rem` (12px) |
| `.deck-nav--prev`, `.deck-nav--next` | Change `left: -20px` / `right: -20px` to `left: -10px` / `right: -10px` with `@media (max-width: 640px)` setting to `left: 4px` / `right: 4px` |

### Step 11: Fix landing page (`page.tsx`) responsive issues

**File:** `app/src/app/page.tsx`

| Line | Change |
|------|--------|
| 47 | `px-6` → `px-4 sm:px-6` |
| 75 | `text-5xl` → `text-4xl sm:text-5xl lg:text-7xl` |
| 163 | `gap-8` → `gap-6 sm:gap-8` |
| 168, 181, 194 | `text-[10px]` → `text-xs` |
| 224 | `text-xs` → `text-sm` |
| 276-281 | Footer links: add `py-2` padding for touch targets |

### Step 12: Fix auth pages responsive issues

**Files:** `login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`, `auth/auth-code-error/page.tsx`

| Change | Applies To |
|--------|-----------|
| `p-8 md:p-10` → `p-6 sm:p-8 md:p-10` | All auth cards |
| `p-10` → `p-6 sm:p-10` | Success state cards (signup, forgot-password) |
| Eye toggle: add `p-2` for 44px touch target | login, signup |
| `text-[10px]` → `text-xs` | signup password hint |
| "Forgot password?" link: `text-xs` → `text-sm` | login |
| Auth code error button: `py-3` → `py-3.5` | auth-code-error |

### Step 13: Fix navbar responsive issues

**File:** `app/src/components/dashboard/navbar.tsx`

| Line | Change |
|------|--------|
| 50 | `px-6` → `px-4 sm:px-6` |
| 112 | Hamburger `p-2` → `p-3` (44px touch target) |
| 130 | Drawer `w-72` → `w-72 max-w-[85vw]` |
| 140 | Close button `p-1.5` → `p-2.5` |

### Step 14: Fix dashboard page responsive issues

**File:** `app/src/app/dashboard/page.tsx`

| Line | Change |
|------|--------|
| 123 | `text-3xl` → `text-2xl sm:text-3xl` |
| 125 | `ml-[52px]` → `ml-0 sm:ml-[52px]` |
| 128 | `gap-8` → `gap-6 lg:gap-8` |
| 190 | `p-12` → `p-6 sm:p-12` |
| 253 | `text-[9px]` → `text-[10px]` |
| 164 | "Recent Extractions" header: add `flex-wrap gap-2` |

### Step 15: Fix dashboard layout responsive padding

**File:** `app/src/app/dashboard/layout.tsx`

| Line | Change |
|------|--------|
| 65 | `px-6` → `px-4 sm:px-6` |

### Step 16: Fix history page responsive issues

**File:** `app/src/app/dashboard/history/page.tsx`

| Line | Change |
|------|--------|
| 131 | `text-4xl` → `text-2xl sm:text-3xl md:text-4xl` |
| 139-152 | Stats row: add `flex-wrap` |
| 141 | `text-[10px]` → `text-xs` |
| 297-303 | "View Report" link: `py-2.5` → `py-3` |
| 319 | Pagination: add `flex-col sm:flex-row gap-2` |
| 331-343 | Pagination buttons: `w-8 h-8` → `w-10 h-10` |
| 327, 347 | Prev/Next: `p-2` → `p-3` |

### Step 17: Fix settings page responsive issues

**File:** `app/src/app/dashboard/settings/page.tsx`

| Line | Change |
|------|--------|
| 162 | `text-4xl` → `text-2xl sm:text-3xl md:text-4xl` |
| 203 | Save button: `py-2.5` → `py-3` |
| 299 | Save Preferences: `py-2.5` → `py-3` |

### Step 18: Fix usage page responsive issues

**File:** `app/src/app/dashboard/usage/page.tsx`

| Line | Change |
|------|--------|
| 104 | `text-4xl` → `text-2xl sm:text-3xl md:text-4xl` |

### Step 19: Fix data settings page responsive issues

**File:** `app/src/app/dashboard/settings/data/page.tsx`

| Line | Change |
|------|--------|
| 115 | `text-4xl` → `text-2xl sm:text-3xl md:text-4xl` |
| 137 | `text-[10px]` → `text-xs` |
| 193 | Delete buttons: add `flex-col sm:flex-row gap-3` |
| 201-213 | "Permanently Delete": `py-2.5` → `py-3` |

### Step 20: Fix report page responsive issues

**File:** `app/src/app/dashboard/report/[id]/page.tsx`

| Line | Change |
|------|--------|
| 47 | `p-8 md:p-16` → `p-4 sm:p-8 md:p-16` |
| 55 | Header: `flex justify-between` → `flex flex-col sm:flex-row justify-between gap-4` |
| 75-83 | Stats: add `flex-wrap` |
| 110-119 | Issue header: add `flex-wrap gap-2` |

### Step 21: Fix findings viewer responsive issues

**File:** `app/src/components/dashboard/findings-viewer.tsx`

| Line | Change |
|------|--------|
| 96 | `p-8` → `p-5 sm:p-8` |
| 103 | Header: add `flex-wrap gap-2` |
| 125-133 | Meta info: add `flex-wrap` |
| 166 | Draft email button: `py-2.5` → `py-3` |
| 198 | Email body: add `overflow-x-auto break-words` |
| 282 | Status banner: add `flex-col sm:flex-row gap-2` |
| 295 | Export button: `py-2` → `py-2.5` |
| 322-362 | Section header: `flex-col sm:flex-row items-start sm:items-center gap-3` |
| 345, 356 | Action buttons: `py-2` → `py-2.5` |
| 426-436 | Pagination dots: `w-2.5 h-2.5` → `w-3.5 h-3.5` with `p-1` wrapper |
| 416-445 | Prev/Next text buttons: add `py-2 px-3` |

### Step 22: Fix file upload responsive issues

**File:** `app/src/components/dashboard/file-upload.tsx`

| Line | Change |
|------|--------|
| 117, 138, 165, 192 | `p-8 md:p-10` → `p-5 sm:p-8 md:p-10` |
| 165 | Close button: `p-2` → `p-2.5` |

### Step 23: Fix print button touch target

**File:** `app/src/components/dashboard/print-button.tsx`

| Line | Change |
|------|--------|
| 7 | `py-2` → `py-3` |

### Step 24: Fix help, privacy, terms page titles

**Files:** `app/src/app/help/page.tsx`, `app/src/app/privacy/page.tsx`, `app/src/app/terms/page.tsx`

| Change | Applies To |
|--------|-----------|
| `text-4xl` → `text-2xl sm:text-3xl md:text-4xl` | All three page titles |
| "Back to Home" link: add `py-2` padding | All three |

---

## Verification

After all changes:

1. **Auth flow test:**
   - Run `npm run dev`
   - Navigate to `/login` — enter correct credentials → should redirect to `/dashboard` within 2-3 seconds
   - Enter wrong credentials → should show error message, spinner stops
   - Navigate to `/signup` — create account → should show "Check your email" screen
   - Navigate to `/forgot-password` — enter email → should show success screen (middleware should not block this route)
   - While logged in, visit `/login` → should redirect to `/dashboard`
   - Click "Create one for free" on login page → should navigate to `/signup`

2. **Responsive test:**
   - Open Chrome DevTools → toggle device toolbar
   - Test at 320px, 375px, 640px, 768px, 1024px, 1280px
   - Verify no horizontal scrollbars
   - Verify all buttons are tappable (>=44px)
   - Verify no text overflow or truncation issues
   - Verify navbar hamburger menu opens/closes correctly on mobile
   - Verify dashboard grid collapses to single column on mobile

3. **Run lint/typecheck:**
   ```bash
   npm run lint
   npm run build
   ```
