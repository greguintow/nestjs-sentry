import * as Sentry from '@sentry/node'
import { SentryRequestMiddleware } from '../sentry-request.middleware'
import { SentryTracingMiddleware } from '../sentry-tracing.middleware'

describe('Sentry middlewares', () => {
  beforeAll(() => {
    Sentry.init({
      dsn: 'https://public@sentry.example.com/1',
      release: 'test',
      autoSessionTracking: true
    })
  })

  afterAll(() => Sentry.close())

  afterEach(() => jest.restoreAllMocks())

  it('SentryRequestMiddleware builds the request handler once, not per request', () => {
    const spy = jest.spyOn(Sentry.Handlers, 'requestHandler')
    const middleware = new SentryRequestMiddleware()
    const next = jest.fn()

    for (let i = 0; i < 3; i++) middleware.use({ headers: {} }, { once: jest.fn() }, next)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(3)
  })

  it('SentryRequestMiddleware does not start a new SessionFlusher per request', () => {
    const client = Sentry.getCurrentHub().getClient() as any
    const spy = jest.spyOn(client, 'initSessionFlusher')
    const middleware = new SentryRequestMiddleware()

    for (let i = 0; i < 3; i++) middleware.use({ headers: {} }, { once: jest.fn() }, jest.fn())

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('SentryTracingMiddleware builds the tracing handler once, not per request', () => {
    const spy = jest.spyOn(Sentry.Handlers, 'tracingHandler')
    const middleware = new SentryTracingMiddleware()
    const next = jest.fn()

    for (let i = 0; i < 3; i++) middleware.use({ headers: {} }, { once: jest.fn() }, next)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(3)
  })
})
