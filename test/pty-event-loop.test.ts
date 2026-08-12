import { describe, expect, it, spyOn } from 'bun:test'
import { SessionLifecycleManager } from '../src/plugin/pty/session-lifecycle.ts'

describe('PTY event loop', () => {
  it('schedules a host turn after receiving child output', async () => {
    const lifecycle = new SessionLifecycleManager()
    const setTimeoutSpy = spyOn(globalThis, 'setTimeout')

    const receivedData = new Promise<void>((resolve) => {
      lifecycle.spawn(
        {
          command: process.execPath,
          args: ['-e', "process.stdout.write('x')"],
          description: 'Event loop responsiveness test',
          parentSessionId: 'test',
        },
        () => resolve(),
        () => {}
      )
    })

    try {
      await receivedData
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0)
    } finally {
      setTimeoutSpy.mockRestore()
      lifecycle.clearAllSessions()
    }
  }, 10_000)
})
