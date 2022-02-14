// Nestjs imports
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import {
  HttpArgumentsHost,
  WsArgumentsHost,
  RpcArgumentsHost,
  ContextType
} from '@nestjs/common/interfaces'
// Rxjs imports
import { Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'
// Sentry imports
import { Scope } from '@sentry/hub'
import { Handlers } from '@sentry/node'

import { SentryService } from './sentry.service'
import { SentryInterceptorOptions, SentryInterceptorOptionsFilter } from './sentry.interfaces'

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  protected readonly client: SentryService = SentryService.SentryServiceInstance()
  constructor(private readonly options?: SentryInterceptorOptions) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError(exception => {
        if (this.shouldReport(exception)) {
          this.client.instance().withScope(scope => {
            this.captureException(context, scope, exception)
          })
        }
        throw exception
      })
    )
  }

  protected captureException(context: ExecutionContext, scope: Scope, exception: any) {
    switch (context.getType<ContextType>()) {
      case 'http':
        const http = context.switchToHttp()

        return Handlers.errorHandler({ shouldHandleError: () => true })(
          exception,
          http.getRequest(),
          http.getResponse(),
          () => {}
        )
      case 'rpc':
        return this.captureRpcException(scope, context.switchToRpc(), exception)
      case 'ws':
        return this.captureWsException(scope, context.switchToWs(), exception)
    }
  }

  private captureRpcException(scope: Scope, rpc: RpcArgumentsHost, exception: any): void {
    scope.setExtra('rpc_data', rpc.getData())

    this.client.instance().captureException(exception)
  }

  private captureWsException(scope: Scope, ws: WsArgumentsHost, exception: any): void {
    scope.setExtra('ws_client', ws.getClient())
    scope.setExtra('ws_data', ws.getData())

    this.client.instance().captureException(exception)
  }

  private shouldReport(exception: any) {
    if (this.options && !this.options.filters) return true

    // If all filters pass, then we do not report
    if (this.options) {
      const opts: SentryInterceptorOptions = this.options as {}
      if (opts.filters) {
        let filters: SentryInterceptorOptionsFilter[] = opts.filters
        return filters.every(({ type, filter }) => {
          return !(exception instanceof type && (!filter || filter(exception)))
        })
      }
    } else {
      return true
    }
  }
}
