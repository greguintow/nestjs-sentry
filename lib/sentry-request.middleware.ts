import { Injectable, NestMiddleware } from '@nestjs/common'
import { Handlers } from '@sentry/node'

@Injectable()
export class SentryRequestMiddleware implements NestMiddleware {
  // Built on first request, not in the constructor: with forRootAsync, Sentry.init may not have run yet.
  private handler?: ReturnType<typeof Handlers.requestHandler>

  use(req: any, res: any, next: () => void) {
    this.handler ??= Handlers.requestHandler()
    return this.handler(req, res, next)
  }
}
