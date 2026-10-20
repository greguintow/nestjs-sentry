import { EventEmitter } from 'events'
import * as Sentry from '@sentry/node'
import { NodeClient } from '@sentry/node'

import { SentryRequestMiddleware } from '../sentry-request.middleware'
import { SentryTracingMiddleware } from '../sentry-tracing.middleware'

class NoopTransport {
  sendEvent() {
    return Promise.resolve({ status: 'success' })
  }

  sendSession() {
    return Promise.resolve({ status: 'success' })
  }

  close() {
    return Promise.resolve(true)
  }
}

const createRequest = () =>
  Object.assign(new EventEmitter(), { headers: {}, method: 'GET', url: '/' })
const createResponse = () => Object.assign(new EventEmitter(), { statusCode: 200 })

describe('SentryRequestMiddleware', () => {
  beforeAll(() => {
    Sentry.init({
      dsn: 'https://public@o0.ingest.sentry.io/0',
      release: '1.0.0',
      autoSessionTracking: true,
      transport: NoopTransport as any
    })
  })

  afterAll(() => Sentry.close())

  it('creates a single session flusher across many requests', () => {
    const client = Sentry.getCurrentHub().getClient<NodeClient>()
    const initSessionFlusher = jest.spyOn(client as NodeClient, 'initSessionFlusher')
    const middleware = new SentryRequestMiddleware()
    const next = jest.fn()

    for (let i = 0; i < 100; i++) middleware.use(createRequest(), createResponse(), next)

    expect(initSessionFlusher).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(100)
  })
})

describe('SentryTracingMiddleware', () => {
  it('builds the tracing handler once across many requests', () => {
    const tracingHandler = jest.spyOn(Sentry.Handlers, 'tracingHandler')
    const middleware = new SentryTracingMiddleware()
    const next = jest.fn()

    for (let i = 0; i < 100; i++) middleware.use(createRequest(), createResponse(), next)

    expect(tracingHandler).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledTimes(100)
  })
})
