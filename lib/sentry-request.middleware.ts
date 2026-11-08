import { Injectable, NestMiddleware } from '@nestjs/common'
import { Handlers } from '@sentry/node'

@Injectable()
export class SentryRequestMiddleware implements NestMiddleware {
  // Built on the first request because Sentry.init may not have run yet when forRootAsync constructs this middleware.
  private handler?: ReturnType<typeof Handlers.requestHandler>

  use(req: any, res: any, next: () => void) {
    this.handler ??= Handlers.requestHandler()
    return this.handler(req, res, next)
  }
}
