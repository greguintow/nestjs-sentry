import { Injectable, NestMiddleware } from '@nestjs/common'
import { Handlers } from '@sentry/node'

@Injectable()
export class SentryTracingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    return Handlers.tracingHandler()(req, res, next)
  }
}
