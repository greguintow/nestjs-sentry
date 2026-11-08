import { EventEmitter } from 'events'
import * as Sentry from '@sentry/node'
import { SentryRequestMiddleware } from '../sentry-request.middleware'
import { SentryTracingMiddleware } from '../sentry-tracing.middleware'

const REQUESTS = 5

const createRequest = () => ({ headers: {}, method: 'GET', url: '/health' })

describe('Sentry middlewares', () => {
  beforeAll(() => {
    Sentry.init({
      dsn: 'https://public@sentry.example.com/1',
      release: 'test-release',
      autoSessionTracking: true
    })
  })

  afterAll(() => Sentry.close())

  afterEach(() => jest.restoreAllMocks())

  describe('SentryRequestMiddleware', () => {
    it('should build the request handler once across requests', () => {
      const handler = jest.fn((_req, _res, next: () => void) => next())
      const requestHandler = jest.spyOn(Sentry.Handlers, 'requestHandler').mockReturnValue(handler)
      const middleware = new SentryRequestMiddleware()
      const next = jest.fn()

      for (let i = 0; i < REQUESTS; i++) middleware.use(createRequest(), new EventEmitter(), next)

      expect(requestHandler).toHaveBeenCalledTimes(1)
      expect(requestHandler).toHaveBeenCalledWith()
      expect(handler).toHaveBeenCalledTimes(REQUESTS)
      expect(handler).toHaveBeenCalledWith(createRequest(), expect.any(EventEmitter), next)
      expect(next).toHaveBeenCalledTimes(REQUESTS)
      expect(next).toHaveBeenCalledWith()
    })

    it('should start one session flusher instead of one per request', () => {
      const client = Sentry.getCurrentHub().getClient<Sentry.NodeClient>()!
      const initSessionFlusher = jest.spyOn(client, 'initSessionFlusher')
      const middleware = new SentryRequestMiddleware()

      for (let i = 0; i < REQUESTS; i++)
        middleware.use(createRequest(), new EventEmitter(), jest.fn())

      expect(initSessionFlusher).toHaveBeenCalledTimes(1)
      expect(initSessionFlusher).toHaveBeenCalledWith()
    })
  })

  describe('SentryTracingMiddleware', () => {
    it('should build the tracing handler once across requests', () => {
      const tracingHandler = jest.spyOn(Sentry.Handlers, 'tracingHandler')
      const middleware = new SentryTracingMiddleware()
      const next = jest.fn()

      for (let i = 0; i < REQUESTS; i++) middleware.use(createRequest(), new EventEmitter(), next)

      expect(tracingHandler).toHaveBeenCalledTimes(1)
      expect(tracingHandler).toHaveBeenCalledWith()
      expect(next).toHaveBeenCalledTimes(REQUESTS)
      expect(next).toHaveBeenCalledWith()
    })
  })
})
