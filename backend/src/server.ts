import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';
import { fetchQuote } from './services/marketData';
import { CAC40_STOCKS } from './config/constants';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

const server = http.createServer(app);

// WebSocket server for real-time price updates
const wss = new WebSocketServer({ server, path: '/ws' });

const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] Client connected');
  clients.add(ws);

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'subscribe' && data.ticker) {
        console.log(`[WS] Client subscribed to ${data.ticker}`);
        // Send initial quote
        fetchQuote(data.ticker)
          .then((quote) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'quote', data: quote }));
            }
          })
          .catch((err) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', message: err.message }));
            }
          });
      }
    } catch {
      // Ignore invalid messages
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
    clients.delete(ws);
  });
});

// Broadcast price updates every 60 seconds
let broadcastInterval: NodeJS.Timeout;

function startBroadcast(): void {
  broadcastInterval = setInterval(async () => {
    if (clients.size === 0) return;

    // Pick a few random stocks to broadcast
    const randomStocks = CAC40_STOCKS
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    for (const stock of randomStocks) {
      try {
        const quote = await fetchQuote(stock.ticker);
        const message = JSON.stringify({ type: 'quote', data: quote });

        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      } catch {
        // Skip failed quotes silently
      }
    }
  }, 60000);
}

// Start the server
async function start(): Promise<void> {
  try {
    await connectDatabase();

    server.listen(PORT, () => {
      console.log(`[Server] HTTP server running on port ${PORT}`);
      console.log(`[Server] WebSocket server running on ws://localhost:${PORT}/ws`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    startBroadcast();
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  clearInterval(broadcastInterval);
  wss.close();
  server.close(() => {
    console.log('[Server] Closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received. Shutting down...');
  clearInterval(broadcastInterval);
  wss.close();
  server.close(() => {
    process.exit(0);
  });
});

start();
