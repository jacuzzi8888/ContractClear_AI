export async function getGoogleTokenFromAuth0Vault(subjectToken: string, useRefreshToken: boolean = true) {
  try {
    const domain = process.env.AUTH0_DOMAIN || process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    
    // Use application credentials for refresh token exchange, M2M for access token exchange
    const clientId = useRefreshToken 
      ? process.env.AUTH0_CLIENT_ID 
      : process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = useRefreshToken 
      ? process.env.AUTH0_CLIENT_SECRET 
      : process.env.AUTH0_M2M_CLIENT_SECRET;

    if (!domain || !clientId || !clientSecret) {
      console.error("[Token Vault] Missing Auth0 credentials in environment variables");
      return null;
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

    console.log("[Token Vault] Attempting token exchange with", useRefreshToken ? "refresh token" : "access token");

    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Token Vault] Failed token exchange:", response.status, errorText);
      return null;
    }
    
    const data = await response.json();
    console.log("[Token Vault] Successfully retrieved Google access token");
    return data.access_token || null;
  } catch (error) {
    console.error("[Token Vault] Error during token exchange:", error);
    return null;
  }
}
