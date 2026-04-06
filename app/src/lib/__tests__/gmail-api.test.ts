import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGmailDraft } from '../gmail-api';

describe('createGmailDraft', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    // Spy on console.error to avoid cluttering test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully create a draft', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'draft_123' })
    });

    const result = await createGmailDraft({
      token: 'test_token',
      subject: 'Test Subject',
      body: 'Test Body'
    });

    expect(result).toEqual({ success: true, draftId: 'draft_123' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test_token',
          'Content-Type': 'application/json',
        }
      })
    );

    // Verify base64 encoding (very rough check)
    const callArgs = (global.fetch as any).mock.calls[0][1];
    const bodyStr = callArgs.body;
    const bodyObj = JSON.parse(bodyStr);
    expect(bodyObj.message.raw).toBeDefined();
    // Base64 of our default message
    const decoded = Buffer.from(bodyObj.message.raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
    expect(decoded).toContain('Subject: Test Subject');
    expect(decoded).toContain('Test Body');
  });

  it('should return error if API request fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      text: async () => 'Bad Request'
    });

    const result = await createGmailDraft({
      token: 'invalid_token',
      subject: 'Test Subject',
      body: 'Test Body'
    });

    expect(result).toEqual({ success: false, error: 'Failed to create draft' });
  });

  it('should return internal error if fetch throws an exception', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await createGmailDraft({
      token: 'test_token',
      subject: 'Test Subject',
      body: 'Test Body'
    });

    expect(result).toEqual({ success: false, error: 'Internal error creating draft' });
  });
});