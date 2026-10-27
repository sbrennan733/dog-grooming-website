// Sends mail through the Microsoft Graph API on behalf of a personal
// Outlook.com account. Outlook.com no longer accepts password logins over
// SMTP, so we use OAuth: a long-lived refresh token (obtained once with
// scripts/get-microsoft-refresh-token.mjs) is exchanged for a short-lived
// access token whenever we need to send.

export interface GraphConfig {
  clientId: string;
  refreshToken: string;
  // Overridable so the flow can be tested against a local mock server.
  tokenUrl?: string;
  graphUrl?: string;
}

export interface GraphMessage {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    contentType: string;
    content: Uint8Array;
  }[];
}

const DEFAULT_TOKEN_URL =
  "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const DEFAULT_GRAPH_URL = "https://graph.microsoft.com/v1.0";
const SCOPE = "https://graph.microsoft.com/Mail.Send offline_access";

// Refresh a little early so a token never expires mid-request.
const EXPIRY_MARGIN_MS = 60 * 1000;

interface TokenCache {
  clientId: string;
  accessToken: string;
  expiresAt: number;
  // Microsoft may hand back a newer refresh token; prefer it while this
  // process is running.
  refreshToken: string;
}

let cache: TokenCache | undefined;

async function describeFailure(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: string | { code?: string; message?: string };
      error_description?: string;
    };
    if (typeof body.error === "string") {
      return `${body.error}: ${body.error_description?.split("\r\n")[0] ?? ""}`;
    }
    return `${body.error?.code ?? "unknown"}: ${body.error?.message ?? ""}`;
  } catch {
    return "no error details";
  }
}

async function getAccessToken(config: GraphConfig): Promise<string> {
  if (
    cache &&
    cache.clientId === config.clientId &&
    cache.expiresAt - EXPIRY_MARGIN_MS > Date.now()
  ) {
    return cache.accessToken;
  }

  const refreshToken =
    cache && cache.clientId === config.clientId
      ? cache.refreshToken
      : config.refreshToken;

  const response = await fetch(config.tokenUrl ?? DEFAULT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: SCOPE,
    }),
  });

  if (!response.ok) {
    cache = undefined;
    throw new Error(
      `Microsoft token request failed (${response.status}) ${await describeFailure(response)}. If the refresh token has expired or been revoked, run scripts/get-microsoft-refresh-token.mjs again.`
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  cache = {
    clientId: config.clientId,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    refreshToken: data.refresh_token ?? refreshToken,
  };

  return cache.accessToken;
}

export async function sendViaGraph(
  config: GraphConfig,
  message: GraphMessage
): Promise<void> {
  const accessToken = await getAccessToken(config);

  const response = await fetch(
    `${config.graphUrl ?? DEFAULT_GRAPH_URL}/me/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: message.subject,
          body: { contentType: "HTML", content: message.html },
          toRecipients: [{ emailAddress: { address: message.to } }],
          ...(message.replyTo && {
            replyTo: [{ emailAddress: { address: message.replyTo } }],
          }),
          ...(message.attachments?.length && {
            attachments: message.attachments.map((attachment) => ({
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: attachment.filename,
              contentType: attachment.contentType,
              contentBytes: Buffer.from(attachment.content).toString("base64"),
            })),
          }),
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!response.ok) {
    // An access token rejected despite not having expired: drop it so the
    // next attempt gets a fresh one.
    if (response.status === 401) {
      cache = undefined;
    }
    throw new Error(
      `Microsoft Graph sendMail failed (${response.status}) ${await describeFailure(response)}`
    );
  }
}
