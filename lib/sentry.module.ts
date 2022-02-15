import { Module, DynamicModule, MiddlewareConsumer } from '@nestjs/common'
import { HttpAdapterHost, ModuleRef } from '@nestjs/core'
import { SentryCoreModule } from './sentry-core.module'
import { SentryModuleOptions, SentryModuleAsyncOptions } from './sentry.interfaces'
import { SentryRequestMiddleware } from './sentry-request.middleware'
import { SentryTracingMiddleware } from './sentry-tracing.middleware'

@Module({})
export class SentryModule {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly moduleRef: ModuleRef
  ) {}

  public static forRoot(options: SentryModuleOptions): DynamicModule {
    return {
      module: SentryModule,
      imports: [SentryCoreModule.forRoot(options)]
    }
  }

  public static forRootAsync(options: SentryModuleAsyncOptions): DynamicModule {
    return {
      module: SentryModule,
      imports: [SentryCoreModule.forRootAsync(options)]
    }
  }

  configure(consumer: MiddlewareConsumer) {
    const adapterName = this.httpAdapterHost.httpAdapter?.constructor?.name

    if (adapterName === 'FastifyAdapter') {
      const sentryRequestMiddleware = new SentryRequestMiddleware()
      this.httpAdapterHost.httpAdapter
        .getInstance()
        .addHook('preHandler', (req: any, res: any, done: any) => {
          sentryRequestMiddleware.use(req, res, done)
        })
    } else {
      consumer.apply(SentryRequestMiddleware).forRoutes('*')
    }
  }
}
