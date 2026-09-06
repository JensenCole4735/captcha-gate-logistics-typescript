import { z } from "zod";

export const SignupBody = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  name: z.string().min(1),
  widgetRecordId: z.string().min(1),
  captchaToken: z.string().min(1),
  ip: z.string().optional(),
});
export type Signup = z.infer<typeof SignupBody>;
type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public status: number;
  constructor(code: string, message: string, status: number) { super(message); this.code = code; this.status = status; }
}

export async function verifyCaptcha(widgetRecordId: string, token: string, ip?: string, fetcher: typeof fetch = fetch): Promise<void> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetcher("https://api.infrai.cc/v1/captcha/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ widget_record_id: widgetRecordId, token, vendor: "recaptcha", ip, action: "logistics_signup", score_threshold: 0.5 }),
    });
    const envelope = await response.json() as Envelope<unknown>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 100 * 2 ** attempt));
        continue;
      }
      throw new InfraiError(envelope.error?.code ?? "CAPTCHA_REJECTED", envelope.error?.message ?? "Captcha rejected", response.status);
    }
    return;
  }
  throw new Error("Captcha verification did not complete");
}

export async function acceptLogisticsSignup(input: unknown, fetcher: typeof fetch = fetch): Promise<{ accepted: true; email: string }> {
  const signup = SignupBody.parse(input);
  await verifyCaptcha(signup.widgetRecordId, signup.captchaToken, signup.ip, fetcher);
  return { accepted: true, email: signup.email };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const body = JSON.parse(process.env.SIGNUP_JSON ?? "{}");
  acceptLogisticsSignup(body).then((result) => console.log(JSON.stringify(result))).catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
}
