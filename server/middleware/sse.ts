import type { Response } from 'express';

export function setupSSE(res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  let ended = false;

  return {
    sendEvent(type: string, data: unknown) {
      if (ended) return;
      try {
        res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch {
        ended = true;
      }
    },
    end() {
      if (ended) return;
      ended = true;
      try {
        res.write('event: done\ndata: {}\n\n');
        res.end();
      } catch {
        // Already closed
      }
    },
  };
}
