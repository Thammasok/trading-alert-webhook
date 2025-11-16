import { Elysia } from 'elysia'
import LineController from './line/line.controller'

const LineCtr = new LineController()

export default new Elysia()
  .get('/', () => 'Hello Elysia!')
  .get('/api/v1/webhook', (context) => LineCtr.webhook(context))
  .compile()
