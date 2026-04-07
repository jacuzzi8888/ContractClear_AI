export async function getGoogleTokenFromAuth0Vault(subjectToken: string) {
  try {
    const domain = process.env.AUTH0_DOMAIN || process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_M2M_CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

    if (!domain || !clientId || !clientSecret) {
      console.error("[Token Vault] Missing Auth0 credentials in environment variables");
      return null;
    }

    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        subject_token: subjectToken,
        grant_type: "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
        subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
        requested_token_type: "http://auth0.com/oauth/token-type/federated-connection-access-token",
        connection: "google-oauth2"
      })
    });
    
    if (!response.ok) {
      console.error("[Token Vault] Failed token exchange:", await response.text());
      return null;
    }
    
    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error("[Token Vault] Error during token exchange:", error);
    return null;
  }
}
