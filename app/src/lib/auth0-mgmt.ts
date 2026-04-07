// ============================================================
// ContractClear AI — Auth0 Management API Client
// ============================================================
// Fetches the user's downstream Google access token from Auth0's
// identity provider storage via the Management API.
// This works when Token Vault is NOT enabled — it reads the
// IdP access token stored during the user's last authentication.
// ============================================================

interface ManagementTokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: ManagementTokenCache | null = null;

/**
 * Gets a Management API access token using M2M client credentials.
 */
async function getManagementToken(): Promise<string> {
  // Check cache
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    const missing = [];
    if (!domain) missing.push("AUTH0_DOMAIN");
    if (!clientId) missing.push("AUTH0_M2M_CLIENT_ID");
    if (!clientSecret) missing.push("AUTH0_M2M_CLIENT_SECRET");
    throw new Error(`Missing env vars for Management API: ${missing.join(", ")}`);
  }

  const cleanDomain = domain.replace(/[\r\n\s]/g, "").trim();
  const cleanClientId = clientId.replace(/[\r\n\s]/g, "").trim();
  const cleanClientSecret = clientSecret.replace(/[\r\n\s]/g, "").trim();

  console.log("[auth0-mgmt] Token request:", {
    domain: cleanDomain,
    clientId: cleanClientId,
    clientIdLength: cleanClientId.length,
    secretLength: cleanClientSecret.length,
    audience: `https://${cleanDomain}/api/v2/`,
  });

  const response = await fetch(`https://${cleanDomain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: cleanClientId,
      client_secret: cleanClientSecret,
      audience: `https://${cleanDomain}/api/v2/`,
      grant_type: "client_credentials",
      scope: "read:users read:user_idp_tokens",
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to get Management API token (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const token = data.access_token;
  const expiresIn = data.expires_in || 86400;

  // Cache with 5-minute buffer
  cachedToken = {
    token,
    expiresAt: Date.now() + (expiresIn - 300) * 1000,
  };

  return token;
}

/**
 * Fetches the Google OAuth access token for a user from Auth0's
 * Management API by reading the user's identity provider data.
 * 
 * Requires the M2M app to have the `read:user_idp_tokens` scope
 * authorized on the Auth0 Management API.
 */
export async function getGoogleTokenFromManagementAPI(
  auth0Id: string
): Promise<{ token: string | null; error: string | null }> {
  try {
    const mgmtToken = await getManagementToken();
    const domain = (process.env.AUTH0_DOMAIN || "").replace(/[\r\n]/g, "").trim();

    const response = await fetch(
      `https://${domain}/api/v2/users/${encodeURIComponent(auth0Id)}?fields=identities&include_fields=true`,
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return {
        token: null,
        error: `Management API error (${response.status}): ${errText}`,
      };
    }

    const userData = await response.json();
    const identities: Array<{
      connection: string;
      provider: string;
      access_token?: string;
      refresh_token?: string;
    }> = userData.identities || [];

    const googleIdentity = identities.find(
      (id) => id.connection === "google-oauth2" || id.provider === "google-oauth2"
    );

    if (!googleIdentity) {
      return {
        token: null,
        error: "No Google identity found for this user. User may not have signed in with Google.",
      };
    }

    if (!googleIdentity.access_token) {
      return {
        token: null,
        error: "Google identity found but no access_token stored. Enable 'Store Identity Provider Tokens' in Auth0 Google connection settings.",
      };
    }

    console.log("[auth0-mgmt] Successfully retrieved Google access token from Management API");
    return { token: googleIdentity.access_token, error: null };
  } catch (err: any) {
    return {
      token: null,
      error: `Management API exception: ${err.message}`,
    };
  }
}
