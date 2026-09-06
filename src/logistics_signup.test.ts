import assert from "node:assert/strict";
import { acceptLogisticsSignup, InfraiError } from "./logistics_signup.js";

const rejectedFetch: typeof fetch = async (_input, init) => {
  const requestBody = JSON.parse(String(init?.body));
  assert.equal(requestBody.widget_record_id, "widget-record-id");
  return new Response(JSON.stringify({ ok: false, error: { code: "CAPTCHA_SCORE_TOO_LOW", message: "score below threshold" } }), { status: 422, headers: { "content-type": "application/json" } });
};
try {
  await assert.rejects(() => acceptLogisticsSignup({ email: "driver@example.com", password: "long-enough-password", name: "Sam", widgetRecordId: "widget-record-id", captchaToken: "token" }, rejectedFetch), (error: unknown) => error instanceof InfraiError && error.status === 422 && error.code === "CAPTCHA_SCORE_TOO_LOW");
  console.log("low captcha score blocks logistics signup");
} catch (error) { console.error(error); process.exitCode = 1; }
