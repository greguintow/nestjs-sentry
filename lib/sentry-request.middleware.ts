import { Injectable, NestMiddleware } from '@nestjs/common'
import { Handlers } from '@sentry/node'

@Injectable()
export class SentryRequestMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    return Handlers.requestHandler()(req, res, next)
  }
}
