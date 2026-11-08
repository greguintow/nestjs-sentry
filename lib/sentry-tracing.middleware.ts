import { Injectable, NestMiddleware } from '@nestjs/common'
import { Handlers } from '@sentry/node'

@Injectable()
export class SentryTracingMiddleware implements NestMiddleware {
  private handler?: ReturnType<typeof Handlers.tracingHandler>

  use(req: any, res: any, next: () => void) {
    this.handler ??= Handlers.tracingHandler()
    return this.handler(req, res, next)
  }
}
