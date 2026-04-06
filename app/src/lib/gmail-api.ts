export async function createGmailDraft({ token, subject, body }: { token: string, subject: string, body: string }) {
  try {
    // The Gmail API expects a raw RFC 2822 formatted message encoded in base64url
    const message = [
      'To: ', // Blank since it's a draft
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      body
    ].join('\n');

    // Convert to base64url format
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          raw: encodedMessage
        }
      })
    });

    if (!response.ok) {
      console.error("[Gmail API] Failed to create draft", await response.text());
      return { success: false, error: "Failed to create draft" };
    }

    const data = await response.json();
    return { success: true, draftId: data.id };
  } catch (error) {
    console.error("[Gmail API] Error:", error);
    return { success: false, error: "Internal error creating draft" };
  }
}
