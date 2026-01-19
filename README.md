# Uptime Kuma Pager

An Uptime Kuma webhook receiver that cleans messages and submits them to the Spok/USA Mobility web form via direct HTTP POST (no browser).

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
│   └── pagerApi.js      # Direct HTTP POST sender
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ recommended
- Node.js dependencies

Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` alongside `package.json`:

```env
PORT=3000                 # optional
PAGER_PHONE_NUMBER=7322063021
PAGER_URL=https://secure.spokwireless.net  # optional override
```

Notes:
- Messages are truncated to 240 chars (service limit).

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
3) `pagerApi` sends a server-side HTTP POST directly to Spok.

## Troubleshooting

- Port in use: change `PORT` in `.env`.

- Retry sending: restart the server after changing `.env`.

## License

MIT
