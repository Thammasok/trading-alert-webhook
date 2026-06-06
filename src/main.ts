import express, {
  type Request,
  type Response,
  type NextFunction
} from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

// ── Types ──────────────────────────────────────────────────────────────────

interface WebhookPayload {
  action: 'BUY' | 'SELL' | 'INFO'
  symbol: string
  price: number
  stop?: number
  tp1?: number
  tp2?: number
  timeframe?: string
  signal?: string
}

// ── Config ─────────────────────────────────────────────────────────────────

const {
  TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID,
  WEBHOOK_SECRET = 'nutz-secret-2024',
  PORT = '3000'
} = process.env

if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  throw new Error('Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID in .env')
}

// ── Telegram Helper ────────────────────────────────────────────────────────

async function sendTelegram(message: string): Promise<void> {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`
  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML'
  })
}

// ── Format Message ─────────────────────────────────────────────────────────

function formatMessage(data: WebhookPayload): string {
  const {
    action,
    symbol,
    price,
    stop,
    tp1,
    tp2,
    timeframe = '4H',
    signal
  } = data
  const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })

  const emoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : '⚪'

  const direction =
    action === 'BUY' ? 'LONG' : action === 'SELL' ? 'SHORT' : 'INFO'

  // คำนวณ R:R
  let rrText = ''
  if (price && stop && tp1) {
    const risk = Math.abs(price - stop)
    const reward = Math.abs(tp1 - price)
    const rr = risk > 0 ? (reward / risk).toFixed(2) : '0'
    rrText = `\n📐 R:R 1:${rr}`
  }

  let msg = `${emoji} <b>Nutz Signal — ${direction}</b>\n\n`
  msg += `📊 <b>${symbol}</b> | ${timeframe} | ${now}\n`
  msg += `💰 Price: <b>$${Number(price).toLocaleString()}</b>`

  if (stop) msg += `\n🛑 Stop Loss: <b>$${Number(stop).toLocaleString()}</b>`
  if (tp1) msg += `\n🎯 TP1: <b>$${Number(tp1).toLocaleString()}</b>`
  if (tp2) msg += `\n🎯 TP2: <b>$${Number(tp2).toLocaleString()}</b>`

  msg += rrText
  if (signal) msg += `\n\n💡 <i>${signal}</i>`
  msg += `\n\n⚠️ ตรวจสอบกราฟก่อนเข้าออเดอร์ทุกครั้ง`

  return msg
}

// ── Middleware: ตรวจ Secret ────────────────────────────────────────────────

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-webhook-secret']
  if (secret !== WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

// ── Routes ─────────────────────────────────────────────────────────────────

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'Nutz Alert Bot is running 🚀' })
})

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Webhook จาก TradingView
app.post('/webhook', authMiddleware, async (req: Request, res: Response) => {
  const data = req.body as WebhookPayload

  if (!data.action || !data.symbol || !data.price) {
    res
      .status(400)
      .json({ error: 'Missing required fields: action, symbol, price' })
    return
  }

  console.log('📩 Received:', JSON.stringify(data, null, 2))

  try {
    const message = formatMessage(data)
    await sendTelegram(message)
    console.log('✅ Telegram sent')
    res.json({ status: 'ok' })
  } catch (err) {
    console.error('❌ Telegram error:', err)
    res.status(500).json({ error: 'Failed to send Telegram message' })
  }
})

// Test endpoint (ส่ง mock alert ไป Telegram)
app.post('/test', async (_req: Request, res: Response) => {
  const mockData: WebhookPayload = {
    action: 'BUY',
    symbol: 'BTCUSDT',
    price: 77000,
    stop: 74500,
    tp1: 80000,
    tp2: 82500,
    timeframe: '4H',
    signal: 'BOS Bullish + Volume Spike'
  }

  try {
    const message = formatMessage(mockData)
    await sendTelegram(message)
    res.json({ status: 'test sent', message })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// ── Start ──────────────────────────────────────────────────────────────────

app.listen(parseInt(PORT), () => {
  console.log(`🚀 Nutz Alert Bot running on port ${PORT}`)
})
