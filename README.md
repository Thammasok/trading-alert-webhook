# Nutz Alert Bot

TradingView → Telegram Alert Bot - A webhook server that receives trading alerts from TradingView and forwards them to Telegram.

## Features

- **Webhook Server**: Express-based server to receive TradingView alerts
- **Telegram Integration**: Automatically sends formatted trading signals to Telegram
- **Authentication**: Secret-based webhook authentication
- **Risk-Reward Calculation**: Automatically calculates R:R ratio
- **Keep-alive**: Built-in keep-alive for Render deployment
- **Thai Language Support**: Messages formatted in Thai with Bangkok timezone

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=3000

# Keep-alive for Render (optional)
RENDER_URL=https://your-app.onrender.com

# Webhook secret for signature verification
WEBHOOK_SECRET=nutz-secret-change-me-2024

# Telegram bot configuration
TELEGRAM_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

### Getting Telegram Credentials

1. Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
2. Copy the bot token to `TELEGRAM_TOKEN`
3. Get your chat ID by messaging [@userinfobot](https://t.me/userinfobot) or using the API
4. Copy the chat ID to `TELEGRAM_CHAT_ID`

## Usage

### Development

```bash
pnpm dev
```

### Production

```bash
# Build
pnpm build

# Start
pnpm start
```

## API Endpoints

### GET `/`
Health check endpoint

### GET `/health`
Health check with timestamp

### POST `/webhook`
Receives TradingView webhook alerts

**Headers:**
- `x-webhook-secret`: Your webhook secret for authentication

**Body:**
```json
{
  "action": "BUY",
  "symbol": "BTCUSDT",
  "price": 77000,
  "stop": 74500,
  "tp1": 80000,
  "tp2": 82500,
  "timeframe": "4H",
  "signal": "BOS Bullish + Volume Spike"
}
```

**Fields:**
- `action` (required): "BUY", "SELL", or "INFO"
- `symbol` (required): Trading pair symbol
- `price` (required): Entry price
- `stop` (optional): Stop loss price
- `tp1` (optional): Take profit 1
- `tp2` (optional): Take profit 2
- `timeframe` (optional): Timeframe (default: "4H")
- `signal` (optional): Additional signal description

### POST `/test`
Sends a test alert to Telegram (no authentication required)

## TradingView Setup

1. Go to your TradingView alert settings
2. Set the webhook URL to: `https://your-server.com/webhook`
3. Add the header: `x-webhook-secret: your-secret`
4. Configure the alert message with JSON payload matching the webhook format

Example TradingView alert message:
```
{"action": "{{strategy.order.action}}", "symbol": "{{ticker}}", "price": {{close}}, "stop": {{strategy.order.sl}}, "tp1": {{strategy.order.tp}}, "timeframe": "{{interval}}"}
```

## Message Format

The bot formats Telegram messages with:
- Direction indicator (🟢 LONG / 🔴 SHORT / ⚪ INFO)
- Symbol and timeframe
- Entry price, stop loss, take profits
- Risk-reward ratio calculation
- Timestamp in Bangkok timezone
- Thai language disclaimer

## Deployment

### Render
The bot includes built-in keep-alive functionality for Render. Set `RENDER_URL` in your environment variables.

### Other Platforms
Deploy to any platform that supports Node.js. Ensure the port is configurable via the `PORT` environment variable.

## License

ISC
