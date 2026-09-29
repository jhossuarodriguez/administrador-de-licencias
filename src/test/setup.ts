import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

vi.mock('@prisma/client', () => ({
    Prisma: {
        Decimal: class { toNumber() { return 0 } },
    },
}))

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
    cleanup()
    server.resetHandlers()
})

afterAll(() => server.close())
