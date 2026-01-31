import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import * as Line from '@line/bot-sdk'

// create LINE SDK config from env variables
const config: Line.MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_SECRET as string
}

// create LINE SDK client
const client = new Line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string
})

function handleEvent(event: Line.MessageEvent) {
  console.log('event', event)
}

export default new Elysia()
  .use(swagger())
  .onRequest(() => {
    Line.middleware(config)
  })
  .get('/', () => 'Hello')
  .post('/api/v1/webhook', ({ body }) => console.log(body.events))
  .post('/api/v1/callback', async ({ body }) => {
    await Promise.all(body)
  })
  .compile()
