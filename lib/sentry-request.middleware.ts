import { Injectable, NestMiddleware } from '@nestjs/common'
import { Handlers } from '@sentry/node'

@Injectable()
export class SentryRequestMiddleware implements NestMiddleware {
  // Built once, on the first request so Sentry.init has run: each requestHandler() call starts a new SessionFlusher interval.
  private handler?: ReturnType<typeof Handlers.requestHandler>

  use(req: any, res: any, next: () => void) {
    this.handler ??= Handlers.requestHandler()

    return this.handler(req, res, next)
  }
}
