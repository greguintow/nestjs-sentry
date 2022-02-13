import { Injectable, NestMiddleware } from '@nestjs/common'
import { Handlers } from '@sentry/node'

@Injectable()
export class SentryMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    Handlers.requestHandler()(req, res, next)
    Handlers.tracingHandler()(req, res, next)
    next()
  }
}
