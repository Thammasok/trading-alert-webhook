import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'

export default new Elysia()
  .use(swagger())
  .get('/', () => 'Hello')
  .post('/api/v1/webhook', ({ body }) => console.log(body))
  .compile()
