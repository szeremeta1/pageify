# Pageify

An Uptime Kuma pager exporter that receives webhook notifications and sends them to a pager service at secure.usamobility.net.

## Features

- 📥 Receives webhook notifications from Uptime Kuma
- 🧹 Cleans up emojis and reformats messages for pager delivery
- 🤖 Automatically navigates to secure.usamobility.net
- 📤 Sends formatted messages to the specified pager number

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/szeremeta1/pageify.git
cd pageify
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

4. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

5. Configure your settings in `.env`:
```env
PORT=3000
PAGER_PHONE_NUMBER=7322063021
PAGER_URL=https://secure.usamobility.net
HEADLESS=false
```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on the configured port (default: 3000).

### Configuring Uptime Kuma

1. Open your Uptime Kuma dashboard
2. Go to Settings → Notifications
3. Add a new notification with type "Webhook"
4. Set the webhook URL to: `http://your-server:3000/webhook`
5. Set the method to POST
6. Save the notification
7. Attach the notification to your monitors

### Webhook Endpoint

The server exposes the following endpoints:

- `POST /webhook` - Receives Uptime Kuma webhooks
- `GET /health` - Health check endpoint
- `GET /` - Service information

### Example Uptime Kuma Payload

```json
{
  "monitor": {
    "name": "My Server"
  },
  "heartbeat": {
    "status": 0
  },
  "msg": "Server is down! ⚠️"
}
```

### Message Cleaning

The application automatically:
- Removes all emoji characters
- Formats the message with monitor name, status, and timestamp
- Cleans up excessive whitespace

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `PAGER_PHONE_NUMBER` - Phone number for the pager (default: 7322063021)
- `PAGER_URL` - Pager service URL (default: https://secure.usamobility.net)
- `HEADLESS` - Run browser in headless mode (default: false, set to true for production)

## Development

The project structure:

```
pageify/
├── src/
│   ├── index.js         # Main server application
│   ├── messageClean.js  # Message cleaning utilities
│   └── pagerSender.js   # Browser automation for pager
├── .env.example         # Example environment configuration
├── .gitignore
├── package.json
└── README.md
```

## How It Works

1. **Webhook Reception**: Express server receives POST requests from Uptime Kuma
2. **Message Cleaning**: Emojis are stripped and the message is reformatted
3. **Browser Automation**: Playwright launches a browser and navigates to the pager website
4. **Form Filling**: The phone number and message are automatically entered
5. **Submission**: The message is sent to the pager

## Troubleshooting

### Playwright Installation Issues

If you encounter issues with Playwright:
```bash
npx playwright install-deps
npx playwright install chromium
```

### Port Already in Use

If port 3000 is already in use, change the `PORT` in your `.env` file.

### Browser Not Found

Make sure Playwright browsers are installed:
```bash
npx playwright install
```

## License

MIT
