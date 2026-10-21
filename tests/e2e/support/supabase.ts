/** Helpers that talk to local Supabase and Mailpit. They refuse to run against anything else. */

function local(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set; is local Supabase running (pnpm db:start)?`);
  const host = new URL(value).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(`${name} must point at local Supabase, got ${host}`);
  }
  return value;
}

/** Creates a confirmed user if it doesn't exist yet. */
export async function ensureUser(email: string): Promise<void> {
  const apiUrl = local("E2E_SUPABASE_URL");
  const secretKey = process.env.E2E_SUPABASE_SECRET_KEY!;
  const response = await fetch(`${apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, email_confirm: true }),
  });
  if (response.ok) return;
  const body = (await response.json()) as { error_code?: string };
  if (body.error_code !== "email_exists") {
    throw new Error(`Could not create ${email}: ${response.status} ${body.error_code}`);
  }
}

type MailpitMessage = { ID: string; To: { Address: string }[] };

async function messagesTo(email: string): Promise<MailpitMessage[]> {
  const mailpit = local("E2E_MAILPIT_URL");
  const response = await fetch(`${mailpit}/api/v1/messages?limit=100`);
  const { messages } = (await response.json()) as { messages: MailpitMessage[] };
  return messages.filter((message) => message.To.some((to) => to.Address === email));
}

/** IDs of every email already delivered to `email`; pass to the functions below. */
export async function snapshotInbox(email: string): Promise<Set<string>> {
  return new Set((await messagesTo(email)).map((message) => message.ID));
}

async function newMessagesTo(email: string, seen: Set<string>): Promise<MailpitMessage[]> {
  return (await messagesTo(email)).filter((message) => !seen.has(message.ID));
}

/** Waits for a sign-in email that wasn't in the snapshot and returns its 6-digit code. */
export async function waitForSignInCode(email: string, seen: Set<string>): Promise<string> {
  const mailpit = local("E2E_MAILPIT_URL");
  for (let attempt = 0; attempt < 40; attempt++) {
    const [latest] = await newMessagesTo(email, seen);
    if (latest) {
      const message = (await (await fetch(`${mailpit}/api/v1/message/${latest.ID}`)).json()) as {
        Text: string;
      };
      const code = message.Text.match(/\b\d{6}\b/)?.[0];
      if (code) return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No sign-in code for ${email}`);
}

export async function countNewEmailsTo(email: string, seen: Set<string>): Promise<number> {
  return (await newMessagesTo(email, seen)).length;
}
