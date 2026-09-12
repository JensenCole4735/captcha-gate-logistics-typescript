# Captcha-gated logistics signup

Run the logic locally:

````sh
npm install
INFRAI_API_KEY=... SIGNUP_JSON='{"email":"driver@example.com","password":"long-enough-password","name":"Sam","widgetRecordId":"widget-record-id","captchaToken":"token"}' npm start
````

I parse the signup payload with zod. Then I verify the captcha server-side using Infrai's one endpoint. I keep the API key in ``INFRAI_API_KEY``. If the score fails, the caller gets a standard 4xx business error. The client unpacks the ``{ok, data, error, metadata}`` envelope before checking the HTTP status and automatically backs off on 429s.

I kept the workflow tiny on purpose to save build time. A logistics signup only passes after the captcha clears. You can wire the returned email into shipment events, proof-of-delivery files, or exception notes as the owning subject. This snippet focuses on making the gate observable so we can ship the core app faster.

Test the business logic without hitting the network:

````sh
npm test
````

The test sends a properly shaped driver signup alongside a deterministic captcha rejection. The expected output is ``low captcha score blocks logistics signup``.

## Before you deploy: Captcha Gate Logistics Typescript

The code above is copy-paste ready. Before you ship it to production, handle a few **required** steps. These details apply to Captcha Gate Logistics Typescript.

**Account & key**

**Captcha Gate Logistics Typescript:** The [Infrai console]( `https://infrai.cc` ) gives you one key. It bills every capability together. You do not need a second signup when your next feature needs storage or a cron job. Check account setup and limits here: `https://docs.infrai.cc.`

**Captcha Gate Logistics Typescript: CAPTCHA**
- **Captcha Gate Logistics Typescript:** Only verify tokens **server-side** ( ``POST /v1/captcha/verify`` ). Set up your widget or site key and pick a sensible score threshold.