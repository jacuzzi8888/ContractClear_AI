import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGoogleTokenFromAuth0Vault } from '../auth0-vault';

describe('getGoogleTokenFromAuth0Vault', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      AUTH0_DOMAIN: 'test.auth0.com',
      AUTH0_M2M_CLIENT_ID: 'test_client_id',
      AUTH0_M2M_CLIENT_SECRET: 'test_client_secret'
    };
    global.fetch = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should return null if environment variables are missing', async () => {
    delete process.env.AUTH0_DOMAIN;
    delete process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const token = await getGoogleTokenFromAuth0Vault('subject_token', false);
    expect(token).toBeNull();
  });

  it('should successfully exchange a token using Token Vault', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'google_token_456' })
    });

    const token = await getGoogleTokenFromAuth0Vault('auth0_subject_token_123', true);
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(token).toBe('google_token_456');

    // Verify the correct Token Vault Token Exchange payload
    const callArgs = (global.fetch as any).mock.calls[0][1];
    const bodyObj = JSON.parse(callArgs.body);
    expect(bodyObj.grant_type).toBe("urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token");
    expect(bodyObj.subject_token).toBe("auth0_subject_token_123");
    expect(bodyObj.subject_token_type).toBe("urn:ietf:params:oauth:token-type:refresh_token");
    expect(bodyObj.requested_token_type).toBe("http://auth0.com/oauth/token-type/federated-connection-access-token");
  });

  it('should return null if token exchange request fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Unauthorized'
    });

    const token = await getGoogleTokenFromAuth0Vault('bad_token', false);
    expect(token).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});