import { Context } from 'elysia'

export default class LineController {
  constructor() {}

  async webhook(context: Context) {
    console.log('context', 'pass', context.params)
    return 'ok'
  }
}
