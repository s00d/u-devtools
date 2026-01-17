import { describe, it, expect } from 'vitest';
import { ViteRpcClient, ViteRpcServer } from '../src/index';

class MockTransport {
  listeners = new Map<string, (...args: unknown[]) => unknown>();
  peer?: MockTransport;
  originalSender?: MockTransport; // Track who sent the message

  on(event: string, fn: (...args: unknown[]) => unknown) {
    this.listeners.set(event, fn);
  }

  send(event: string, data: unknown) {
    process.nextTick(() => {
      if (this.peer) {
        // Send to peer's listeners
        const handler = this.peer.listeners.get(event);
        const sender = this; // Capture sender reference
        if (handler) {
          // ViteRpcServer expects handler(data, client) where client has send method
          // ViteRpcClient (HmrTransport) expects handler(data) only
          // Try calling with 2 parameters first (for server)
          const client = {
            send: (evt: string, payload: unknown) => {
              process.nextTick(() => {
                // When server sends response/event, route it back to the original sender
                sender.receive(evt, payload);
              });
            },
          };
          
          // Check handler length to determine if it's server or client handler
          if (handler.length === 2) {
            // Server handler expects (data, client)
            handler(data, client);
          } else {
            // Client handler expects (data) only
            handler(data);
          }
        } else {
          // If no handler found, route to receive (for direct event routing)
          this.peer.receive(event, data);
        }
      }
    });
  }

  receive(event: string, data: unknown) {
    // Call all registered listeners for this event
    const handler = this.listeners.get(event);
    if (handler) {
      handler(data);
    }
  }
}

describe('RPC Bridge', () => {
  it('should handle request-response cycle', async () => {
    const clientTransport = new MockTransport();
    const serverTransport = new MockTransport();

    clientTransport.peer = serverTransport;
    serverTransport.peer = clientTransport;

    const client = new ViteRpcClient(
      clientTransport as unknown as {
        send: (event: string, data: unknown) => void;
        on: (event: string, fn: (...args: unknown[]) => unknown) => void;
      },
      'ws://localhost:5173/__u-devtools-ws'
    );
    const server = new ViteRpcServer(
      serverTransport as unknown as {
        on: (event: string, fn: (...args: unknown[]) => unknown) => void;
        send: (event: string, data: unknown) => void;
      }
    );

    server.handle('math:add', ({ a, b }: { a: number; b: number }) => {
      return a + b;
    });

    const result = await client.call('math:add', { a: 5, b: 3 });

    expect(result).toBe(8);
  });

  it('should handle errors', async () => {
    const clientTransport = new MockTransport();
    const serverTransport = new MockTransport();
    clientTransport.peer = serverTransport;
    serverTransport.peer = clientTransport;

    const client = new ViteRpcClient(
      clientTransport as unknown as {
        send: (event: string, data: unknown) => void;
        on: (event: string, fn: (...args: unknown[]) => unknown) => void;
      },
      'ws://localhost:5173/__u-devtools-ws'
    );
    const server = new ViteRpcServer(
      serverTransport as unknown as {
        on: (event: string, fn: (...args: unknown[]) => unknown) => void;
        send: (event: string, data: unknown) => void;
      }
    );

    server.handle('error:throw', () => {
      throw new Error('Something went wrong');
    });

    await expect(client.call('error:throw')).rejects.toThrow('Something went wrong');
  });

  it('should handle events', async () => {
    const clientTransport = new MockTransport();
    const serverTransport = new MockTransport();
    clientTransport.peer = serverTransport;
    serverTransport.peer = clientTransport;

    const client = new ViteRpcClient(
      clientTransport as unknown as {
        send: (event: string, data: unknown) => void;
        on: (event: string, fn: (...args: unknown[]) => unknown) => void;
      },
      'ws://localhost:5173/__u-devtools-ws'
    );
    const server = new ViteRpcServer(
      serverTransport as unknown as {
        on: (event: string, fn: (...args: unknown[]) => unknown) => void;
        send: (event: string, data: unknown) => void;
      }
    );

    const events: unknown[] = [];

    client.on('test:event', (data) => {
      events.push(data);
    });

    server.broadcast('test:event', { message: 'Hello' });

    await new Promise((resolve) => process.nextTick(resolve));

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ message: 'Hello' });
  });
});
