import { readFileSync } from 'fs';

async function main() {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    console.error("Missing required environment variables. Please set AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, and AUTH0_M2M_CLIENT_SECRET.");
    process.exit(1);
  }

  console.log(`Getting Management API token for ${domain}...`);

  // 1. Get Management API Token
  const m2mResponse = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials'
    })
  });

  if (!m2mResponse.ok) {
    console.error("Failed to get M2M token:", await m2mResponse.text());
    process.exit(1);
  }

  const { access_token: mgmtToken } = await m2mResponse.json();

  console.log("Successfully got Management API token. Updating client grant types...");

  // 2. Update the M2M client to enable the Token Vault grant type
  const updateResponse = await fetch(`https://${domain}/api/v2/clients/${clientId}`, {
    method: 'PATCH',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mgmtToken}`
    },
    body: JSON.stringify({
      grant_types: [
        "client_credentials",
        "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token"
      ]
    })
  });

  if (!updateResponse.ok) {
    console.error("Failed to update client grant types:", await updateResponse.text());
    process.exit(1);
  }

  console.log("✅ Successfully enabled Token Vault Token Exchange for your M2M application!");
}

main().catch(console.error);
