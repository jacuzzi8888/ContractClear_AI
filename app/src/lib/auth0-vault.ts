export async function getGoogleTokenFromAuth0Vault(subjectToken: string, useRefreshToken: boolean = true): Promise<{ token: string | null; error: string | null }> {
  try {
    const domain = process.env.AUTH0_DOMAIN || process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    
    const clientId = useRefreshToken 
      ? process.env.AUTH0_CLIENT_ID 
      : process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = useRefreshToken 
      ? process.env.AUTH0_CLIENT_SECRET 
      : process.env.AUTH0_M2M_CLIENT_SECRET;

    console.log("[Token Vault] Starting exchange:", {
      domain: domain || "missing",
      clientId: clientId ? `${clientId.slice(0, 8)}...` : "missing",
      clientSecret: clientSecret ? "set" : "missing",
      useRefreshToken,
      subjectTokenLength: subjectToken?.length || 0
    });

    if (!domain || !clientId || !clientSecret) {
      const missing = [];
      if (!domain) missing.push("AUTH0_DOMAIN");
      if (!clientId) missing.push(useRefreshToken ? "AUTH0_CLIENT_ID" : "AUTH0_M2M_CLIENT_ID");
      if (!clientSecret) missing.push(useRefreshToken ? "AUTH0_CLIENT_SECRET" : "AUTH0_M2M_CLIENT_SECRET");
      return { token: null, error: `Missing env vars: ${missing.join(", ")}` };
    }

    const requestBody: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      subject_token: subjectToken,
      grant_type: "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
      requested_token_type: "http://auth0.com/oauth/token-type/federated-connection-access-token",
      connection: "google-oauth2"
    };

    if (useRefreshToken) {
      requestBody.subject_token_type = "urn:ietf:params:oauth:token-type:refresh_token";
    } else {
      requestBody.subject_token_type = "urn:ietf:params:oauth:token-type:access_token";
    }

    console.log("[Token Vault] Request body:", JSON.stringify({
      ...requestBody,
      client_secret: "[REDACTED]",
      subject_token: `[${subjectToken.length} chars]`
    }));

    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    const responseText = await response.text();
    console.log("[Token Vault] Response:", response.status, responseText);
    
    if (!response.ok) {
      return { token: null, error: `Auth0 error (${response.status}): ${responseText}` };
    }
    
    const data = JSON.parse(responseText);
    console.log("[Token Vault] Success! Got access token.");
    return { token: data.access_token || null, error: null };
  } catch (error: any) {
    console.error("[Token Vault] Exception:", error);
    return { token: null, error: `Exception: ${error.message}` };
  }
}
