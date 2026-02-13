# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Service Desk Notifications is a Next.js 15 dashboard that monitors Linear comments for service desk hashtags (like `#sd`) and sends real-time Slack notifications via webhooks. Built with React 19, TypeScript, and Tailwind CSS, deployed as serverless functions to Netlify or Vercel.

## Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server on port 3000

# Build and deployment
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint

# Testing webhooks locally (requires ngrok)
ngrok http 3000     # Expose local server for Linear webhook testing
```

## Architecture

### Core Flow

```
Linear Comment (#sd) → Webhook → Validation → Tag Filtering → Fetch Issue → Format → Slack
```

### Key Components

**Webhook Handler** (`app/api/webhooks/linear/route.ts`):
- Validates Linear webhook signatures using HMAC-SHA256
- Validates timestamps to prevent replay attacks
- Filters for Comment events with create/update actions
- Extracts and matches hashtags against monitored patterns
- Fetches full issue context and sends Slack notifications
- Returns structured responses with matched tags and issue identifiers

**Linear Client** (`lib/linear/client.ts`):
- Singleton Linear SDK client instance
- `fetchIssueById()`: Fetches single issue with full details
- `fetchRecentComments()`: Fetches comments from last 7 days containing monitored tags
- **Rate Limiting**: Limited to 160 comments per fetch (320 API calls) to avoid rate limits with multiple users
- Supports team-specific filtering via `LINEAR_TEAM_ID` environment variable

**Tag Filtering** (`lib/linear/filters.ts`):
- Loads tag patterns from `config/monitored-tags.json` or `MONITORED_TAGS` env var
- Extracts hashtags using regex: `/#[\w-]+/g` (matches #tag, #tag-name, #tag_name)
- Case-insensitive matching by default
- Falls back to default patterns if config unavailable

**Dashboard API** (`app/api/tickets/route.ts`):
- Server-side API route that fetches recent tagged comments
- No caching (`force-dynamic`, `revalidate: 0`)
- Serializes Linear SDK objects for client consumption
- Returns tickets with fetch timestamp

**Dashboard UI** (`app/dashboard/page.tsx`):
- Client component with manual refresh (auto-refresh disabled to prevent rate limiting)
- Prevents hydration mismatches with mounted state
- Loading states with skeleton placeholders
- Error handling with retry functionality

### Type System

All types defined in `types/index.ts`:
- `LinearWebhookPayload`: Webhook event structure from Linear
- `LinearComment`, `LinearIssue`, `LinearState`, `LinearUser`: Linear entities
- `SlackMessage`, `SlackBlock`: Slack Block Kit message structure
- `TagConfig`: Tag pattern configuration

### Slack Integration

**Formatter** (`lib/slack/formatter.ts`):
- Uses Slack Block Kit for rich formatting
- Includes issue header, status/priority/assignee fields, comment preview (max 300 chars)
- Highlights matched tags with markdown bold
- Priority labels: 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low
- Formats timestamps using Slack's date formatting

**Client** (`lib/slack/client.ts`):
- Sends notifications via Slack incoming webhook
- Returns success/error status

## Configuration Files

**Environment Variables** (`.env.local`):
```env
LINEAR_API_KEY=lin_api_xxx           # Required: Linear API key
LINEAR_WEBHOOK_SECRET=xxx            # Required: For signature validation
SLACK_WEBHOOK_URL=https://hooks...   # Required: Slack incoming webhook
LINEAR_TEAM_ID=xxx                   # Optional: Filter by specific team
MONITORED_TAGS=#sd,#support          # Optional: Comma-separated tags (overrides config file)
```

**Tag Configuration** (`config/monitored-tags.json`):
```json
{
  "patterns": ["#sd", "#service-desk", "#servicedesk"],
  "caseSensitive": false
}
```

**Deployment** (`netlify.toml`):
- Build command: `npm run build`
- Publishes `.next` directory
- Uses `@netlify/plugin-nextjs` for serverless functions
- CORS headers for `/api/*` endpoints

**Next.js Config** (`next.config.ts`):
- Allows images from `avatars.linear.app`

## Important Patterns

### Webhook Security
- All webhooks MUST validate the `linear-signature` header using HMAC-SHA256
- Timestamps are validated to prevent replay attacks (see `webhook-validator.ts`)
- Return 401 for invalid signatures, 400 for invalid/old timestamps

### Tag Matching
- Tags are extracted using regex before matching
- Matching is case-insensitive by default (configurable)
- Multiple tags can match a single comment
- Tags are highlighted in Slack notifications

### Rate Limiting Considerations
- Linear API has rate limits, so dashboard auto-refresh is disabled
- Comment fetching limited to 160 comments (= 320 API calls per fetch)
- Each comment requires 2 API calls: one for comment, one for issue
- Manual refresh recommended over automatic polling

### Serverless Deployment
- API routes configured with `export const dynamic = "force-dynamic"`
- No server-side caching to ensure fresh webhook processing
- Tag config can be loaded from env vars when filesystem unavailable

## Spanish UI Text
The dashboard UI is in Spanish:
- "Service Desk Dashboard"
- "Monitoreando comentarios en Linear con menciones al Service Desk"
- "Cargando Dashboard..."
- Error messages and buttons in Spanish

When modifying UI text, maintain Spanish language consistently.

## Troubleshooting

**Webhooks not working**:
- Verify `LINEAR_WEBHOOK_SECRET` matches Linear settings
- Check webhook signature validation in Netlify/Vercel logs
- Ensure webhook URL points to `/api/webhooks/linear`

**Dashboard not loading**:
- Verify `LINEAR_API_KEY` has read permissions
- Check rate limiting (reduce fetch timeframe if needed)
- Review browser console and server logs

**Slack notifications not sending**:
- Test `SLACK_WEBHOOK_URL` with curl
- Verify webhook is enabled in Slack app settings
- Check formatting of SlackMessage structure
