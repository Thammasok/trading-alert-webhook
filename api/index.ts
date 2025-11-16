import { Elysia } from 'elysia'
import LineController from './line/line.controller'

const LineCtr = new LineController()

export default new Elysia()
  .get('/', () => 'Hello Elysia!')
  .get('/api/v1/webhook', (context) => LineCtr.webhook(context))
  .compile()

// const app = new Elysia()

// app.get('/', () => {
//   return 'hello'
// })
// app.get('/api/v1/webhook', (context) => LineCtr.webhook(context))

// app.listen(3000)

// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
