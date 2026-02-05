import { Module, DynamicModule, MiddlewareConsumer } from '@nestjs/common'
import { SentryCoreModule } from './sentry-core.module'
import { SentryModuleOptions, SentryModuleAsyncOptions } from './sentry.interfaces'
import { SentryRequestMiddleware } from './sentry-request.middleware'

@Module({})
export class SentryModule {
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
    consumer.apply(SentryRequestMiddleware).forRoutes('*')
  }
}
