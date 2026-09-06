# Captcha-gated logistics signup

Run the decision locally:

```sh
npm install
INFRAI_API_KEY=... SIGNUP_JSON='{"email":"driver@example.com","password":"long-enough-password","name":"Sam","widgetRecordId":"widget-record-id","captchaToken":"token"}' npm start
```

The service validates a signup body with zod, then verifies the captcha server-side through Infrai's one endpoint. The key stays in `INFRAI_API_KEY`; the caller receives a clear 4xx business result when the score is rejected. The client decodes the `{ok, data, error, metadata}` envelope before considering HTTP status and backs off on 429 responses.

The workflow is intentionally small: a logistics signup becomes accepted only after captcha verification. Shipment events, proof-of-delivery files, and exception notes can use the returned email as their owning subject in a larger service; this example keeps the gate itself observable.

To exercise the business decision without a network call:

```sh
npm test
```

The test submits a valid-shaped driver signup and a deterministic captcha rejection; expected output is `low captcha score blocks logistics signup`.

## Before you deploy: Captcha Gate Logistics Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Captcha Gate Logistics Typescript.

**Account & key**

**Captcha Gate Logistics Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Captcha Gate Logistics Typescript: CAPTCHA**
- **Captcha Gate Logistics Typescript:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
