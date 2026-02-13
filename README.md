# Service Desk Notifications

A Next.js dashboard that monitors Linear comments for service desk hashtags (like `#sd`) and sends real-time Slack notifications.

## Features

- 🔔 **Real-time notifications** - Instant Slack alerts when service desk is mentioned in Linear comments
- 📊 **Dashboard** - View all tagged tickets in one place with filtering and search
- 🏷️ **Configurable tags** - Add new monitoring tags without code changes
- 🚀 **Serverless** - Deploy to Netlify or Vercel with zero infrastructure management
- 🎨 **Modern UI** - Clean, responsive dashboard built with React and Tailwind CSS

## Architecture

```
Linear Comment with #sd
    ↓
Webhook → Netlify Function
    ↓
Filter by tags → Fetch issue details
    ↓
Send Slack notification
```

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Linear workspace with API access
- A Slack workspace with incoming webhook configured

### 2. Clone and Install

```bash
git clone https://github.com/prubiera85/sd-notifications.git
cd sd-notifications
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
# Linear Configuration
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxx
LINEAR_WEBHOOK_SECRET=your_webhook_secret_here

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx/xxxxx/xxxxx

# Optional: Filter by specific team
LINEAR_TEAM_ID=your_team_id
```

#### Getting Linear API Key

1. Go to Linear Settings → API
2. Create a new Personal API key
3. Copy the key to `LINEAR_API_KEY`

#### Getting Slack Webhook URL

1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Enable "Incoming Webhooks"
4. Create a new webhook for your channel
5. Copy the webhook URL to `SLACK_WEBHOOK_URL`

### 4. Configure Monitored Tags

Edit `config/monitored-tags.json`:

```json
{
  "patterns": [
    "#sd",
    "#service-desk",
    "#support"
  ],
  "caseSensitive": false
}
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Setting Up Linear Webhooks

### Local Testing (with ngrok)

1. Start ngrok:
```bash
ngrok http 3000
```

2. In Linear Settings → API → Webhooks:
   - URL: `https://your-ngrok-url.ngrok.io/api/webhooks/linear`
   - Resource types: Select "Comment"
   - Events: Create, Update
   - Copy the webhook secret to your `.env.local`

### Production Setup

1. Deploy to Netlify (see below)
2. In Linear Settings → API → Webhooks:
   - URL: `https://your-app.netlify.app/api/webhooks/linear`
   - Resource types: Select "Comment"
   - Events: Create, Update
   - Copy the webhook secret to Netlify environment variables

## Deployment

### Deploy to Netlify

1. Push your code to GitHub

2. Connect to Netlify:
   - Go to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`

3. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add: `LINEAR_API_KEY`, `LINEAR_WEBHOOK_SECRET`, `SLACK_WEBHOOK_URL`

4. Deploy!

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts and add environment variables when requested.

## Project Structure

```
sd-notifications/
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── linear/
│   │           └── route.ts          # Webhook handler
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── dashboard/
│       ├── TicketList.tsx
│       ├── TicketCard.tsx
│       └── FilterBar.tsx
├── lib/
│   ├── linear/
│   │   ├── client.ts                 # Linear API client
│   │   └── filters.ts                # Tag filtering logic
│   ├── slack/
│   │   ├── client.ts                 # Slack webhook client
│   │   └── formatter.ts              # Message formatting
│   └── utils/
│       └── webhook-validator.ts      # Signature validation
├── types/
│   └── index.ts                      # TypeScript types
├── config/
│   └── monitored-tags.json          # Tag configuration
└── netlify.toml                      # Netlify config
```

## Usage

### Dashboard

Access the dashboard at `/dashboard` to see:
- All Linear issues with tagged comments from the last 7 days
- Filter by tag, date range, or search
- Click through to Linear for full issue details

### Adding New Tags

1. Edit `config/monitored-tags.json`
2. Add new patterns to the array
3. Commit and redeploy
4. New tags are monitored immediately

### Testing

Create a test comment in Linear:

```
This is a test comment #sd

Please review this issue.
```

You should receive a Slack notification within seconds!

## API Endpoints

### POST /api/webhooks/linear

Receives Linear webhook events and processes service desk mentions.

**Headers:**
- `linear-signature`: HMAC signature for validation

**Response:**
```json
{
  "ok": true,
  "notified": true,
  "issueIdentifier": "SD-123",
  "matchedTags": ["#sd"]
}
```

## Configuration

### Tag Patterns

Tags are case-insensitive by default. Supports:
- Simple hashtags: `#sd`, `#support`
- Hyphenated: `#service-desk`
- Underscored: `#service_desk`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LINEAR_API_KEY` | Yes | Linear API key for fetching issues |
| `LINEAR_WEBHOOK_SECRET` | Yes | Webhook secret for signature validation |
| `SLACK_WEBHOOK_URL` | Yes | Slack incoming webhook URL |
| `LINEAR_TEAM_ID` | No | Filter to specific Linear team |

## Troubleshooting

### Webhook not receiving events

1. Check Linear webhook is enabled
2. Verify webhook URL is correct
3. Check Netlify function logs
4. Ensure `LINEAR_WEBHOOK_SECRET` matches Linear settings

### Slack notifications not sending

1. Test webhook URL with curl:
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_SLACK_WEBHOOK_URL
```
2. Check `SLACK_WEBHOOK_URL` is correct
3. Verify webhook is enabled in Slack app settings

### Dashboard not loading

1. Verify `LINEAR_API_KEY` is valid
2. Check API key has read permissions
3. Check browser console for errors
4. Verify environment variables are set

## Security

- Webhook signatures are validated using HMAC-SHA256
- Timestamp validation prevents replay attacks
- Environment variables keep secrets secure
- No sensitive data stored in database

## Future Enhancements

- [ ] Multiple Slack channels for different tags
- [ ] Email notifications
- [ ] User authentication for dashboard
- [ ] Comment resolution tracking
- [ ] Analytics and reporting
- [ ] Custom notification rules
- [ ] Mobile app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues or questions:
- Open an issue on GitHub
- Check Linear and Slack documentation
- Review Netlify function logs
