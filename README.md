# Pageify

An Uptime Kuma webhook receiver that cleans messages and submits them to the Spok/USA Mobility web form via Playwright.

## What it does

- Receives `POST /webhook` payloads from Uptime Kuma
- Cleans the message (removes emojis, formats status/timestamp)
- Automates the Spok “Send a Page” form: fills pager number, continues, fills message, sends

## Project layout

```
pageify/
├── src/
│   ├── index.js         # Express server + webhook handling
│   ├── messageClean.js  # Emoji removal + formatting
│   └── pagerSender.js   # Playwright automation of the pager form
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ recommended
- Playwright Chromium binaries and system deps

Install dependencies and Playwright runtime:

```bash
npm install
npx playwright install --with-deps chromium
```

## Configuration

Create a `.env` alongside `package.json`:

```env
PORT=3000                 # optional
PAGER_PHONE_NUMBER=7322063021
HEADLESS=true             # set false to watch the browser
```

Notes:
- `HEADLESS` defaults to false in code if unset.
- `PAGER_PHONE_NUMBER` is required for the automation.

## Run locally

```bash
npm start
```

Endpoints:
- `POST /webhook` – Uptime Kuma target
- `GET /health` – basic health check
- `GET /` – service info

Quick webhook test:

```bash
curl -X POST http://localhost:3000/webhook \
  -H 'Content-Type: application/json' \
  -d '{"msg":"Pageify Testing"}'
```

## Uptime Kuma setup

- Notification type: Webhook
- Post URL: `http://<your-host>:3000/webhook`
- Method: POST
- Content Type: application/json
- Body: keep default (standard Kuma payload)

## How it works

1) Express receives the webhook.
2) `cleanMessage` strips emojis and formats text with timestamp.
3) `pagerSender` launches Playwright Chromium, fills the pager number, continues, fills the message, and clicks send.

## Troubleshooting

- Playwright deps missing (errors like `libnspr4.so`):
  ```bash
  npx playwright install --with-deps chromium
  ```

- Watch the browser for debugging: set `HEADLESS=false` in `.env`.

- Port in use: change `PORT` in `.env`.

- Retry page automation: restart the server after changing `.env`.

## License

MIT
